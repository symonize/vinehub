import React, { lazy, Suspense, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { InkTransitionProvider, InkTransitionCanvas } from './components/InkTransition';
import Header from './components/Header';
import Footer from './components/Footer';
import AboutPanel from './components/AboutPanel';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const Wineries = lazy(() => import('./pages/Wineries'));
const WineryDetail = lazy(() => import('./pages/WineryDetail'));
const WineDetail = lazy(() => import('./pages/WineDetail'));
const Wines = lazy(() => import('./pages/Wines'));
const TradeTools = lazy(() => import('./pages/TradeTools'));

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <div className="spinner" />
  </div>
);

function App() {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <InkTransitionProvider phaseInDuration={900} holdDuration={100} phaseOutDuration={1800}>
      <Header onAboutOpen={() => setAboutOpen(true)} />
      <main style={{ flex: 1 }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/wineries" element={<Wineries />} />
            <Route path="/wineries/:id" element={<WineryDetail />} />
            <Route path="/wines" element={<Wines />} />
            <Route path="/wines/:id" element={<WineDetail />} />
            <Route path="/trade-tools" element={<TradeTools />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <InkTransitionCanvas />
      {aboutOpen && (
        <AboutPanel isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
      )}
    </InkTransitionProvider>
  );
}

export default App;
