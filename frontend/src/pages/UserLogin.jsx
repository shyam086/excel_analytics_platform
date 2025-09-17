import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import GLOBE from 'vanta/dist/vanta.globe.min';

export default function UserLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        GLOBE({
          el: vantaRef.current,
          THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: 0xffffff,
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) return alert(data.message || 'Login failed');
    if (data.user.role !== 'user') return alert('Not a user account');

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    navigate('/user-dashboard');
  };

  return (
    <div ref={vantaRef} className="min-h-screen flex justify-center items-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 shadow-xl rounded w-full max-w-sm z-10 relative">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">User Login</h2>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded mt-4 hover:bg-blue-700 transition"
        >
          Login
        </button>
        <p className="mt-2 text-blue-600 cursor-pointer text-sm" onClick={() => navigate('/forgot-password')}>
          Forgot Password?
        </p>
        <p className="mt-2 text-sm">
          Don't have an account?{' '}
          <span className="text-blue-600 cursor-pointer" onClick={() => navigate('/user-register')}>
            Register
          </span>
        </p>
      </form>
    </div>
  );
}
