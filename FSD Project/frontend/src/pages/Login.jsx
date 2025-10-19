import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/Auth.css";
import { AuthContext } from "../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const result = await login({ email, password });
      if (result.ok) {
        navigate("/profile");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
          {error && <p className="auth-error">{error}</p>}
        </form>
        <div className="auth-links">
          <span>Don't have an account? </span>
          <Link to="/register">Register Now</Link>
        </div>
      </div>
    </div>
  );
}
