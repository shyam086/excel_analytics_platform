import { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Bar,
  Pie,
  Line,
  Doughnut,
  Radar,
  PolarArea,
  Scatter,
  Bubble,
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  RadialLinearScale,
} from "chart.js";
import LogoutButton from "../components/LogoutButton";
import Header from "../components/Header";
import { motion } from "framer-motion";

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
  const [chartType, setChartType] = useState("");
  const [availableColumns, setAvailableColumns] = useState([]);
  const [xKey, setXKey] = useState("");
  const [yKey, setYKey] = useState("");
  const [rawData, setRawData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [downloadHistory, setDownloadHistory] = useState([]);
  const exportRef = useRef();

  // ✅ Load profile & uploaded files
  useEffect(() => {
    fetchProfile();
    fetchUserFiles();
  }, []);

  // ✅ Load saved download history from localStorage
  useEffect(() => {
    if (user?.email) {
      const saved = JSON.parse(
        localStorage.getItem(`downloadHistory_${user.email}`)
      );
      if (saved) setDownloadHistory(saved);
    }
  }, [user]);

  // ✅ Save download history per user
  useEffect(() => {
    if (user?.email) {
      localStorage.setItem(
        `downloadHistory_${user.email}`,
        JSON.stringify(downloadHistory)
      );
    }
  }, [downloadHistory, user]);

  // ✅ Fetch user profile
  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:8080/api/protected/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setUser(data.user);
  };

  // ✅ Fetch uploaded files
  const fetchUserFiles = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:8080/api/files/my-files", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const files = await res.json();
    if (res.ok) setUploadedFiles(files);
  };

  // ✅ Clear Upload History
  const clearUploadHistory = () => {
    setUploadedFiles([]);
  };

  // ✅ Upload Excel
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("excel", file);
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:8080/api/files/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      alert("Uploaded");
      const newFile = await res.json();
      fetchUserFiles();
      if (newFile?._id) {
        await viewFileData(newFile._id);
      }
    } else {
      alert("Upload failed");
    }
  };

  // ✅ View file data and generate chart
  const viewFileData = async (fileId) => {
    try {
      const token = localStorage.getItem("token");
      const url = `http://localhost:8080/api/files/file/${fileId}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (!res.ok || !Array.isArray(json) || json.length === 0) {
        alert("Failed to load file data or empty file.");
        return;
      }

      const keys = Object.keys(json[0] || {});
      setAvailableColumns(keys);
      setRawData(json);
      setXKey(keys[0]);
      setYKey(keys[1] || "");
      processChartData(json, keys[0], keys[1]);
    } catch (err) {
      console.error("viewFileData error:", err);
      alert("Error while loading file.");
    }
  };

  // ✅ Process data for charts
  const processChartData = (json, x, y) => {
    if (!json || json.length === 0 || !x || !y) return;
    const labels = json.map((row) => row[x]);
    const values = json.map((row) => Number(row[y]) || 0);

    const data = {
      labels,
      datasets: [
        {
          label: y,
          data: values,
          backgroundColor: [
            "#6D28D9",
            "#7C3AED",
            "#8B5CF6",
            "#A78BFA",
            "#C4B5FD",
            "#E9D5FF",
          ],
          borderColor: "#4B0082",
          borderWidth: 1,
        },
      ],
    };

    const total = values.reduce((a, b) => a + b, 0);
    const avg = values.length ? (total / values.length).toFixed(2) : 0;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const maxLabel = labels[values.indexOf(max)];
    const minLabel = labels[values.indexOf(min)];

    setChartData(data);
    setSummary({ avg, max, min, maxLabel, minLabel, count: labels.length });
  };

  // ✅ Export chart + save history
  const exportChart = async (format) => {
    const canvas = await html2canvas(exportRef.current, {
      backgroundColor: darkMode ? "#111827" : "#ffffff",
      scale: 2,
    });
    const imgData = canvas.toDataURL("image/png");
    const fileName = format === "png" ? "chart.png" : "chart.pdf";
    const date = new Date().toLocaleString();

    setDownloadHistory((prev) => [
      ...prev,
      { id: Date.now(), name: fileName, date },
    ]);

    if (format === "png") {
      const link = document.createElement("a");
      link.href = imgData;
      link.download = fileName;
      link.click();
    } else {
      const pdf = new jsPDF("p", "mm", "a4");
      const width = 190;
      const height = (canvas.height * width) / canvas.width;
      pdf.setFillColor(darkMode ? 17 : 255, darkMode ? 24 : 255, darkMode ? 39 : 255);
      pdf.rect(0, 0, 210, 297, "F");
      pdf.addImage(imgData, "PNG", 10, 10, width, height);
      pdf.save(fileName);
    }
  };

  // ✅ Clear Download History
  const clearDownloadHistory = () => {
    setDownloadHistory([]);
    if (user?.email) localStorage.removeItem(`downloadHistory_${user.email}`);
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div
      className={`flex min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      {/* Sidebar */}
      <motion.div
        initial={{ x: -200 }}
        animate={{ x: 0 }}
        className={`${
          darkMode ? "bg-gray-800" : "bg-purple-900"
        } w-64 text-white flex flex-col p-6 shadow-lg`}
      >
        <h2 className="text-2xl font-bold mb-6">📊 KODE</h2>
        <nav className="flex-1 space-y-4">
          {["dashboard", "uploads", "downloads", "settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-2 rounded ${
                activeTab === tab
                  ? darkMode
                    ? "bg-gray-600"
                    : "bg-purple-700"
                  : darkMode
                  ? "hover:bg-gray-700"
                  : "hover:bg-purple-700"
              }`}
            >
              {tab === "dashboard" && "🏠 Dashboard"}
              {tab === "uploads" && "⬆️ Upload History"}
              {tab === "downloads" && "⬇️ Download History"}
              {tab === "settings" && "⚙️ Settings"}
            </button>
          ))}
        </nav>
        <div className="mt-auto">
          <LogoutButton />
        </div>
      </motion.div>

      {/* Main */}
      <div className="flex-1 p-6">
        <Header />

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <>
            <h1 className="text-3xl font-bold mb-4">Welcome, {user.name}</h1>
            <div
              className={`${
                darkMode
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-white text-black border-gray-200"
              } border rounded-lg shadow p-6 mb-8 flex flex-wrap items-center gap-4`}
            >
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleExcelUpload}
                className="border px-3 py-2 rounded bg-white text-black"
              />
              <select
                onChange={(e) => viewFileData(e.target.value)}
                className="border px-3 py-2 rounded text-purple-800"
              >
                <option value="">Select File</option>
                {uploadedFiles.map((file) => (
                  <option key={file._id} value={file._id}>
                    {file.originalName}
                  </option>
                ))}
              </select>
              {availableColumns.length > 0 && (
                <select
                  value={xKey}
                  onChange={(e) => {
                    setXKey(e.target.value);
                    processChartData(rawData, e.target.value, yKey);
                  }}
                  className="border px-3 py-2 rounded text-purple-800"
                >
                  <option value="">Select X Axis</option>
                  {availableColumns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              )}
              {availableColumns.length > 1 && (
                <select
                  value={yKey}
                  onChange={(e) => {
                    setYKey(e.target.value);
                    processChartData(rawData, xKey, e.target.value);
                  }}
                  className="border px-3 py-2 rounded text-purple-800"
                >
                  <option value="">Select Y Axis</option>
                  {availableColumns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              )}
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="border px-3 py-2 rounded text-purple-800"
              >
                <option value="">Select Extra Chart</option>
                <option value="line">Line</option>
                <option value="doughnut">Doughnut</option>
                <option value="radar">Radar</option>
                <option value="polar">Polar Area</option>
                <option value="scatter">Scatter</option>
                <option value="bubble">Bubble</option>
              </select>
              <button
                onClick={() => exportChart("pdf")}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Export PDF
              </button>
              <button
                onClick={() => exportChart("png")}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Export PNG
              </button>
            </div>

            {/* Charts */}
            {chartData && (
              <motion.div
                ref={exportRef}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div
                  className={`${darkMode ? "bg-gray-800" : "bg-white"} p-4 rounded shadow`}
                >
                  <Bar data={chartData} />
                </div>
                <div
                  className={`${darkMode ? "bg-gray-800" : "bg-white"} p-4 rounded shadow`}
                >
                  <Pie data={chartData} />
                </div>
                {chartType === "line" && (
                  <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-4 rounded shadow`}>
                    <Line data={chartData} />
                  </div>
                )}
                {chartType === "doughnut" && (
                  <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-4 rounded shadow`}>
                    <Doughnut data={chartData} />
                  </div>
                )}
                {chartType === "radar" && (
                  <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-4 rounded shadow`}>
                    <Radar data={chartData} />
                  </div>
                )}
                {chartType === "polar" && (
                  <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-4 rounded shadow`}>
                    <PolarArea data={chartData} />
                  </div>
                )}
                {chartType === "scatter" && (
                  <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-4 rounded shadow`}>
                    <Scatter
                      data={{
                        datasets: [
                          {
                            label: yKey,
                            data: rawData.map((row) => ({
                              x: Number(row[xKey]),
                              y: Number(row[yKey]),
                            })),
                            backgroundColor: "#60a5fa",
                          },
                        ],
                      }}
                    />
                  </div>
                )}
                {chartType === "bubble" && (
                  <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-4 rounded shadow`}>
                    <Bubble
                      data={{
                        datasets: [
                          {
                            label: yKey,
                            data: rawData.map((row) => ({
                              x: Number(row[xKey]),
                              y: Number(row[yKey]),
                              r: Math.floor(Math.random() * 10) + 5,
                            })),
                            backgroundColor: "#f87171",
                          },
                        ],
                      }}
                    />
                  </div>
                )}
                {/* Summary */}
                <div
                  className={`col-span-1 md:col-span-2 ${
                    darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
                  } p-6 rounded shadow`}
                >
                  <h3 className="text-lg font-bold mb-2">📊 Data Summary</h3>
                  <ul className="ml-6 text-sm space-y-1">
                    <li>
                      <strong>Average:</strong> {summary?.avg}
                    </li>
                    <li>
                      <strong>Highest Value:</strong> {summary?.max} (
                      {summary?.maxLabel})
                    </li>
                    <li>
                      <strong>Lowest Value:</strong> {summary?.min} (
                      {summary?.minLabel})
                    </li>
                    <li>
                      <strong>Unique Categories:</strong> {summary?.count}
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Uploads */}
        {activeTab === "uploads" && (
          <div
            className={`${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
            } p-6 rounded shadow`}
          >
            <h1 className="text-2xl font-bold mb-4">⬆️ Upload History</h1>
            <button
              onClick={clearUploadHistory}
              className="mb-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Clear Upload History
            </button>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr
                  className={`${darkMode ? "bg-gray-700" : "bg-gray-200"}`}
                >
                  <th className="p-2 text-left">File Name</th>
                  <th className="p-2 text-left">Uploaded On</th>
                </tr>
              </thead>
              <tbody>
                {uploadedFiles.length > 0 ? (
                  uploadedFiles.map((file) => (
                    <tr
                      key={file._id}
                      className="border-t hover:bg-purple-100 dark:hover:bg-gray-700"
                    >
                      <td className="p-2">{file.originalName}</td>
                      <td className="p-2">
                        {new Date(file.uploadDate).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="2"
                      className="text-center p-4 text-gray-500"
                    >
                      No uploads yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Downloads */}
        {activeTab === "downloads" && (
          <div
            className={`${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
            } p-6 rounded shadow`}
          >
            <h1 className="text-2xl font-bold mb-4">⬇️ Download History</h1>
            <button
              onClick={clearDownloadHistory}
              className="mb-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Clear Download History
            </button>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr
                  className={`${darkMode ? "bg-gray-700" : "bg-gray-200"}`}
                >
                  <th className="p-2 text-left">File Name</th>
                  <th className="p-2 text-left">Downloaded On</th>
                </tr>
              </thead>
              <tbody>
                {downloadHistory.length > 0 ? (
                  downloadHistory.map((i) => (
                    <tr
                      key={i.id}
                      className="border-t hover:bg-purple-100 dark:hover:bg-gray-700"
                    >
                      <td className="p-2">{i.name}</td>
                      <td className="p-2">{i.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="2"
                      className="text-center p-4 text-gray-500"
                    >
                      No downloads yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <div
            className={`${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
            } p-6 rounded shadow space-y-6`}
          >
            <h1 className="text-2xl font-bold mb-4">⚙️ Settings</h1>
            <div>
              <h2 className="text-lg font-semibold mb-2">Profile</h2>
              <p>
                <strong>Name:</strong> {user?.name}
              </p>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Appearance</h2>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`px-4 py-2 rounded text-sm font-semibold transition ${
                  darkMode
                    ? "bg-purple-700 text-white hover:bg-purple-600"
                    : "bg-gray-800 text-white hover:bg-gray-700"
                }`}
              >
                {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
