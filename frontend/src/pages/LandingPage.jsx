import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import NET from "vanta/dist/vanta.net.min";

export default function LandingPage() {
  const navigate = useNavigate();
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);

  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      const effect = NET({
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
        backgroundColor: 0x0a0a0a,
        points: 12.0,
        maxDistance: 20.0,
        spacing: 18.0,
      });
      setVantaEffect(effect);
    }

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <div
      ref={vantaRef}
      className="min-h-screen flex flex-col relative overflow-hidden"
    >
      {/* Overlay layer */}
      <div className="absolute inset-0 bg-black/40 z-0" />

      {/* Header */}
      <header className="p-4 flex justify-between items-center text-white z-10 relative">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
          KODE Analytics
        </h1>
        <button
          onClick={() => navigate("/admin-login")}
          className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-200 font-medium transition duration-200"
        >
          Admin Login
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 z-10 relative">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg bg-gradient-to-r from-yellow-400 via-red-500 to-pink-600 bg-clip-text text-transparent">
          Welcome to Smart Data Visualization
        </h2>
        <p className="mb-8 text-lg md:text-xl bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
          Upload, Analyze, and Export Charts with Ease
        </p>
        <button
          onClick={() => navigate("/user-login")}
          className="bg-white text-blue-600 px-6 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 shadow-lg transition duration-200"
        >
          Get Started
        </button>
      </main>
    </div>
  );
}
