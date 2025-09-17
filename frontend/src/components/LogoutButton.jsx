import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <button
      onClick={handleLogout}
      className="mt-4 bg-purple-800 text-white px-4 py-2 rounded hover:bg-purple-900 transition"
    >
      Logout
    </button>
  );
};

export default LogoutButton;