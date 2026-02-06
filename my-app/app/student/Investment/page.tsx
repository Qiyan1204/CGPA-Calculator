"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
  Brush,
  ReferenceLine,
  Legend,
  Bar,
  ComposedChart,
} from "recharts";

type ChartType = "area" | "line" | "composed";

type StockData = {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

type TimeInterval = "10m" | "30m" | "1h" | "12h" | "1d" | "1w" | "1m" | "6m" | "1y";

type StockDataMap = Record<string, StockData>;

type AssetCategory = "all" | "stocks" | "crypto" | "forex";

const TIME_INTERVALS: { value: TimeInterval; label: string }[] = [
  { value: "10m", label: "10min" },
  { value: "30m", label: "30min" },
  { value: "1h", label: "1H" },
  { value: "12h", label: "12H" },
  { value: "1d", label: "1D" },
  { value: "1w", label: "1W" },
  { value: "1m", label: "1M" },
  { value: "6m", label: "6M" },
  { value: "1y", label: "1Y" },
];

// Predefined watchlist with different asset types
const PREDEFINED_ASSETS = {
  stocks: [
    { symbol: "AAPL", name: "Apple Inc.", emoji: "🍎" },
    { symbol: "MSFT", name: "Microsoft", emoji: "💻" },
    { symbol: "GOOGL", name: "Google", emoji: "🔍" },
    { symbol: "AMZN", name: "Amazon", emoji: "📦" },
    { symbol: "TSLA", name: "Tesla", emoji: "⚡" },
    { symbol: "META", name: "Meta", emoji: "👥" },
    { symbol: "NVDA", name: "NVIDIA", emoji: "🎮" },
    { symbol: "AMD", name: "AMD", emoji: "🔴" },
  ],
  crypto: [
    { symbol: "BINANCE:BTCUSDT", name: "Bitcoin", emoji: "₿" },
    { symbol: "BINANCE:ETHUSDT", name: "Ethereum", emoji: "Ξ" },
    { symbol: "BINANCE:BNBUSDT", name: "Binance Coin", emoji: "🟡" },
    { symbol: "BINANCE:SOLUSDT", name: "Solana", emoji: "◎" },
    { symbol: "BINANCE:ADAUSDT", name: "Cardano", emoji: "🔷" },
    { symbol: "BINANCE:XRPUSDT", name: "Ripple", emoji: "💧" },
  ],
  forex: [
    { symbol: "OANDA:EUR_USD", name: "EUR/USD", emoji: "🇪🇺" },
    { symbol: "OANDA:GBP_USD", name: "GBP/USD", emoji: "🇬🇧" },
    { symbol: "OANDA:USD_JPY", name: "USD/JPY", emoji: "🇯🇵" },
    { symbol: "OANDA:AUD_USD", name: "AUD/USD", emoji: "🇦🇺" },
    { symbol: "OANDA:USD_CHF", name: "USD/CHF", emoji: "🇨🇭" },
    { symbol: "OANDA:USD_CAD", name: "USD/CAD", emoji: "🇨🇦" },
  ],
};

// Load watchlist from localStorage
const loadWatchlistFromStorage = (): Array<{ symbol: string; name: string; emoji: string }> => {
  if (typeof window === "undefined") return PREDEFINED_ASSETS.stocks.slice(0, 6);
  const saved = localStorage.getItem("investment-watchlist");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return PREDEFINED_ASSETS.stocks.slice(0, 6);
    }
  }
  return PREDEFINED_ASSETS.stocks.slice(0, 6);
};

