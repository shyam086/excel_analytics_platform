import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function AdminFiles() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetchAllFiles();
  }, []);

  const fetchAllFiles = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:8080/api/admin/all-files', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setFiles(data);
    else alert('Failed to load files');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-64 bg-white border-r">
        <div className="p-6 font-bold text-lg text-blue-700">Admin Panel</div>
        <ul className="space-y-2 px-4">
          <li>
            <Link to="/admin-dashboard" className="text-blue-600 hover:underline">User Management</Link>
          </li>
          <li>
            <Link to="/admin-files" className="text-blue-800 font-semibold">Uploaded Files</Link>
          </li>
        </ul>
      </div>

      <motion.div className="flex-1 p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Header />
        <h1 className="text-3xl font-bold text-gray-800 mb-6">All User Uploaded Files</h1>

        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-blue-100 text-blue-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">File Name</th>
                <th className="px-4 py-2">Uploaded On</th>
              </tr>
            </thead>
            <tbody>
              {files.length > 0 ? (
                files.map(file => (
                  <tr key={file._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{file.user?.name}</td>
                    <td className="px-4 py-2">{file.originalName}</td>
                    <td className="px-4 py-2">{new Date(file.uploadDate).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr><td className="p-4" colSpan="3">No files uploaded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
