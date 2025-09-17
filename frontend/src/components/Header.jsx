
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
    <header className="flex justify-between items-center px-6 py-4 bg-blue-900 text-white shadow-md">
      <div className="text-2xl font-semibold tracking-wide">
        KODE 
      </div>

      <div className="flex gap-4 items-center">
        <button
          onClick={handleLogout}
          className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 text-white font-medium"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
