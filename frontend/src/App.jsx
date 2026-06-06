import './css/App.css'
import Home from './pages/Homepage';  
import Favourite from './pages/Favourite';
import {Routes, Route} from "react-router-dom";
import Navbar from './components/Navbar';
import { MovieProvider } from './contexts/Moviecontext';

function App() {

  return (
    <MovieProvider>
      <Navbar />
   <main className="main-content">
   <Routes>
     <Route path="/" element={<Home />} />
     <Route path="/Favourite" element={<Favourite />} />
   </Routes>
   </main>
   </MovieProvider>
  );
}

export default App;
