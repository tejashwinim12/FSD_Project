import "../css/Profile.css";
import { useMovieContext } from "../contexts/MovieContext";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function Profile() {
  const { favoriteCount = 0, setFavorites } = useMovieContext();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { token, logout } = useContext(AuthContext);

  // Fetch user profile
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setName(res.data.name);
        setEmail(res.data.email);
      } catch (err) {
        console.error(err);
        logout();
        navigate("/login");
      }
    };

    fetchProfile();
  }, [token, navigate, logout]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

const handleSave = async () => {
  try {
    const res = await fetchProtected("/users/profile", {
      method: "PUT",
      body: JSON.stringify({ name, email }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to update profile");
    }

    const data = await res.json();
    setUser(data);
    setEditing(false);
    alert("Profile updated successfully");
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};


  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) return;

    try {
      const res = await axios.delete("http://localhost:5000/api/auth/delete", {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(res.data.message);
      logout();
      setFavorites([]);
      navigate("/register");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error deleting account");
    }
  };

  if (!user) return <div>Loading profile...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-img empty">No Image</div>

        {editing ? (
          <>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </>
        ) : (
          <>
            <h2>{user.name}</h2>
            <p className="email">{user.email}</p>
          </>
        )}

        <p className="favorites">⭐ Favorites Count: {favoriteCount}</p>

        <div className="profile-actions">
          {editing ? (
            <>
              <button onClick={handleSave}>Save</button>
              <button onClick={() => setEditing(false)}>Cancel</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)}>Edit Profile</button>
          )}
          <button onClick={handleLogout}>Logout</button>
          <button className="delete-btn" onClick={handleDelete}>
            Delete Profile
          </button>
        </div>
      </div>
    </div>
  );
}
