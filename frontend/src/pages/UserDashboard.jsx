import { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Bar, Pie, Line, Doughnut, Radar, PolarArea, Scatter, Bubble } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  BarElement, CategoryScale, LinearScale, ArcElement, 
  PointElement, LineElement, Tooltip, Legend, RadialLinearScale 
} from 'chart.js';
import LogoutButton from '../components/LogoutButton';
import Header from '../components/Header';
import { motion } from 'framer-motion';

ChartJS.register(
  BarElement, 
  CategoryScale, 
  LinearScale, 
  ArcElement, 
  PointElement, 
  LineElement, 
  Tooltip, 
  Legend,
  RadialLinearScale
);
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

  // 🔥 Updated viewFileData with full error logging & handling
  const viewFileData = async (fileId) => {
    try {
      console.log('viewFileData called for id:', fileId);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You are not authenticated. Please login again.');
        return;
      }

      const url = `http://localhost:8080/api/files/file/${fileId}`;
      console.log('Fetching URL:', url);

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Response status:', res.status, res.statusText);

      let json;
      try {
        json = await res.json();
        console.log('Response JSON:', json);
      } catch (err) {
        console.warn('Could not parse JSON response:', err);
        json = null;
      }

      if (!res.ok) {
        const msg = json && (json.message || json.error)
          ? (json.message || json.error)
          : `Request failed with status ${res.status}`;
        alert('Failed to load file data: ' + msg);
        return;
      }

      if (!json || !Array.isArray(json) || json.length === 0) {
        alert('No data found in this file or the server returned unexpected data.');
        setAvailableColumns([]);
        setRawData([]);
        setChartData(null);
        setSummary(null);
        return;
      }

      const keys = Object.keys(json[0] || {});
      setAvailableColumns(keys);
      setRawData(json);
      setXKey(keys[0]);
      setYKey(keys[1] || '');
      processChartData(json, keys[0], keys[1]);
    } catch (err) {
      console.error('viewFileData error:', err);
      alert('An unexpected error occurred. Check console for details.');
    }
  };

  const processChartData = (json, x, y) => {
    if (!json || json.length === 0 || !x || !y) return;
    const labels = json.map(row => row[x]);
    const values = json.map(row => Number(row[y]) || 0);

    const purplePalette = ['#6D28D9', '#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD', '#E9D5FF'];

    const data = {
      labels,
      datasets: [
        {
          label: y,
          data: values,
          backgroundColor: purplePalette,
          borderColor: '#4B0082',
          borderWidth: 1,
        },
      ],
    };

    const total = values.reduce((a, b) => a + b, 0);
    const avg = values.length ? (total / values.length).toFixed(2) : 0;
    const max = values.length ? Math.max(...values) : 0;
    const min = values.length ? Math.min(...values) : 0;
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
    <div className="min-h-screen bg-white">
      <Header />

      <motion.div className="p-6 max-w-7xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold text-purple-900 mb-2">Welcome, {user.name}</h1>
        <p className="text-purple-700 mb-6">Role: {user.role}</p>

        <div className="bg-white border border-gray-200 rounded-lg shadow p-6 mb-8">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleExcelUpload}
            className="mb-4 block w-full text-purple-800"
          />
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="font-medium text-purple-800">Chart Type:</label>
  <select 
              value={chartType} 
              onChange={(e) => setChartType(e.target.value)} 
              className="ml-2 border px-2 py-1 rounded"
            >
              <option value="bar">Bar</option>
              <option value="pie">Pie</option>
              <option value="line">Line</option>
              <option value="doughnut">Doughnut</option>
              <option value="radar">Radar</option>
              <option value="polar">Polar Area</option>
              <option value="scatter">Scatter</option>
              <option value="bubble">Bubble</option>
              <option value="stacked">Stacked Bar</option>
              <option value="mixed">Mixed (Bar + Line)</option>
          </select>
            </div>
            </div>

            {availableColumns.length >= 2 && (
              <>
                <div>
                  <label className="font-medium text-purple-800 ml-2">X Axis:</label>
                  <select
                    value={xKey}
                    onChange={(e) => {
                      setXKey(e.target.value);
                      processChartData(rawData, e.target.value, yKey);
                    }}
                    className="ml-2 border px-2 py-1 rounded text-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    {availableColumns.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>

                <div>
                  <label className="font-medium text-purple-800 ml-2">Y Axis:</label>
                  <select
                    value={yKey}
                    onChange={(e) => {
                      setYKey(e.target.value);
                      processChartData(rawData, xKey, e.target.value);
                    }}
                    className="ml-2 border px-2 py-1 rounded text-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    {availableColumns.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {chartData && (
          <>
            <motion.div ref={exportRef} className="bg-white p-6 shadow rounded-xl" initial={{ scale: 0.98 }} animate={{ scale: 1 }}>
              {chartType === 'bar' && <Bar data={chartData} />}
              {chartType === 'pie' && <Pie data={chartData} />}
              {chartType === 'line' && <Line data={chartData} />}
              {chartType === 'doughnut' && <Doughnut data={chartData} />}
              {chartType === 'radar' && <Radar data={chartData} />}
              {chartType === 'polar' && <PolarArea data={chartData} />}
              {chartType === 'scatter' && (
  <Scatter 
    data={{
      datasets: [{
        label: yKey,
        data: rawData.map(row => ({ x: Number(row[xKey]), y: Number(row[yKey]) })),
        backgroundColor: '#60a5fa'
      }]
    }} 
  />
)}

{chartType === 'bubble' && (
  <Bubble 
    data={{
      datasets: [{
        label: yKey,
        data: rawData.map(row => ({
          x: Number(row[xKey]),
          y: Number(row[yKey]),
          r: Math.floor(Math.random() * 10) + 5  // random bubble size
        })),
        backgroundColor: '#f87171'
      }]
    }} 
  />
)}

{chartType === 'stacked' && (
  <Bar 
    data={{
      ...chartData,
      datasets: [
        {
          label: `${yKey} (Set 1)`,
          data: chartData.datasets[0].data.map(v => v + 5),
          backgroundColor: '#4ade80'
        },
        {
          label: `${yKey} (Set 2)`,
          data: chartData.datasets[0].data.map(v => v - 3),
          backgroundColor: '#60a5fa'
        }
      ]
    }}
    options={{
      plugins: { legend: { position: "top" } },
      responsive: true,
      scales: {
        x: { stacked: true },
        y: { stacked: true }
      }
    }}
  />
)}

{chartType === 'mixed' && (
  <Bar 
    data={{
      labels: chartData.labels,
      datasets: [
        {
          type: 'bar',
          label: yKey + ' (Bar)',
          data: chartData.datasets[0].data,
          backgroundColor: '#fbbf24'
        },
        {
          type: 'line',
          label: yKey + ' (Line)',
          data: chartData.datasets[0].data,
          borderColor: '#1e40af',
          borderWidth: 2
        }
      ]
    }}
  />
)}
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-2 text-purple-900">Summary</h3>
                <ul className="ml-6 text-purple-700 text-sm space-y-1">
                  <li><strong>Average:</strong> {summary?.avg}</li>
                  <li><strong>Highest Value:</strong> {summary?.max} ({summary?.maxLabel})</li>
                  <li><strong>Lowest Value:</strong> {summary?.min} ({summary?.minLabel})</li>
                  <li><strong>Unique Categories:</strong> {summary?.count}</li>
                </ul>
              </div>
            </motion.div>

            <div className="mt-4 flex gap-4">
              <button
                onClick={() => exportChart('png')}
                className="bg-purple-800 text-white px-4 py-2 rounded hover:bg-purple-900 transition"
              >
                Download PNG
              </button>
              <button
                onClick={() => exportChart('pdf')}
                className="bg-purple-800 text-white px-4 py-2 rounded hover:bg-purple-900 transition"
              >
                Download PDF
              </button>
            </div>
          </>
        )}

        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4 text-purple-900">Your Uploaded Files</h2>
          <table className="w-full border text-sm text-left text-purple-800 bg-white shadow rounded">
            <thead className="bg-purple-50 text-purple-700">
              <tr>
                <th className="px-4 py-2">File Name</th>
                <th className="px-4 py-2">Uploaded</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {uploadedFiles.map(file => (
                <tr key={file._id} className="border-t hover:bg-purple-50">
                  <td className="px-4 py-2">{file.originalName}</td>
                  <td className="px-4 py-2">{new Date(file.uploadDate).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => viewFileData(file._id)} className="text-purple-700 hover:underline">
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {uploadedFiles.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-purple-600">
                    No files uploaded yet
                  </td>
                </tr>
              )}
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
