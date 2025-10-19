import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/NavBar.css";

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
  localStorage.removeItem("token");
  setToken(null);      // Update App state
  navigate("/login");  // Redirect to login
};

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">ScreenMate</Link>

      <button
        className="menu-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
      >
        &#9776;
      </button>

      <div className={`navbar-links ${isOpen ? "show" : ""}`}>
        {token ? (
          <>
            <Link to="/">Home</Link>
            <Link to="/favorites">Favorites</Link>
            <Link to="/profile">Profile</Link>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </>
        ) : null}
      </div>
    </nav>
  );
}
