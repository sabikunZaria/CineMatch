import './css/App.css'
import Home from './pages/Homepage';
import Favourite from './pages/Favourite';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Recommendations from './pages/Recommendations';
import { Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar';
import Header from './components/Header';
import { MovieProvider } from './contexts/Moviecontext';
import { AuthProvider } from './contexts/Authcontext';

function App() {
  return (
    <AuthProvider>
      <MovieProvider>
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/favourite" element={<Favourite />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </main>
        <Navbar />
      </MovieProvider>
    </AuthProvider>
  );
}

export default App;