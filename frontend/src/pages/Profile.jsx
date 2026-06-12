import { useAuth } from "../contexts/Authcontext";
import { useNavigate } from "react-router-dom";
import "../css/Profile.css";

function Profile() {
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

  if (!user) {
    return (
      <div className="profile-page">
        <p className="profile-guest">
          You're not logged in. <span onClick={() => navigate("/login")}>Sign in</span>
        </p>
      </div>
    );
  }

  const initials = user.email.charAt(0).toUpperCase();

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar">{initials}</div>
        <h2 className="profile-email">{user.email}</h2>
        <p className="profile-label">Signed in</p>
        <button className="profile-signout" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    </div>
  );
}

export default Profile;