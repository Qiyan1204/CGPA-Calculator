"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type StockData = {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export default function InvestmentPage() {
  const [stocks, setStocks] = useState<string[]>(["AAPL", "TSLA", "MSFT"]);
  const [stockData, setStockData] = useState<Record<string, StockData>>({});
  const [selectedSymbol, setSelectedSymbol] = useState<string>("AAPL");
  const [historyData, setHistoryData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // 批量获取多支股票最新数据
  useEffect(() => {
    const fetchAllStocks = async () => {
      for (const s of stocks) {
        const res = await fetch(`/api/marketstack?symbol=${s}&limit=1`);
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setStockData((prev) => ({ ...prev, [s]: json.data[0] }));
        }
      }
    };
    fetchAllStocks();
  }, [stocks]);

  // 获取选中股票历史数据
  const fetchHistory = async (symbol: string) => {
    setLoadingHistory(true);
    const res = await fetch(`/api/marketstack?symbol=${symbol}&limit=10`);
    const json = await res.json();
    if (json.data && json.data.length > 0) {
      // 按日期升序排列
      const sorted = json.data.sort(
        (a: StockData, b: StockData) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setHistoryData(sorted);
    }
    setLoadingHistory(false);
  };

  // 点击股票显示详细信息
  const handleSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
    fetchHistory(symbol);
  };

  useEffect(() => {
    fetchHistory(selectedSymbol);
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-2">Market Data Overview</h1>
      <p className="text-gray-600 mb-6">
        Real-time and historical stock market data powered by MarketStack.
      </p>

      {/* 股票列表 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {stocks.map((s) => {
          const d = stockData[s];
          const change = d ? d.close - d.open : 0;
          return (
            <div
              key={s}
              onClick={() => handleSelect(s)}
              className="cursor-pointer bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              <h3 className="font-semibold text-lg">{s}</h3>
              {d ? (
                <>
                  <p>Open: {d.open}</p>
                  <p>Close: {d.close}</p>
                  <p className={change >= 0 ? "text-green-600" : "text-red-600"}>
                    Change: {change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2)}
                  </p>
                </>
              ) : (
                <p>Loading...</p>
              )}
            </div>
          );
        })}
      </div>

      {/* 选中股票详细信息 */}
      <div className="bg-white border rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">{selectedSymbol} Details</h2>
        {stockData[selectedSymbol] ? (
          <>
            <p>Open: {stockData[selectedSymbol].open}</p>
            <p>Close: {stockData[selectedSymbol].close}</p>
            <p>High: {stockData[selectedSymbol].high}</p>
            <p>Low: {stockData[selectedSymbol].low}</p>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      {/* 历史价格折线图 */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Last 10 Days Price</h3>
        {loadingHistory ? (
          <p>Loading chart...</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historyData}>
              <XAxis dataKey="date" tickFormatter={(d) => d.split("T")[0]} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="close" stroke="#14b8a6" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer */}
      <p className="text-xs text-gray-400 mt-6">
        Data Source: MarketStack API
      </p>
    </div>
  );
}
