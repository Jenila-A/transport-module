import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [form, setForm] = useState({ vehicleNumber: '', driverName: '', driverPhone: '', vehicleType: 'Truck', status: 'Available' });

  const fetchVehicles = () => {
    axios.get('http://localhost:5000/api/vehicles').then(res => setVehicles(res.data));
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleSubmit = async () => {
    if (!form.vehicleNumber || !form.driverName || !form.driverPhone) return alert('Please fill all fields!');
    await axios.post('http://localhost:5000/api/vehicles', form);
    setForm({ vehicleNumber: '', driverName: '', driverPhone: '', vehicleType: 'Truck', status: 'Available' });
    fetchVehicles();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this vehicle?')) {
      await axios.delete(`http://localhost:5000/api/vehicles/${id}`);
      fetchVehicles();
    }
  };

  const handleStatus = async (id, status) => {
    await axios.put(`http://localhost:5000/api/vehicles/${id}`, { status });
    fetchVehicles();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Vehicle Report - Transport Module', 14, 16);
    autoTable(doc, {
      head: [['Vehicle No', 'Driver', 'Phone', 'Type', 'Status']],
      body: filtered.map(v => [v.vehicleNumber, v.driverName, v.driverPhone, v.vehicleType, v.status]),
      startY: 24,
    });
    doc.save('vehicles-report.pdf');
  };

  const exportCSV = () => {
    const rows = [['Vehicle No', 'Driver', 'Phone', 'Type', 'Status'], ...filtered.map(v => [v.vehicleNumber, v.driverName, v.driverPhone, v.vehicleType, v.status])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'vehicles.csv'; a.click();
  };

  const filtered = vehicles.filter(v => {
    const matchSearch = v.vehicleNumber.toLowerCase().includes(search.toLowerCase()) || v.driverName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || v.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <p className="page-title">🚗 Vehicle Management</p>
      <div className="card">
        <h2>➕ Add New Vehicle</h2>
        <div className="form-grid">
          <input placeholder="Vehicle Number" value={form.vehicleNumber} onChange={e => setForm({...form, vehicleNumber: e.target.value})} />
          <input placeholder="Driver Name" value={form.driverName} onChange={e => setForm({...form, driverName: e.target.value})} />
          <input placeholder="Driver Phone" value={form.driverPhone} onChange={e => setForm({...form, driverPhone: e.target.value})} />
          <select value={form.vehicleType} onChange={e => setForm({...form, vehicleType: e.target.value})}>
            <option>Truck</option><option>Van</option><option>Bike</option><option>Car</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleSubmit}>➕ Add Vehicle</button>
      </div>

      <div className="card">
        <h2>🚗 All Vehicles</h2>
        <div style={{display:'flex', gap:'10px', marginBottom:'16px', flexWrap:'wrap'}}>
          <input placeholder="🔍 Search by vehicle no or driver..." value={search} onChange={e => setSearch(e.target.value)} style={{flex:1, minWidth:'200px'}} />
          <select className="status-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option>All</option><option>Available</option><option>On Trip</option><option>Under Maintenance</option>
          </select>
          <button className="btn btn-primary" onClick={exportPDF}>📄 Export PDF</button>
          <button className="btn btn-primary" onClick={exportCSV}>📊 Export CSV</button>
        </div>
        <table>
          <thead>
            <tr><th>Vehicle No</th><th>Driver</th><th>Phone</th><th>Type</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="6" style={{textAlign:'center', padding:'30px', color:'#aaa'}}>No vehicles found</td></tr>
            ) : filtered.map(v => (
              <tr key={v._id}>
                <td><strong>{v.vehicleNumber}</strong></td>
                <td>{v.driverName}</td>
                <td>{v.driverPhone}</td>
                <td>{v.vehicleType}</td>
                <td><span className={`badge ${v.status === 'Available' ? 'available' : v.status === 'On Trip' ? 'on-trip' : 'maintenance'}`}>{v.status}</span></td>
                <td>
                  <select className="status-select" onChange={e => handleStatus(v._id, e.target.value)} value={v.status}>
                    <option>Available</option><option>On Trip</option><option>Under Maintenance</option>
                  </select>
                  <button className="btn btn-danger" onClick={() => handleDelete(v._id)}>🗑️ Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Vehicles;
