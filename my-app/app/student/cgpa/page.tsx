"use client";

import { useEffect, useState } from "react";
import AIChatbot from '@/app/components/AIChatbot';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function GpaTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  const diff =
    data.prevGpa !== undefined
      ? Number((data.gpa - data.prevGpa).toFixed(2))
      : null;

  const color =
    diff === null
      ? "text-slate-500"
      : diff > 0
      ? "text-green-600"
      : diff < 0
      ? "text-red-600"
      : "text-slate-500";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm shadow-lg">
      <div className="font-bold mb-1">{data.semester}</div>
      <div>GPA: {data.gpa.toFixed(2)}</div>
      {diff !== null && (
        <div className={`mt-1 font-semibold ${color}`}>
          {diff > 0 && "+"}
          {diff.toFixed(2)} compared to last semester
        </div>
      )}
    </div>
  );
}

export default function CgpaPage() {
  const [studentId, setStudentId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [courses, setCourses] = useState<any[]>([]);
  const [course, setCourse] = useState("");
  const [grade, setGrade] = useState("A+");
  const [credit, setCredit] = useState(3);
  const [semester, setSemester] = useState("Y1S1");
  const [results, setResults] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const gradeMap: any = {
    "A+": 4.0,
    A: 4.0,
    "A-": 3.67,
    "B+": 3.33,
    B: 3.0,
    "B-": 2.67,
    "C+": 2.33,
    C: 2.0,
    F: 0.0,
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.id) {
      setStudentId(user.id);
    }

    fetchCourses();
  }, []);

  useEffect(() => {
    if (studentId) {
      fetchResults();
    }
  }, [studentId]);

  async function fetchCourses() {
    const res = await fetch("/api/courses");
    const data = await res.json();
    setCourses(data.courses || []);
  }

  async function fetchResults() {
    const res = await fetch(`/api/results?studentId=${studentId}`);
    const data = await res.json();
    setResults(data.results || []);
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure to delete this result?")) return;

    await fetch(`/api/results?id=${id}`, {
      method: "DELETE",
    });

    fetchResults();
  }

  async function handleSave(r: any) {
    await fetch("/api/results", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: r.id,
        grade: r.grade,
        gradePoint: gradeMap[r.grade],
        credit: r.credit,
        semester: r.semester,
      }),
    });

    setEditingId(null);
    fetchResults();
  }

  async function handleAdd() {
    if (!course) {
      setMessage("Please select course");
      return;
    }

    if (!studentId) {
      setMessage("Student not logged in");
      return;
    }

    const res = await fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        courseId: Number(course),
        grade,
        gradePoint: gradeMap[grade],
        credit,
        semester,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "Failed to add result");
      return;
    }

    setMessage("Result added successfully!");
    setCourse("");
    fetchResults();
    
    setTimeout(() => setMessage(""), 3000);
  }

  function buildSemesterChartData(results: any[]) {
    const map: Record<string, { points: number; credits: number }> = {};

    results.forEach((r) => {
      if (!map[r.semester]) {
        map[r.semester] = { points: 0, credits: 0 };
      }
      map[r.semester].points += r.gradePoint * r.credit;
      map[r.semester].credits += r.credit;
    });

    return Object.keys(map).map((sem) => ({
      semester: sem,
      gpa: Number((map[sem].points / map[sem].credits).toFixed(2)),
    }));
  }

  function buildChartWithTrend(results: any[]) {
    const chartData = buildSemesterChartData(results);
    chartData.sort((a, b) => a.semester.localeCompare(b.semester));

    return chartData.map((item, index) => {
      const prev = chartData[index - 1];
      const trend =
        !prev ? "same" : item.gpa > prev.gpa ? "up" : item.gpa < prev.gpa ? "down" : "same";
      return {
        ...item,
        trend,
        prevGpa: prev?.gpa,
      };
    });
  }

  const chartData = buildChartWithTrend(results);

  function groupBySemester(data: any[]) {
    const groups: Record<string, any[]> = {};

    data.forEach((r) => {
      const sem = r.semester || "Unknown";
      if (!groups[sem]) groups[sem] = [];
      groups[sem].push(r);
    });

    return groups;
  }

  function calcSemesterAvg(results: any[]) {
    let totalPoints = 0;
    let totalCredits = 0;

    results.forEach((r) => {
      totalPoints += r.gradePoint * r.credit;
      totalCredits += r.credit;
    });

    return totalCredits ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  }

  function calculateCGPA() {
    let totalPoints = 0;
    let totalCredits = 0;

    results.forEach((r) => {
      totalPoints += r.gradePoint * r.credit;
      totalCredits += r.credit;
    });

    return totalCredits ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  }

  // Generate Professional Academic Transcript Image
  async function generateShareImage() {
    const grouped = groupBySemester(results);
    const semesters = Object.keys(grouped).sort();
    
    // Calculate canvas height based on number of courses
    const headerHeight = 500;
    const semesterHeaderHeight = 90;
    const courseLineHeight = 70;
    const footerHeight = 120;
    
    let totalHeight = headerHeight + footerHeight;
    semesters.forEach(sem => {
      totalHeight += semesterHeaderHeight;
      totalHeight += grouped[sem].length * courseLineHeight;
      totalHeight += 60;
    });
    
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = Math.max(totalHeight, 1400);
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const headerGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    headerGradient.addColorStop(0, '#0891b2');
    headerGradient.addColorStop(1, '#06b6d4');
    ctx.fillStyle = headerGradient;
    ctx.fillRect(0, 0, canvas.width, 180);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(100, 90, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('📚', 100, 105);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('ACADEMIC TRANSCRIPT', 180, 95);
    
    ctx.font = '28px Arial';
    ctx.fillText('Official Results Summary', 180, 135);

    const contentStartY = 220;
    ctx.fillStyle = '#1e293b';
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 80, contentStartY);

    const boxStartY = contentStartY + 60;
    ctx.fillStyle = '#f0f9ff';
    ctx.fillRect(80, boxStartY, 480, 160);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.strokeRect(80, boxStartY, 480, 160);
    
    ctx.fillStyle = '#64748b';
    ctx.font = '28px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Cumulative GPA', 100, boxStartY + 45);
    
    const cgpa = calculateCGPA();
    ctx.fillStyle = '#0891b2';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(cgpa, 320, boxStartY + 130);

    ctx.fillStyle = '#f0f9ff';
    ctx.fillRect(640, boxStartY, 480, 160);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.strokeRect(640, boxStartY, 480, 160);
    
    ctx.fillStyle = '#64748b';
    ctx.font = '28px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Total Credit Hours Earned', 660, boxStartY + 45);
    
    const totalCredits = results.reduce((sum, r) => sum + r.credit, 0);
    ctx.fillStyle = '#0891b2';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(totalCredits.toString(), 880, boxStartY + 130);

    let yPos = boxStartY + 240;
    
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('COURSE DETAILS', 80, yPos);
    
    yPos += 20;
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, yPos);
    ctx.lineTo(canvas.width - 80, yPos);
    ctx.stroke();
    
    yPos += 50;

    semesters.forEach((sem, semIndex) => {
      const semesterCourses = grouped[sem];
      const semGpa = calcSemesterAvg(semesterCourses);
      
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(80, yPos - 35, canvas.width - 160, 65);
      
      ctx.fillStyle = '#0369a1';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(sem, 100, yPos);
      
      ctx.fillStyle = '#0891b2';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`Semester GPA: ${semGpa}`, canvas.width - 100, yPos);
      
      yPos += 60;
      
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Course Name', 120, yPos);
      ctx.textAlign = 'right';
      ctx.fillText('Grade', canvas.width - 100, yPos);
      
      yPos += 15;
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(100, yPos);
      ctx.lineTo(canvas.width - 100, yPos);
      ctx.stroke();
      
      yPos += 30;
      
      semesterCourses.forEach((course, courseIndex) => {
        if (courseIndex % 2 === 0) {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(80, yPos - 25, canvas.width - 160, 70);
        }
        
        ctx.fillStyle = '#334155';
        ctx.font = '26px Arial';
        ctx.textAlign = 'left';
        
        const maxWidth = 780;
        let courseName = course.course.courseName;
        let textWidth = ctx.measureText(courseName).width;
        
        while (textWidth > maxWidth && courseName.length > 3) {
          courseName = courseName.substring(0, courseName.length - 1);
          textWidth = ctx.measureText(courseName + '...').width;
        }
        if (textWidth > maxWidth) {
          courseName = courseName + '...';
        }
        
        ctx.fillText(courseName, 120, yPos);
        
        const gradeX = canvas.width - 180;
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(gradeX, yPos - 22, 80, 40);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(course.grade, gradeX + 40, yPos + 5);
        
        yPos += 70;
      });
      
      yPos += 30;
      
      if (semIndex < semesters.length - 1) {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(80, yPos);
        ctx.lineTo(canvas.width - 80, yPos);
        ctx.stroke();
        yPos += 30;
      }
    });

    yPos = canvas.height - 60;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('This is an unofficial transcript for personal use only', canvas.width / 2, yPos);
    ctx.fillText(`Generated on ${new Date().toLocaleDateString()}`, canvas.width / 2, yPos + 30);

    return canvas;
  }

  async function copyImageToClipboard(blob: Blob) {
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to copy image to clipboard:', error);
      return false;
    }
  }

  async function shareToWhatsApp() {
    try {
      const canvas = await generateShareImage();
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        await copyImageToClipboard(blob);
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'academic-results.png';
        a.click();
        URL.revokeObjectURL(url);
        
        setTimeout(() => {
          window.open('https://web.whatsapp.com/', '_blank');
        }, 1000);
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate image. Please try again.');
    }
  }

  async function shareToInstagram() {
    try {
      const canvas = await generateShareImage();
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        const copied = await copyImageToClipboard(blob);
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'academic-results.png';
        a.click();
        URL.revokeObjectURL(url);
        
        if (copied) {
          alert('✅ Image copied to clipboard and downloaded!\nYou can paste it directly in Instagram.');
        } else {
          alert('✅ Image downloaded!\nPlease manually upload it to Instagram.');
        }
        
        setTimeout(() => {
          window.open('https://www.instagram.com/', '_blank');
        }, 1000);
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to download image. Please try again.');
    }
  }

  async function shareToFacebook() {
    try {
      const canvas = await generateShareImage();
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        const copied = await copyImageToClipboard(blob);
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'academic-results.png';
        a.click();
        URL.revokeObjectURL(url);
        
        if (copied) {
          alert('✅ Image copied to clipboard and downloaded!\nYou can paste it directly in Facebook.');
        } else {
          alert('✅ Image downloaded!\nPlease manually upload it to Facebook.');
        }
        
        setTimeout(() => {
          window.open('https://www.facebook.com/', '_blank');
        }, 1000);
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate image. Please try again.');
    }
  }

  async function shareToTwitter() {
    try {
      const canvas = await generateShareImage();
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        const copied = await copyImageToClipboard(blob);
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'academic-results.png';
        a.click();
        URL.revokeObjectURL(url);
        
        if (copied) {
          alert('✅ Image copied to clipboard and downloaded!\nYou can paste it directly in Twitter/X.');
        } else {
          alert('✅ Image downloaded!\nPlease manually upload it to Twitter/X.');
        }
        
        setTimeout(() => {
          window.open('https://twitter.com/intent/tweet', '_blank');
        }, 1000);
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to download image. Please try again.');
    }
  }

  async function downloadImage() {
    try {
      const canvas = await generateShareImage();
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'academic-results.png';
        a.click();
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    }
  }

  async function downloadAsPDF() {
    try {
      const { default: jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      
      const doc = new jsPDF();
      
      const cgpa = calculateCGPA();
      const totalCourses = results.length;
      const totalCredits = results.reduce((sum, r) => sum + r.credit, 0);
      
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Academic Results Report', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Overall CGPA: ${cgpa}`, 20, 40);
      doc.text(`Total Courses: ${totalCourses}`, 20, 50);
      doc.text(`Total Credits: ${totalCredits}`, 20, 60);
      
      let yPos = 70;
      if (chartData.length > 0) {
        try {
          const chartElement = document.querySelector('.recharts-wrapper');
          if (chartElement) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Semester GPA Trend', 20, yPos);
            yPos += 10;
            
            const canvas = await html2canvas(chartElement as HTMLElement, {
              backgroundColor: '#ffffff',
              scale: 2
            });
            
            const chartImgData = canvas.toDataURL('image/png');
            const imgWidth = 170;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            doc.addImage(chartImgData, 'PNG', 20, yPos, imgWidth, imgHeight);
            
            yPos += imgHeight + 10;
          }
        } catch (error) {
          console.error('Error adding chart to PDF:', error);
        }
      }
      
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Semester Breakdown', 20, yPos);
      
      yPos += 15;
      const grouped = groupBySemester(results);
      
      Object.keys(grouped).sort().forEach((sem) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${sem} - GPA: ${calcSemesterAvg(grouped[sem])}`, 20, yPos);
        yPos += 10;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        grouped[sem].forEach((r) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(`  ${r.course.courseName}`, 25, yPos);
          doc.text(`Grade: ${r.grade}`, 120, yPos);
          doc.text(`Credits: ${r.credit}`, 160, yPos);
          yPos += 7;
        });
        
        yPos += 5;
      });
      
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 295, { align: 'center' });
      }
      
      doc.save('academic-results.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  }

  async function handlePrint() {
    try {
      setShowPrintModal(false);
      
      const loadingMsg = document.createElement('div');
      loadingMsg.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      loadingMsg.innerHTML = `
        <div class="bg-white rounded-lg p-6 text-center">
          <div class="text-4xl mb-4">⏳</div>
          <div class="text-lg font-semibold text-gray-900">Preparing document...</div>
          <div class="text-sm text-gray-600 mt-2">Please wait while we generate your PDF</div>
        </div>
      `;
      document.body.appendChild(loadingMsg);
      
      const { default: jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      
      const doc = new jsPDF();
      
      const cgpa = calculateCGPA();
      const totalCourses = results.length;
      const totalCredits = results.reduce((sum, r) => sum + r.credit, 0);
      
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Academic Results Report', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Overall CGPA: ${cgpa}`, 20, 40);
      doc.text(`Total Courses: ${totalCourses}`, 20, 50);
      doc.text(`Total Credits: ${totalCredits}`, 20, 60);
      
      let yPos = 70;
      if (chartData.length > 0) {
        try {
          const chartElement = document.querySelector('.recharts-wrapper');
          if (chartElement) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Semester GPA Trend', 20, yPos);
            yPos += 10;
            
            const canvas = await html2canvas(chartElement as HTMLElement, {
              backgroundColor: '#ffffff',
              scale: 2
            });
            
            const chartImgData = canvas.toDataURL('image/png');
            const imgWidth = 170;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            doc.addImage(chartImgData, 'PNG', 20, yPos, imgWidth, imgHeight);
            
            yPos += imgHeight + 10;
          }
        } catch (error) {
          console.error('Error adding chart to PDF:', error);
        }
      }
      
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Semester Breakdown', 20, yPos);
      
      yPos += 15;
      const grouped = groupBySemester(results);
      
      Object.keys(grouped).sort().forEach((sem) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${sem} - GPA: ${calcSemesterAvg(grouped[sem])}`, 20, yPos);
        yPos += 10;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        grouped[sem].forEach((r) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(`  ${r.course.courseName}`, 25, yPos);
          doc.text(`Grade: ${r.grade}`, 120, yPos);
          doc.text(`Credits: ${r.credit}`, 160, yPos);
          yPos += 7;
        });
        
        yPos += 5;
      });
      
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 295, { align: 'center' });
      }
      
      document.body.removeChild(loadingMsg);
      
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      const printWindow = window.open(pdfUrl);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      } else {
        doc.save('academic-results.pdf');
      }
    } catch (error) {
      console.error('Error printing:', error);
      alert('Failed to prepare document for printing. Please try again.');
    }
  }

  const grouped = groupBySemester(results);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">CGPA Calculator</h1>
            <p className="text-gray-600">
              Track your academic performance and calculate your cumulative GPA.
            </p>
          </div>
          
          {results.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowPrintModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <span className="text-xl">🖨️</span>
                Print
              </button>
              
              <button
                onClick={() => setShowShareModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <span className="text-xl">📤</span>
                Share
              </button>
            </div>
          )}
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:border-cyan-300 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-cyan-500">{calculateCGPA()}</div>
                <div className="text-sm text-gray-600 mt-1">Overall CGPA</div>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:border-cyan-300 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-cyan-500">{results.length}</div>
                <div className="text-sm text-gray-600 mt-1">Total Courses</div>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:border-cyan-300 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-cyan-500">
                  {results.reduce((sum, r) => sum + r.credit, 0)}
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Credits</div>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎓</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center text-xl">
              ➕
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Add New Result</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
              <select
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.courseName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
              <select
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              >
                {Object.keys(gradeMap).map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Credit Hours</label>
              <input
                type="number"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                value={credit}
                onChange={(e) => setCredit(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
              <select
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              >
                <option>Y1S1</option>
                <option>Y1S2</option>
                <option>Y1S3</option>
                <option>Y2S1</option>
                <option>Y2S2</option>
                <option>Y2S3</option>
                <option>Y3S1</option>
                <option>Y3S2</option>
                <option>Y3S3</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="px-6 py-2.5 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition-colors"
          >
            Add Result
          </button>
        </div>

        {chartData.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center text-xl">
                📈
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Semester GPA Trend</h2>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="semester" stroke="#6b7280" />
                <YAxis domain={[0, 4]} stroke="#6b7280" />
                <Tooltip content={<GpaTooltip />} />
                <Line
                  type="monotone"
                  dataKey="gpa"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#06b6d4" }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              {chartData.map((d) => (
                <div
                  key={d.semester}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                >
                  <div className="text-sm font-medium text-gray-700">{d.semester}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lg font-bold text-gray-900">{d.gpa.toFixed(2)}</span>
                    <span
                      className={`text-sm font-semibold ${
                        d.trend === "up"
                          ? "text-green-600"
                          : d.trend === "down"
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      {d.trend === "up" ? "↑" : d.trend === "down" ? "↓" : "→"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center text-xl">
              📋
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Course Results</h2>
          </div>

          {Object.keys(grouped).length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📚</div>
              <p className="text-gray-600 mb-2">No results added yet</p>
              <p className="text-sm text-gray-500">Start by adding your first course result above</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.keys(grouped)
                .sort()
                .map((sem) => (
                  <div key={sem} className="border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">{sem}</h3>
                      <div className="text-sm">
                        <span className="text-gray-600">Semester GPA: </span>
                        <span className="font-bold text-cyan-600">{calcSemesterAvg(grouped[sem])}</span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Course</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Grade</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Credits</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Points</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {grouped[sem].map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">{r.course.courseName}</td>

                              {editingId === r.id ? (
                                <>
                                  <td className="px-4 py-3">
                                    <select
                                      className="p-1.5 border border-gray-300 rounded text-sm"
                                      value={r.grade}
                                      onChange={(e) =>
                                        setResults((prev) =>
                                          prev.map((x) =>
                                            x.id === r.id
                                              ? {
                                                  ...x,
                                                  grade: e.target.value,
                                                  gradePoint: gradeMap[e.target.value],
                                                }
                                              : x
                                          )
                                        )
                                      }
                                    >
                                      {Object.keys(gradeMap).map((g) => (
                                        <option key={g}>{g}</option>
                                      ))}
                                    </select>
                                  </td>

                                  <td className="px-4 py-3">
                                    <input
                                      type="number"
                                      className="w-20 p-1.5 border border-gray-300 rounded text-sm"
                                      value={r.credit}
                                      onChange={(e) =>
                                        setResults((prev) =>
                                          prev.map((x) =>
                                            x.id === r.id ? { ...x, credit: Number(e.target.value) } : x
                                          )
                                        )
                                      }
                                    />
                                  </td>

                                  <td className="px-4 py-3 text-sm text-gray-900">{r.gradePoint.toFixed(2)}</td>

                                  <td className="px-4 py-3">
                                    <button
                                      onClick={() => handleSave(r)}
                                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                                    >
                                      Save
                                    </button>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-4 py-3 text-sm">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                                      {r.grade}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{r.credit}</td>
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                    {r.gradePoint.toFixed(2)}
                                  </td>

                                  <td className="px-4 py-3 space-x-3">
                                    <button
                                      onClick={() => setEditingId(r.id)}
                                      className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDelete(r.id)}
                                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {showPrintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">🖨️</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                Print Your Results
              </h3>
              <p className="text-gray-600">
                Choose your preferred format to print or save your academic transcript
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={handlePrint}
                className="w-full flex items-center gap-4 p-5 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
              >
                <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
                  📄
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-gray-900 text-lg">Print PDF with Graph</div>
                  <div className="text-sm text-gray-600">Generate PDF including your GPA chart</div>
                </div>
                <span className="text-gray-400 group-hover:text-purple-500 text-2xl transition-colors">→</span>
              </button>

              <button
                onClick={() => {
                  setShowPrintModal(false);
                  downloadAsPDF();
                }}
                className="w-full flex items-center gap-4 p-5 bg-red-50 hover:bg-red-100 rounded-xl transition-all group border-2 border-transparent hover:border-red-200"
              >
                <div className="w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
                  💾
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-gray-900 text-lg">Download as PDF</div>
                  <div className="text-sm text-gray-600">Save PDF with graph to your device</div>
                </div>
                <span className="text-gray-400 group-hover:text-red-500 text-2xl transition-colors">→</span>
              </button>

              <button
                onClick={() => {
                  setShowPrintModal(false);
                  downloadImage();
                }}
                className="w-full flex items-center gap-4 p-5 bg-cyan-50 hover:bg-cyan-100 rounded-xl transition-all group border-2 border-transparent hover:border-cyan-200"
              >
                <div className="w-14 h-14 bg-cyan-500 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
                  🖼️
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-gray-900 text-lg">Download as Image</div>
                  <div className="text-sm text-gray-600">Save a high-quality PNG image</div>
                </div>
                <span className="text-gray-400 group-hover:text-cyan-500 text-2xl transition-colors">→</span>
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <span className="text-blue-500 text-xl">💡</span>
                <div className="flex-1">
                  <p className="text-sm text-blue-800 font-medium mb-1">Quick Tip</p>
                  <p className="text-xs text-blue-700">
                    Print PDF with Graph gives you a complete report with your GPA trend chart included.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowPrintModal(false)}
              className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Share Your Results</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              📋 <strong>Auto-copy enabled!</strong> Image will be copied to clipboard and downloaded automatically.
            </p>

            <div className="space-y-3">
              <button
                onClick={shareToWhatsApp}
                className="w-full flex items-center gap-4 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
              >
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl">
                  📱
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-gray-900">WhatsApp</div>
                  <div className="text-sm text-gray-600">Copy, download & open WhatsApp</div>
                </div>
                <span className="text-gray-400 group-hover:text-gray-600">→</span>
              </button>

              <button
                onClick={shareToInstagram}
                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg transition-colors group"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl">
                  📸
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-gray-900">Instagram</div>
                  <div className="text-sm text-gray-600">Copy, download & open Instagram</div>
                </div>
                <span className="text-gray-400 group-hover:text-gray-600">→</span>
              </button>

              <button
                onClick={shareToFacebook}
                className="w-full flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl">
                  👥
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-gray-900">Facebook</div>
                  <div className="text-sm text-gray-600">Copy, download & open Facebook</div>
                </div>
                <span className="text-gray-400 group-hover:text-gray-600">→</span>
              </button>

              <button
                onClick={shareToTwitter}
                className="w-full flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group"
              >
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-white text-2xl">
                  ✕
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-gray-900">Twitter / X</div>
                  <div className="text-sm text-gray-600">Copy, download & open Twitter</div>
                </div>
                <span className="text-gray-400 group-hover:text-gray-600">→</span>
              </button>

              <div className="border-t border-gray-200 my-2"></div>

              <button
                onClick={downloadImage}
                className="w-full flex items-center gap-4 p-4 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors group"
              >
                <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-white text-2xl">
                  🖼️
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-gray-900">Download Image</div>
                  <div className="text-sm text-gray-600">Save as PNG file</div>
                </div>
                <span className="text-gray-400 group-hover:text-gray-600">→</span>
              </button>

              <button
                onClick={downloadAsPDF}
                className="w-full flex items-center gap-4 p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors group"
              >
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl">
                  📄
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-gray-900">Download PDF</div>
                  <div className="text-sm text-gray-600">Detailed PDF report with graph</div>
                </div>
                <span className="text-gray-400 group-hover:text-gray-600">→</span>
              </button>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-6 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <AIChatbot />
    </div>
  );
}