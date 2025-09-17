import { useEffect, useState } from 'react';
import LogoutButton from '../components/LogoutButton';
import Header from '../components/Header';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchAllUsers();
    fetchAllFiles();
  }, []);

  const fetchAllUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8080/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const userList = data.users || data;
        setUsers(userList);
        setFilteredUsers(userList);
      } else {
        alert(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      alert('Server error fetching users');
    }
  };

  const fetchAllFiles = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('https://excel-analytics-04ni.onrender.com', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setFiles(data);
      } else {
        alert('Failed to fetch files');
      }
    } catch (err) {
      alert('Server error fetching files');
    }
  };

  const promoteToAdmin = async (userId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8080/api/admin/promote/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'User promoted to admin!');
        fetchAllUsers();
      } else {
        alert(data.message || 'Promotion failed.');
      }
    } catch (err) {
      alert('Server error during promotion');
    }
  };

  useEffect(() => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter((u) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter) {
      try {
        filtered = filtered.filter(
          (u) =>
            new Date(u.createdAt).toISOString().split('T')[0] ===
            new Date(dateFilter).toISOString().split('T')[0]
        );
      } catch (err) {
        console.error('Invalid date format');
      }
    }

    setFilteredUsers(filtered);
  }, [searchTerm, dateFilter, users]);

  return (
    <div className="min-h-screen flex bg-gray-50">
     

      
      <motion.div className="flex-1 p-6 max-w-7xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Header />

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500 mb-4">Welcome, {user?.name} ({user?.role})</p>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded shadow-sm">
            <p className="font-semibold text-lg">Total Users: {filteredUsers.length}</p>
          </div>
          <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded shadow-sm">
            <p className="font-semibold text-lg">Total Files Uploaded: {files.length}</p>
          </div>
        </div>

        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <input
            type="text"
            placeholder="🔍 Search by name or email"
            className="border rounded px-4 py-2 w-full sm:w-1/3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <input
            type="date"
            className="border rounded px-4 py-2 w-full sm:w-1/3"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

      
        <motion.div className="bg-white shadow-lg rounded-xl p-6" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
          <h2 className="text-2xl font-semibold mb-4 text-blue-800">All Registered Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="bg-blue-100 text-blue-700 uppercase text-xs">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Registered On</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{u.name}</td>
                      <td className="px-4 py-2">{u.email}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-block px-2 py-1 rounded text-white text-xs ${u.role === 'admin' ? 'bg-green-500' : 'bg-gray-500'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-2">{new Date(u.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-2">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => promoteToAdmin(u._id)}
                            className="text-blue-600 hover:underline"
                          >
                            Promote to Admin
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-4 text-center text-gray-500">No matching users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <div className="mt-8">
          <LogoutButton />
        </div>
      </motion.div>
    </div>
  );
}
