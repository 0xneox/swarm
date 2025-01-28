import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import TaskMarketplace from './pages/TaskMarketplace';
import Onboarding from './pages/Onboarding';
import Layout from './components/Layout';

const App = () => {
  return (
    <WalletProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasks" element={<TaskMarketplace />} />
          </Route>
        </Routes>
      </Router>
    </WalletProvider>
  );
};

export default App;
