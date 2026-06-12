import { useAuth } from "../contexts/Authcontext";
import { useNavigate } from "react-router-dom";
import "../css/Header.css";

function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (err) {
      console.error(err.message);
    }
  };

  // Get initials from email e.g. "john@gmail.com" → "J"
  const initials = user?.email?.charAt(0).toUpperCase() ?? "?";

  return (
    <header className="app-header">
      <div className="header-logo">
        <span className="logo-icon">🎬</span>
        <span className="logo-text">
          LuLu <span className="logo-accent">Moviez</span>
        </span>
      </div>

      {user ? (
        <div className="header-user">
          <div className="user-avatar" title={user.email}>
            {initials}
          </div>
          <button className="signout-btn" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      ) : (
        <button className="signin-btn" onClick={() => navigate("/login")}>
          Sign in
        </button>
      )}
    </header>
  );
}

export default Header;