export default function InvestmentPage() {
  const [watchlist, setWatchlist] = useState<
    Array<{ symbol: string; name: string; emoji: string }>
  >([]);
  const [isClient, setIsClient] = useState(false);
  
  const [stockData, setStockData] = useState<StockDataMap>({});
  const [sparklineData, setSparklineData] = useState<Record<string, number[]>>({});
  const [selectedSymbol, setSelectedSymbol] = useState<string>("AAPL");
  const [selectedInterval, setSelectedInterval] = useState<TimeInterval>("1d");
  const [historyData, setHistoryData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [chartType, setChartType] = useState<ChartType>("area");
  const [customSymbol, setCustomSymbol] = useState("");
  const [addingCustom, setAddingCustom] = useState(false);
  const [showBrush, setShowBrush] = useState(true);
  const [compareSymbol, setCompareSymbol] = useState<string | null>(null);
  const [compareData, setCompareData] = useState<StockData[]>([]);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize from localStorage on client
  useEffect(() => {
    setIsClient(true);
    setWatchlist(loadWatchlistFromStorage());
  }, []);

  // Save watchlist to localStorage
  useEffect(() => {
    if (isClient && watchlist.length > 0) {
      localStorage.setItem("investment-watchlist", JSON.stringify(watchlist));
    }
  }, [watchlist, isClient]);

  // Get all available assets for the selected category
  const getAvailableAssets = () => {
    if (selectedCategory === "all") {
      return [
        ...PREDEFINED_ASSETS.stocks,
        ...PREDEFINED_ASSETS.crypto,
        ...PREDEFINED_ASSETS.forex,
      ];
    }
    return PREDEFINED_ASSETS[selectedCategory];
  };

  // Filter assets based on search query
  const filteredAssets = getAvailableAssets().filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if interval is intraday (requires real-time data)
  const isIntradayInterval = (interval: TimeInterval) => {
    return ["10m", "30m", "1h", "12h"].includes(interval);
  };

  // Check if asset is already in watchlist
  const isInWatchlist = (symbol: string) => {
    return watchlist.some((item) => item.symbol === symbol);
  };

  // Add asset to watchlist
  const addToWatchlist = (asset: { symbol: string; name: string; emoji: string }) => {
    if (!isInWatchlist(asset.symbol)) {
      setWatchlist([...watchlist, asset]);
      setShowAddAsset(false);
      setSearchQuery("");
    }
  };

  // Remove asset from watchlist
  const removeFromWatchlist = (symbol: string) => {
    const newWatchlist = watchlist.filter((item) => item.symbol !== symbol);
    setWatchlist(newWatchlist);
    if (selectedSymbol === symbol && newWatchlist.length > 0) {
      setSelectedSymbol(newWatchlist[0].symbol);
    }
  };

  // Add custom symbol
  const addCustomSymbol = async () => {
    if (!customSymbol.trim()) return;
    const symbol = customSymbol.toUpperCase().trim();
    
    if (isInWatchlist(symbol)) {
      setError(`${symbol} is already in your watchlist`);
      return;
    }

    setAddingCustom(true);
    setError(null);

    try {
      // Verify the symbol exists by fetching data
      const res = await fetch(`/api/finnhub?symbol=${symbol}&interval=1d&limit=1`);
      if (!res.ok) {
        throw new Error(`Symbol ${symbol} not found`);
      }
      const json = await res.json();
      if (!json.data || json.data.length === 0) {
        throw new Error(`No data available for ${symbol}`);
      }

      // Add to watchlist
      const newAsset = {
        symbol,
        name: symbol,
        emoji: "📈",
      };
      setWatchlist([...watchlist, newAsset]);
      setCustomSymbol("");
      setShowAddAsset(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to add ${symbol}`);
    } finally {
      setAddingCustom(false);
    }
  };

  // Fetch comparison data
  const fetchCompareData = async (symbol: string) => {
    try {
      const res = await fetch(`/api/finnhub?symbol=${symbol}&interval=${selectedInterval}`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        const sorted = [...json.data].sort(
          (a: StockData, b: StockData) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setCompareData(sorted);
      }
    } catch (err) {
      console.error("Error fetching comparison data:", err);
    }
  };

  // Handle compare symbol selection
  useEffect(() => {
    if (compareSymbol) {
      fetchCompareData(compareSymbol);
    } else {
      setCompareData([]);
    }
  }, [compareSymbol, selectedInterval]);

  // Fetch all stocks data including sparkline
  const fetchAllStocks = useCallback(async () => {
    if (watchlist.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      const promises = watchlist.map(async (asset) => {
        // Fetch current price
        const res = await fetch(`/api/finnhub?symbol=${asset.symbol}&interval=1d&limit=1`);
        if (!res.ok) {
          console.error(`Failed to fetch ${asset.symbol}`);
          return { symbol: asset.symbol, data: null, sparkline: [] };
        }
        const json = await res.json();

        // Fetch sparkline data (last 7 days)
        const sparkRes = await fetch(`/api/finnhub?symbol=${asset.symbol}&interval=1w`);
        let sparkline: number[] = [];
        if (sparkRes.ok) {
          const sparkJson = await sparkRes.json();
          if (sparkJson.data && sparkJson.data.length > 0) {
            sparkline = sparkJson.data.map((d: StockData) => d.close);
          }
        }

        return { symbol: asset.symbol, data: json.data?.[0] || null, sparkline };
      });

      const results = await Promise.all(promises);

      const newStockData: StockDataMap = {};
      const newSparklineData: Record<string, number[]> = {};
      results.forEach(({ symbol, data, sparkline }) => {
        if (data) {
          newStockData[symbol] = data;
        }
        if (sparkline && sparkline.length > 0) {
          newSparklineData[symbol] = sparkline;
        }
      });

      setStockData(newStockData);
      setSparklineData(newSparklineData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stock data");
      console.error("Error fetching stocks:", err);
    } finally {
      setLoading(false);
    }
  }, [watchlist]);

  // Fetch historical data for selected stock and interval
  const fetchHistory = useCallback(
    async (symbol: string, interval: TimeInterval) => {
      setLoadingHistory(true);
      setError(null);

      try {
        const res = await fetch(`/api/finnhub?symbol=${symbol}&interval=${interval}`);

        if (!res.ok) {
          const errorText = await res.text();
          console.error(`API response error:`, errorText);
          throw new Error(`Failed to fetch history: ${res.status}`);
        }

        const json = await res.json();

        if (json.error) {
          console.warn(`API warning for ${symbol}:`, json.error);
          setHistoryData([]);
          return;
        }

        if (json.data && json.data.length > 0) {
          const sorted = [...json.data].sort(
            (a: StockData, b: StockData) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          setHistoryData(sorted);
        } else {
          setHistoryData([]);
        }
      } catch (err) {
        console.error("Error fetching history:", err);
        // Don't set error for individual fetch failures, just clear data
        setHistoryData([]);
      } finally {
        setLoadingHistory(false);
      }
    },
    []
  );

  // Handle stock selection
  const handleSelectStock = useCallback(
    (symbol: string) => {
      setSelectedSymbol(symbol);
      fetchHistory(symbol, selectedInterval);
    },
    [selectedInterval, fetchHistory]
  );

  // Handle interval change
  const handleIntervalChange = useCallback(
    (interval: TimeInterval) => {
      setSelectedInterval(interval);
      fetchHistory(selectedSymbol, interval);
    },
    [selectedSymbol, fetchHistory]
  );

  // Auto-refresh for intraday intervals
  useEffect(() => {
    if (autoRefresh && isIntradayInterval(selectedInterval)) {
      refreshIntervalRef.current = setInterval(() => {
        fetchHistory(selectedSymbol, selectedInterval);
        fetchAllStocks();
      }, 30000); // Refresh every 30 seconds

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, selectedInterval, selectedSymbol, fetchHistory, fetchAllStocks]);

  // Initial data fetch
  useEffect(() => {
    fetchAllStocks();
    fetchHistory(selectedSymbol, selectedInterval);
  }, []);

  // Re-fetch when watchlist changes
  useEffect(() => {
    fetchAllStocks();
  }, [watchlist, fetchAllStocks]);

  // Format date based on interval
  const formatDateForInterval = (dateString: string, interval: TimeInterval) => {
    const date = new Date(dateString);

    // Intraday intervals - show time
    if (["10m", "30m", "1h", "12h"].includes(interval)) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (interval === "1d") {
      // 1D shows hourly data - show time with hour
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true,
      });
    } else if (["1w", "1m"].includes(interval)) {
      // 1W and 1M show daily data - show month and day
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else {
      // 6M and 1Y show weekly data - show month and year
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  // Calculate percentage change
  const calculateChange = (open: number, close: number) => {
    const change = close - open;
    const percentage = ((change / open) * 100).toFixed(2);
    return { change, percentage };
  };

  // Calculate chart statistics
  const getChartStats = () => {
    if (historyData.length === 0) return null;

    const prices = historyData.map((d) => d.close);
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const first = historyData[0].close;
    const last = historyData[historyData.length - 1].close;
    const change = last - first;
    const changePercent = ((change / first) * 100).toFixed(2);

    return { high, low, first, last, change, changePercent };
  };

  const chartStats = getChartStats();
  const selectedAsset = watchlist.find((a) => a.symbol === selectedSymbol);

  // Merge historyData with compareData for chart
  const mergedChartData = historyData.map((item, index) => {
    const compareItem = compareData[index];
    return {
      ...item,
      compareClose: compareItem?.close,
    };
  });
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Multi-Asset Dashboard
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddAsset(!showAddAsset)}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition text-sm font-medium"
              >
                ➕ Add Asset
              </button>
              <button
                onClick={() => {
                  fetchAllStocks();
                  fetchHistory(selectedSymbol, selectedInterval);
                }}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
              >
                🔄 Refresh
              </button>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                  autoRefresh
                    ? "bg-teal-500 text-white hover:bg-teal-600"
                    : "bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {autoRefresh ? "🟢 Live" : "⏸️ Paused"}
              </button>
            </div>
          </div>
          <p className="text-gray-600">
            Stocks, Crypto, and Forex - Real-time market data
          </p>
        </div>

        {/* Add Asset Modal */}
        {showAddAsset && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-teal-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add to Watchlist</h3>
              <button
                onClick={() => {
                  setShowAddAsset(false);
                  setSearchQuery("");
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 mb-4">
              {(["all", "stocks", "crypto", "forex"] as AssetCategory[]).map(
                (category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      selectedCategory === category
                        ? "bg-teal-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                )
              )}
            </div>

            {/* Search Bar */}
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            {/* Custom Symbol Input */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                🔍 Can&apos;t find your stock? Add any symbol:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter symbol (e.g., NFLX, DIS, BA)"
                  value={customSymbol}
                  onChange={(e) => setCustomSymbol(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && addCustomSymbol()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  onClick={addCustomSymbol}
                  disabled={addingCustom || !customSymbol.trim()}
                  className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingCustom ? "Adding..." : "Add"}
                </button>
              </div>
            </div>

            {/* Asset List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
              {filteredAssets.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => addToWatchlist(asset)}
                  disabled={isInWatchlist(asset.symbol)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition ${
                    isInWatchlist(asset.symbol)
                      ? "bg-gray-100 border-gray-300 cursor-not-allowed opacity-50"
                      : "bg-white border-gray-200 hover:border-teal-500 hover:bg-teal-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{asset.emoji}</span>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">{asset.symbol}</p>
                      <p className="text-sm text-gray-500">{asset.name}</p>
                    </div>
                  </div>
                  {isInWatchlist(asset.symbol) ? (
                    <span className="text-green-600">✓ Added</span>
                  ) : (
                    <span className="text-teal-600">+ Add</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Watchlist Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          {watchlist.map((asset) => {
            const data = stockData[asset.symbol];
            const isSelected = asset.symbol === selectedSymbol;

            return (
              <div
                key={asset.symbol}
                className={`cursor-pointer bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all relative ${
                  isSelected ? "ring-2 ring-teal-500 shadow-md" : ""
                }`}
              >
                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWatchlist(asset.symbol);
                  }}
                  className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                  title="Remove from watchlist"
                >
                  ✕
                </button>

                <div onClick={() => handleSelectStock(asset.symbol)}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{asset.emoji}</span>
                    <h3 className="font-bold text-sm truncate">{asset.symbol}</h3>
                    {loading && !data && (
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  {loading && !data ? (
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                    </div>
                  ) : data ? (
                    <>
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        ${data.close.toFixed(2)}
                      </p>
                      {(() => {
                        const { change, percentage } = calculateChange(
                          data.open,
                          data.close
                        );
                        const isPositive = change >= 0;
                        return (
                          <p
                            className={`text-sm font-semibold ${
                              isPositive ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {isPositive ? "↗" : "↘"} {isPositive ? "+" : ""}
                            {change.toFixed(2)} ({isPositive ? "+" : ""}
                            {percentage}%)
                          </p>
                        );
                      })()}
                      {/* Sparkline Mini Chart */}
                      {sparklineData[asset.symbol] && sparklineData[asset.symbol].length > 1 && (
                        <div className="mt-2 h-8">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sparklineData[asset.symbol].map((v, i) => ({ v, i }))}>
                              <Line
                                type="monotone"
                                dataKey="v"
                                stroke={sparklineData[asset.symbol][sparklineData[asset.symbol].length - 1] >= sparklineData[asset.symbol][0] ? "#22c55e" : "#ef4444"}
                                strokeWidth={1.5}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">No data</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Chart Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {/* Chart Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {selectedAsset && (
                  <span className="text-3xl">{selectedAsset.emoji}</span>
                )}
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedAsset?.name || selectedSymbol}
                </h2>
                {stockData[selectedSymbol] && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      ${stockData[selectedSymbol].close.toFixed(2)}
                    </span>
                    {(() => {
                      const { change, percentage } = calculateChange(
                        stockData[selectedSymbol].open,
                        stockData[selectedSymbol].close
                      );
                      const isPositive = change >= 0;
                      return (
                        <span
                          className={`text-lg font-semibold ${
                            isPositive ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {isPositive ? "+" : ""}
                          {change.toFixed(2)} ({isPositive ? "+" : ""}
                          {percentage}%)
                        </span>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Chart Stats */}
              {chartStats && (
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>H: ${chartStats.high.toFixed(2)}</span>
                  <span>L: ${chartStats.low.toFixed(2)}</span>
                  <span
                    className={
                      chartStats.change >= 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {chartStats.change >= 0 ? "+" : ""}
                    {chartStats.changePercent}%
                  </span>
                </div>
              )}
            </div>

            {/* Time Interval Selector */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
              {TIME_INTERVALS.map((interval) => (
                <button
                  key={interval.value}
                  onClick={() => handleIntervalChange(interval.value)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition whitespace-nowrap ${
                    selectedInterval === interval.value
                      ? "bg-white text-teal-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {interval.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Controls */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {/* Chart Type Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Chart:</span>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {(["area", "line", "composed"] as ChartType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      chartType === type
                        ? "bg-white text-teal-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {type === "area" ? "📈 Area" : type === "line" ? "📉 Line" : "📊 OHLC"}
                  </button>
                ))}
              </div>
            </div>

            {/* Brush Toggle */}
            <button
              onClick={() => setShowBrush(!showBrush)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                showBrush
                  ? "bg-teal-100 text-teal-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              🔍 {showBrush ? "Zoom On" : "Zoom Off"}
            </button>

            {/* Compare Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Compare:</span>
              <select
                value={compareSymbol || ""}
                onChange={(e) => setCompareSymbol(e.target.value || null)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">None</option>
                {watchlist
                  .filter((a) => a.symbol !== selectedSymbol)
                  .map((asset) => (
                    <option key={asset.symbol} value={asset.symbol}>
                      {asset.symbol}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Chart */}
          {loadingHistory ? (
            <div className="flex items-center justify-center h-[400px]">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading chart data...</p>
              </div>
            </div>
          ) : historyData.length > 0 ? (
            <>
              {chartType === "area" && (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart
                    data={mergedChartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorCompare" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => formatDateForInterval(d, selectedInterval)}
                      tick={{ fontSize: 12 }}
                      stroke="#94a3b8"
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={{ fontSize: 12 }}
                      stroke="#94a3b8"
                      tickFormatter={(value) => `$${value.toFixed(0)}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "0.75rem",
                        padding: "12px",
                      }}
                      formatter={(value: number | undefined, name?: string) => {
                        if (value === undefined) return ["N/A", name || "Price"];
                        const displayName = name === "compareClose" ? compareSymbol : (name || selectedSymbol);
                        return [`$${value.toFixed(2)}`, displayName];
                      }}
                      labelFormatter={(label) => {
                        const date = new Date(label);
                        if (isIntradayInterval(selectedInterval)) {
                          return date.toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                        }
                        return date.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        });
                      }}
                    />
                    {compareSymbol && <Legend />}
                    <Area
                      type="monotone"
                      dataKey="close"
                      name={selectedSymbol}
                      stroke="#14b8a6"
                      strokeWidth={2}
                      fill="url(#colorClose)"
                      dot={false}
                      activeDot={{ r: 6, fill: "#14b8a6" }}
                    />
                    {compareSymbol && compareData.length > 0 && (
                      <Area
                        type="monotone"
                        dataKey="compareClose"
                        name={compareSymbol}
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fill="url(#colorCompare)"
                        dot={false}
                        activeDot={{ r: 6, fill: "#8b5cf6" }}
                      />
                    )}
                    {showBrush && historyData.length > 5 && (
                      <Brush
                        dataKey="date"
                        height={30}
                        stroke="#14b8a6"
                        tickFormatter={(d) => formatDateForInterval(d, selectedInterval)}
                      />
                    )}
                    {chartStats && (
                      <ReferenceLine
                        y={chartStats.first}
                        stroke="#94a3b8"
                        strokeDasharray="5 5"
                        label={{ value: "Start", position: "insideTopRight", fontSize: 10 }}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              )}

              {chartType === "line" && (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={historyData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => formatDateForInterval(d, selectedInterval)}
                      tick={{ fontSize: 12 }}
                      stroke="#94a3b8"
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={{ fontSize: 12 }}
                      stroke="#94a3b8"
                      tickFormatter={(value) => `$${value.toFixed(0)}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "0.75rem",
                        padding: "12px",
                      }}
                      formatter={(value: number | undefined) => [
                        `$${(value ?? 0).toFixed(2)}`,
                        "Price",
                      ]}
                      labelFormatter={(label) => {
                        const date = new Date(label);
                        if (isIntradayInterval(selectedInterval)) {
                          return date.toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                        }
                        return date.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        });
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="close"
                      stroke="#14b8a6"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#14b8a6" }}
                      activeDot={{ r: 6, fill: "#14b8a6" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="high"
                      stroke="#22c55e"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="low"
                      stroke="#ef4444"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      dot={false}
                    />
                    {showBrush && historyData.length > 5 && (
                      <Brush
                        dataKey="date"
                        height={30}
                        stroke="#14b8a6"
                        tickFormatter={(d) => formatDateForInterval(d, selectedInterval)}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              )}

              {chartType === "composed" && (
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart
                    data={historyData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => formatDateForInterval(d, selectedInterval)}
                      tick={{ fontSize: 12 }}
                      stroke="#94a3b8"
                    />
                    <YAxis
                      yAxisId="price"
                      domain={["auto", "auto"]}
                      tick={{ fontSize: 12 }}
                      stroke="#94a3b8"
                      tickFormatter={(value) => `$${value.toFixed(0)}`}
                    />
                    <YAxis
                      yAxisId="range"
                      orientation="right"
                      domain={["auto", "auto"]}
                      tick={{ fontSize: 12 }}
                      stroke="#94a3b8"
                      tickFormatter={(value) => `$${value.toFixed(0)}`}
                      hide
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "0.75rem",
                        padding: "12px",
                      }}
                      formatter={(value: number | undefined, name?: string) => [
                        `$${(value ?? 0).toFixed(2)}`,
                        name ? name.charAt(0).toUpperCase() + name.slice(1) : "Price",
                      ]}
                      labelFormatter={(label) => {
                        const date = new Date(label);
                        return date.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        });
                      }}
                    />
                    <Legend />
                    <Bar
                      yAxisId="range"
                      dataKey="high"
                      name="High"
                      fill="#22c55e"
                      opacity={0.3}
                      barSize={8}
                    />
                    <Bar
                      yAxisId="range"
                      dataKey="low"
                      name="Low"
                      fill="#ef4444"
                      opacity={0.3}
                      barSize={8}
                    />
                    <Line
                      yAxisId="price"
                      type="monotone"
                      dataKey="open"
                      name="Open"
                      stroke="#f59e0b"
                      strokeWidth={1.5}
                      dot={false}
                    />
                    <Line
                      yAxisId="price"
                      type="monotone"
                      dataKey="close"
                      name="Close"
                      stroke="#14b8a6"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                    {showBrush && historyData.length > 5 && (
                      <Brush
                        dataKey="date"
                        height={30}
                        stroke="#14b8a6"
                        tickFormatter={(d) => formatDateForInterval(d, selectedInterval)}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-[400px]">
              <p className="text-gray-400">No data available</p>
            </div>
          )}
        </div>

        {/* Asset Details */}
        {stockData[selectedSymbol] && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Market Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Open</p>
                <p className="text-xl font-bold text-gray-900">
                  ${stockData[selectedSymbol].open.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Close</p>
                <p className="text-xl font-bold text-gray-900">
                  ${stockData[selectedSymbol].close.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Day High</p>
                <p className="text-xl font-bold text-green-600">
                  ${stockData[selectedSymbol].high.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Day Low</p>
                <p className="text-xl font-bold text-red-600">
                  ${stockData[selectedSymbol].low.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Data Source: Finnhub API • {watchlist.length} assets in watchlist
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Last updated: {new Date().toLocaleTimeString("en-US")}
          </p>
        </div>
      </div>
    </div>
  );
}
