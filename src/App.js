import Navbar from './components/navbar';
import Home from './pages/Home.js';
import Portfolio from './pages/Portfolio';
import About from './pages/About';
import Contact from './pages/Contact';
import Gaydar from './pages/Gaydar';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from 'react';
import './App.css';

// three.js is ~165KB gzipped, so the Baja viewer is split out and only
// fetched when someone actually opens /baja
const Baja = lazy(() => import('./pages/Baja'));

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route path="/gaydar" element={<Gaydar />} />
          <Route path="/baja" element={<Suspense fallback={null}><Baja /></Suspense>} />
          <Route path="*" element={
            <div>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                {/* 404 Page */}
                <Route path="*" element={
                  <div className="error-page">
                    <h1>404</h1>
                    <p>This page doesn't exist in our archive.</p>
                    <img src="/images/deer_licking.gif" alt="Deer" style={{
                      width: '80px',
                      margin: '2rem 0',
                      filter: 'grayscale(100%)',
                      opacity: 0.6
                    }} />
                    <a href="/" className="btn-primary">Return Home</a>
                  </div>
                } />
              </Routes>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
