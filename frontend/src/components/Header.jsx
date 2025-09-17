import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function DashboardHeader() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/'); // Redirect if not logged in
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const goToHome = () => {
    navigate('/');
  };

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-purple-800 text-white shadow-md">
      <div
        className="text-2xl font-semibold tracking-wide cursor-pointer"
        onClick={goToHome}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') goToHome(); }}
      >
        KODE
      </div>

      <div className="flex gap-4 items-center">
        <button
          onClick={handleLogout}
          className="bg-white text-purple-800 px-4 py-2 rounded hover:bg-gray-100 font-medium transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}