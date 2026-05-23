import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#1a73e8', '#43a047', '#e53935', '#fb8c00'];

function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/vehicles').then(res => setVehicles(res.data));
    axios.get('http://localhost:5000/api/deliveries').then(res => setDeliveries(res.data));
  }, []);

  const available = vehicles.filter(v => v.status === 'Available').length;
  const onTrip = vehicles.filter(v => v.status === 'On Trip').length;
  const maintenance = vehicles.filter(v => v.status === 'Under Maintenance').length;
  const pending = deliveries.filter(d => d.status === 'Pending').length;
  const inTransit = deliveries.filter(d => d.status === 'In Transit').length;
  const delivered = deliveries.filter(d => d.status === 'Delivered').length;
  const cancelled = deliveries.filter(d => d.status === 'Cancelled').length;

  const vehicleChartData = [
    { name: 'Available', value: available },
    { name: 'On Trip', value: onTrip },
    { name: 'Maintenance', value: maintenance },
  ].filter(d => d.value > 0);

  const deliveryChartData = [
    { name: 'Pending', value: pending },
    { name: 'In Transit', value: inTransit },
    { name: 'Delivered', value: delivered },
    { name: 'Cancelled', value: cancelled },
  ].filter(d => d.value > 0);

  const barData = [
    { name: 'Vehicles', Available: available, 'On Trip': onTrip, Maintenance: maintenance },
    { name: 'Deliveries', Pending: pending, 'In Transit': inTransit, Delivered: delivered },
  ];

  return (
    <div>
      <p className="page-title">📊 Dashboard Overview</p>
      <div className="stats">
        <div className="stat-card"><div className="stat-icon">🚛</div><h3>{vehicles.length}</h3><p>Total Vehicles</p></div>
        <div className="stat-card"><div className="stat-icon">✅</div><h3>{available}</h3><p>Available</p></div>
        <div className="stat-card"><div className="stat-icon">🛣️</div><h3>{onTrip}</h3><p>On Trip</p></div>
        <div className="stat-card"><div className="stat-icon">📦</div><h3>{deliveries.length}</h3><p>Total Deliveries</p></div>
        <div className="stat-card"><div className="stat-icon">⏳</div><h3>{pending}</h3><p>Pending</p></div>
        <div className="stat-card"><div className="stat-icon">🚀</div><h3>{inTransit}</h3><p>In Transit</p></div>
        <div className="stat-card"><div className="stat-icon">🎯</div><h3>{delivered}</h3><p>Delivered</p></div>
      </div>

      <div style={{display:'flex', gap:'24px', flexWrap:'wrap'}}>
        <div className="card" style={{flex:1, minWidth:'280px'}}>
          <h2>🚗 Vehicle Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={vehicleChartData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({name, value}) => `${name}: ${value}`}>
                {vehicleChartData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{flex:1, minWidth:'280px'}}>
          <h2>📦 Delivery Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={deliveryChartData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({name, value}) => `${name}: ${value}`}>
                {deliveryChartData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{flex:2, minWidth:'300px'}}>
          <h2>📈 Overview Chart</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Available" fill="#1a73e8" />
              <Bar dataKey="On Trip" fill="#43a047" />
              <Bar dataKey="Pending" fill="#fb8c00" />
              <Bar dataKey="Delivered" fill="#00897b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2>🚚 Recent Deliveries</h2>
        {deliveries.length === 0 ? (
          <div className="empty-state">No deliveries yet. Schedule one!</div>
        ) : (
          <table>
            <thead>
              <tr><th>Delivery ID</th><th>From</th><th>To</th><th>Driver</th><th>Goods</th><th>Status</th></tr>
            </thead>
            <tbody>
              {deliveries.slice(0, 5).map(d => (
                <tr key={d._id}>
                  <td><strong>{d.deliveryId}</strong></td>
                  <td>{d.from}</td><td>{d.to}</td><td>{d.driverName}</td><td>{d.goods}</td>
                  <td><span className={`badge ${d.status === 'Delivered' ? 'delivered' : d.status === 'In Transit' ? 'transit' : d.status === 'Cancelled' ? 'cancelled' : 'pending'}`}>{d.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;