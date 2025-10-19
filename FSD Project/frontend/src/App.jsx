import "./css/App.css";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Routes, Route, Navigate } from "react-router-dom";
import { MovieProvider } from "./contexts/MovieContext";
import NavBar from "./components/NavBar";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./contexts/AuthContext";

function App() {
  const { token } = useContext(AuthContext);

  // ===== Notification logic =====
  const sendNotification = async () => {
    if ("Notification" in window && navigator.serviceWorker) {
      const permission = await Notification.requestPermission();
      console.log("Notification permission:", permission);
      if (permission === "granted") {
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification("ScreenMate", {
          body: "Check out your latest movie recommendations!",
          icon: "/icons/icon-192x192.png",
        });
      } else {
        alert("Notification permission denied.");
      }
    } else {
      alert("Notifications not supported in this browser.");
    }
  };

  // ===== PWA Install logic =====
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true); // show install button when available
    };
    window.addEventListener("beforeinstallprompt", handler);

    console.log("✅ App.jsx loaded successfully");

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("Install prompt not available yet. Refresh the page.");
      return;
    }
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

  return (
    <MovieProvider>
      <NavBar token={token} />

      {/* Notification Button */}
      <button
        onClick={sendNotification}
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          padding: "12px 20px",
          backgroundColor: "#e63946",
          color: "#fff",
          fontSize: "16px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          zIndex: 9999,
          boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
        }}
      >
        🔔 Send Notification
      </button>

      {/* Install Button (only show if prompt available) */}
      {showInstallBtn && (
        <button
          onClick={handleInstallClick}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            padding: "12px 20px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            zIndex: 9999,
            boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
          }}
        >
          Install ScreenMate
        </button>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={token ? <Navigate to="/profile" /> : <Login />}
        />
        <Route
          path="/register"
          element={token ? <Navigate to="/profile" /> : <Register />}
        />
        <Route
          path="/profile"
          element={token ? <Profile /> : <Navigate to="/login" />}
        />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>
    </MovieProvider>
  );
}

export default App;
