import { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, PointElement, LineElement, Tooltip } from 'chart.js';
import LogoutButton from '../components/LogoutButton';
import Header from '../components/Header';
import { motion } from 'framer-motion';

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, PointElement, LineElement, Tooltip);

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const [availableColumns, setAvailableColumns] = useState([]);
  const [xKey, setXKey] = useState('');
  const [yKey, setYKey] = useState('');
  const [rawData, setRawData] = useState([]);
  const [summary, setSummary] = useState(null);
  const chartRef = useRef();
  const exportRef = useRef();

  useEffect(() => {
    fetchProfile();
    fetchUserFiles();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:8080/api/protected/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setUser(data.user);
  };

  const fetchUserFiles = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:8080/api/files/my-files', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const files = await res.json();
    if (res.ok) setUploadedFiles(files);
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('excel', file);
    const token = localStorage.getItem('token');

    const res = await fetch('http://localhost:8080/api/files/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      alert('Uploaded');
      fetchUserFiles();
    } else {
      alert('Upload failed');
    }
  };

  const viewFileData = async (fileId) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:8080/api/files/file/${fileId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (res.ok) {
      const keys = Object.keys(json[0] || {});
      setAvailableColumns(keys);
      setRawData(json);
      setXKey(keys[0]);
      setYKey(keys[1] || '');
      processChartData(json, keys[0], keys[1]);
    }
  };

  const processChartData = (json, x, y) => {
    if (!json || json.length === 0 || !x || !y) return;
    const labels = json.map(row => row[x]);
    const values = json.map(row => Number(row[y]) || 0);

    const data = {
      labels,
      datasets: [
        {
          label: y,
          data: values,
          backgroundColor: ['#4ade80', '#60a5fa', '#f87171', '#fbbf24', '#c084fc', '#facc15'],
          borderColor: '#1e40af',
          borderWidth: 1,
        },
      ],
    };

    const total = values.reduce((a, b) => a + b, 0);
    const avg = (total / values.length).toFixed(2);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const maxLabel = labels[values.indexOf(max)];
    const minLabel = labels[values.indexOf(min)];

    setChartData(data);
    setSummary({
      avg,
      max,
      min,
      maxLabel,
      minLabel,
      count: [...new Set(labels)].length,
    });
  };

  const exportChart = async (format) => {
    const canvas = await html2canvas(exportRef.current);
    const imgData = canvas.toDataURL('image/png');
    if (format === 'png') {
      const link = document.createElement('a');
      link.href = imgData;
      link.download = 'chart.png';
      link.click();
    } else {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = 190;
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, width, height);
      pdf.save('chart.pdf');
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <motion.div className="p-6 max-w-7xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {user.name} </h1>
        <p className="text-gray-500 mb-6">Role: {user.role}</p>

        <div className="bg-white border border-blue-200 rounded-lg shadow-lg p-6 mb-8">
          <input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} className="mb-4 block" />
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="font-medium">Chart Type:</label>
              <select value={chartType} onChange={(e) => setChartType(e.target.value)} className="ml-2 border px-2 py-1 rounded">
                <option value="bar">Bar</option>
                <option value="pie">Pie</option>
                <option value="line">Line</option>
              </select>
            </div>
            {availableColumns.length >= 2 && (
              <>
                <div>
                  <label className="font-medium ml-2">X Axis:</label>
                  <select value={xKey} onChange={(e) => {
                    setXKey(e.target.value);
                    processChartData(rawData, e.target.value, yKey);
                  }} className="ml-2 border px-2 py-1 rounded">
                    {availableColumns.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-medium ml-2">Y Axis:</label>
                  <select value={yKey} onChange={(e) => {
                    setYKey(e.target.value);
                    processChartData(rawData, xKey, e.target.value);
                  }} className="ml-2 border px-2 py-1 rounded">
                    {availableColumns.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {chartData && (
          <>
            <motion.div ref={exportRef} className="bg-white p-6 shadow-lg rounded-xl" initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
              {chartType === 'bar' && <Bar data={chartData} />}
              {chartType === 'pie' && <Pie data={chartData} />}
              {chartType === 'line' && <Line data={chartData} />}
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-2 text-gray-700"> Summary</h3>
                <ul className="list-disc ml-6 text-gray-600 text-sm space-y-1">
                  <li><strong>Average:</strong> {summary?.avg}</li>
                  <li><strong>Highest Value:</strong> {summary?.max} ({summary?.maxLabel})</li>
                  <li><strong>Lowest Value:</strong> {summary?.min} ({summary?.minLabel})</li>
                  <li><strong>Unique Categories:</strong> {summary?.count}</li>
                </ul>
              </div>
            </motion.div>

            <div className="mt-4 flex gap-4">
              <button onClick={() => exportChart('png')} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Download PNG</button>
              <button onClick={() => exportChart('pdf')} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Download PDF</button>
            </div>
          </>
        )}

        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">📂 Your Uploaded Files</h2>
          <table className="w-full border text-sm text-left text-gray-700 bg-white shadow rounded">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-2">File Name</th>
                <th className="px-4 py-2">Uploaded</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {uploadedFiles.map(file => (
                <tr key={file._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{file.originalName}</td>
                  <td className="px-4 py-2">{new Date(file.uploadDate).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => viewFileData(file._id)} className="text-blue-600 hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <LogoutButton />
        </div>
      </motion.div>
    </div>
  );
}
