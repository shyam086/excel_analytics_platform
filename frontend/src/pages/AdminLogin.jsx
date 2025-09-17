import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) return alert(data.message || 'Login failed');
    if (data.user.role !== 'admin') return alert('Not an admin account');

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    navigate('/admin-dashboard');
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-gray-900 via-purple-900 to-purple-800">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 shadow-2xl rounded-lg w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-purple-800">
          Admin Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600 text-purple-800"
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-purple-600 text-purple-800"
        />

        <button
          type="submit"
          className="w-full bg-purple-800 text-white font-semibold py-2 rounded hover:bg-purple-900 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}