import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Wineries from './pages/Wineries';
import WineryDetail from './pages/WineryDetail';
import WineDetail from './pages/WineDetail';
import Wines from './pages/Wines';
import TradeTools from './pages/TradeTools';

function App() {
  return (
    <>
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wineries" element={<Wineries />} />
          <Route path="/wineries/:id" element={<WineryDetail />} />
          <Route path="/wines" element={<Wines />} />
          <Route path="/wines/:id" element={<WineDetail />} />
          <Route path="/trade-tools" element={<TradeTools />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
