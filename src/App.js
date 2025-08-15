import Navbar from './components/navbar';
import Home from './pages/Home.js';
import Portfolio from './pages/Portfolio';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';

function App() {
  return (
    <div>
      <BrowserRouter>
      <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="/portfolio" element={<Portfolio />} />
          {/* optional 404 */}
          <Route path="*" element={<h1 style={{ padding: 24 }}>Not Found</h1>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
