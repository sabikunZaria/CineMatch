import './css/App.css'
import Home from './pages/Homepage';
import Favourite from './pages/Favourite';
import Movies from './pages/Movies';
import Profile from './pages/Profile';
import { Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar';
import { MovieProvider } from './contexts/Moviecontext';

function App() {
  return (
    <MovieProvider>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/favourite" element={<Favourite />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      <Navbar />
    </MovieProvider>
  );
}

export default App;