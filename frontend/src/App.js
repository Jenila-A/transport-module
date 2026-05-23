import React, { useState } from 'react';
import Vehicles from './components/Vehicles';
import Deliveries from './components/Deliveries';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <div className="app">
      <nav className="navbar">
        <h1>🚚 Transport Module</h1>
        <div className="nav-links">
          <button onClick={() => setActivePage('dashboard')} className={activePage === 'dashboard' ? 'active' : ''}>Dashboard</button>
          <button onClick={() => setActivePage('vehicles')} className={activePage === 'vehicles' ? 'active' : ''}>Vehicles</button>
          <button onClick={() => setActivePage('deliveries')} className={activePage === 'deliveries' ? 'active' : ''}>Deliveries</button>
        </div>
      </nav>
      <div className="content">
        {activePage === 'dashboard' && <Dashboard />}
        {activePage === 'vehicles' && <Vehicles />}
        {activePage === 'deliveries' && <Deliveries />}
      </div>
    </div>
  );
}

export default App;