import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [form, setForm] = useState({
    deliveryId: '', vehicleNumber: '', driverName: '',
    from: '', to: '', goods: '', scheduledDate: '', status: 'Pending'
  });

  const fetchDeliveries = () => {
    axios.get('http://localhost:5000/api/deliveries').then(res => setDeliveries(res.data));
  };

  useEffect(() => { fetchDeliveries(); }, []);

  const handleSubmit = async () => {
    if (!form.deliveryId || !form.from || !form.to || !form.goods) return alert('Please fill all fields!');
    await axios.post('http://localhost:5000/api/deliveries', form);
    setForm({ deliveryId: '', vehicleNumber: '', driverName: '', from: '', to: '', goods: '', scheduledDate: '', status: 'Pending' });
    fetchDeliveries();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this delivery?')) {
      await axios.delete(`http://localhost:5000/api/deliveries/${id}`);
      setSelectedDelivery(null);
      fetchDeliveries();
    }
  };

  const handleStatus = async (id, status) => {
    await axios.put(`http://localhost:5000/api/deliveries/${id}`, { status });
    fetchDeliveries();
    if (selectedDelivery && selectedDelivery._id === id) {
      setSelectedDelivery({ ...selectedDelivery, status });
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Delivery Report - Transport Module', 14, 16);
    autoTable(doc, {
      head: [['ID', 'Vehicle', 'Driver', 'From', 'To', 'Goods', 'Date', 'Status']],
      body: filtered.map(d => [d.deliveryId, d.vehicleNumber, d.driverName, d.from, d.to, d.goods, new Date(d.scheduledDate).toLocaleDateString(), d.status]),
      startY: 24,
    });
    doc.save('deliveries-report.pdf');
  };

  const exportCSV = () => {
    const rows = [
      ['ID', 'Vehicle', 'Driver', 'From', 'To', 'Goods', 'Date', 'Status'],
      ...filtered.map(d => [d.deliveryId, d.vehicleNumber, d.driverName, d.from, d.to, d.goods, new Date(d.scheduledDate).toLocaleDateString(), d.status])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'deliveries.csv'; a.click();
  };

  const filtered = deliveries.filter(d => {
    const matchSearch = d.deliveryId.toLowerCase().includes(search.toLowerCase()) ||
      d.driverName.toLowerCase().includes(search.toLowerCase()) ||
      d.from.toLowerCase().includes(search.toLowerCase()) ||
      d.to.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const timelineSteps = ['Pending', 'In Transit', 'Delivered'];
  const getStepIndex = (status) => {
    if (status === 'Cancelled') return -1;
    return timelineSteps.indexOf(status);
  };

  return (
    <div>
      <p className="page-title">📦 Delivery Management</p>

      <div className="card">
        <h2>➕ Schedule New Delivery</h2>
        <div className="form-grid">
          <input placeholder="Delivery ID (e.g. DEL001)" value={form.deliveryId} onChange={e => setForm({...form, deliveryId: e.target.value})} />
          <input placeholder="Vehicle Number" value={form.vehicleNumber} onChange={e => setForm({...form, vehicleNumber: e.target.value})} />
          <input placeholder="Driver Name" value={form.driverName} onChange={e => setForm({...form, driverName: e.target.value})} />
          <input placeholder="From (City/Location)" value={form.from} onChange={e => setForm({...form, from: e.target.value})} />
          <input placeholder="To (City/Location)" value={form.to} onChange={e => setForm({...form, to: e.target.value})} />
          <input placeholder="Goods Description" value={form.goods} onChange={e => setForm({...form, goods: e.target.value})} />
          <input type="date" value={form.scheduledDate} onChange={e => setForm({...form, scheduledDate: e.target.value})} />
        </div>
        <button className="btn btn-primary" onClick={handleSubmit}>🚚 Schedule Delivery</button>
      </div>

      {selectedDelivery && (
        <div className="card">
          <h2>📍 Delivery Timeline — {selectedDelivery.deliveryId}</h2>
          {selectedDelivery.status === 'Cancelled' ? (
            <p style={{color:'#e53935', fontWeight:'bold', padding:'20px 0'}}>❌ This delivery has been cancelled.</p>
          ) : (
            <div style={{display:'flex', alignItems:'center', padding:'20px 0', gap:'0'}}>
              {timelineSteps.map((step, index) => {
                const currentIndex = getStepIndex(selectedDelivery.status);
                const isCompleted = index <= currentIndex;
                const isActive = index === currentIndex;
                return (
                  <React.Fragment key={step}>
                    <div style={{display:'flex', flexDirection:'column', alignItems:'center', minWidth:'120px'}}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '50%',
                        background: isCompleted ? '#1a73e8' : '#e0e4ed',
                        color: isCompleted ? 'white' : '#aaa',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '20px', fontWeight: 'bold',
                        boxShadow: isActive ? '0 0 0 4px rgba(26,115,232,0.2)' : 'none',
                        transition: 'all 0.3s'
                      }}>
                        {isCompleted ? '✓' : index + 1}
                      </div>
                      <p style={{marginTop:'8px', fontSize:'13px', fontWeight: isActive ? '700' : '500', color: isCompleted ? '#1a73e8' : '#aaa'}}>{step}</p>
                    </div>
                    {index < timelineSteps.length - 1 && (
                      <div style={{flex:1, height:'4px', background: index < currentIndex ? '#1a73e8' : '#e0e4ed', transition:'all 0.3s', marginBottom:'22px'}} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
          <div style={{display:'flex', gap:'10px', marginTop:'10px', flexWrap:'wrap'}}>
            <strong>Update Status:</strong>
            {['Pending','In Transit','Delivered','Cancelled'].map(s => (
              <button key={s} className="btn btn-primary" style={{padding:'7px 14px', fontSize:'13px'}}
                onClick={() => handleStatus(selectedDelivery._id, s)}>{s}</button>
            ))}
            <button className="btn btn-danger" onClick={() => handleDelete(selectedDelivery._id)}>🗑️ Delete</button>
            <button className="btn" style={{background:'#f5f5f5', color:'#333'}} onClick={() => setSelectedDelivery(null)}>✕ Close</button>
          </div>
        </div>
      )}

      <div className="card">
        <h2>📦 All Deliveries</h2>
        <div style={{display:'flex', gap:'10px', marginBottom:'16px', flexWrap:'wrap'}}>
          <input placeholder="🔍 Search by ID, driver, city..." value={search} onChange={e => setSearch(e.target.value)} style={{flex:1, minWidth:'200px'}} />
          <select className="status-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option>All</option><option>Pending</option><option>In Transit</option><option>Delivered</option><option>Cancelled</option>
          </select>
          <button className="btn btn-primary" onClick={exportPDF}>📄 Export PDF</button>
          <button className="btn btn-primary" onClick={exportCSV}>📊 Export CSV</button>
        </div>
        <table>
          <thead>
            <tr><th>Delivery ID</th><th>Vehicle</th><th>Driver</th><th>From</th><th>To</th><th>Goods</th><th>Date</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="9" style={{textAlign:'center', padding:'30px', color:'#aaa'}}>No deliveries found</td></tr>
            ) : filtered.map(d => (
              <tr key={d._id} style={{cursor:'pointer'}} onClick={() => setSelectedDelivery(d)}>
                <td><strong style={{color:'#1a73e8'}}>{d.deliveryId}</strong></td>
                <td>{d.vehicleNumber}</td>
                <td>{d.driverName}</td>
                <td>{d.from}</td>
                <td>{d.to}</td>
                <td>{d.goods}</td>
                <td>{new Date(d.scheduledDate).toLocaleDateString()}</td>
                <td><span className={`badge ${d.status === 'Delivered' ? 'delivered' : d.status === 'In Transit' ? 'transit' : d.status === 'Cancelled' ? 'cancelled' : 'pending'}`}>{d.status}</span></td>
                <td onClick={e => e.stopPropagation()}>
                  <select className="status-select" onChange={e => handleStatus(d._id, e.target.value)} value={d.status}>
                    <option>Pending</option><option>In Transit</option><option>Delivered</option><option>Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{color:'#aaa', fontSize:'12px', marginTop:'10px'}}>💡 Click any row to see the delivery timeline</p>
      </div>
    </div>
  );
}

export default Deliveries;