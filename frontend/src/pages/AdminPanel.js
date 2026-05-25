import React, { useState, useEffect } from 'react';
import { appointmentService, slotService } from '../services/api';
import { toast } from 'react-toastify';

const AdminPanel = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotForm, setSlotForm] = useState({ date: '', time: '', vetName: 'Dr. Mark' });
  const [showSlotForm, setShowSlotForm] = useState(false);

  const fetchAppointments = async () => {
    try {
      const res = await appointmentService.getAll();
      setAppointments(res.data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await appointmentService.update(id, { status });
      toast.success('Appointment status updated');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleSlotChange = (e) => {
    setSlotForm({ ...slotForm, [e.target.name]: e.target.value });
  };

  const handleSlotSubmit = async (e) => {
    e.preventDefault();
    try {
      await slotService.create(slotForm);
      toast.success('Time slot created');
      setSlotForm({ date: '', time: '', vetName: 'Dr. Mark' });
      setShowSlotForm(false);
    } catch (error) {
      toast.error('Failed to create slot');
    }
  };

  if (loading) return <div className="loading">Loading admin panel...</div>;

  return (
    <div className="container">
      <h2 className="page-title">Admin Panel</h2>

      <div className="card" style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Manage Time Slots</h3>
          <button className="btn btn-primary" onClick={() => setShowSlotForm(!showSlotForm)}>
            {showSlotForm ? 'Cancel' : 'Add Time Slot'}
          </button>
        </div>

        {showSlotForm && (
          <form onSubmit={handleSlotSubmit}>
            <div className="grid-3">
              <div className="form-group">
                <label>Date</label>
                <input type="date" name="date" value={slotForm.date} onChange={handleSlotChange} required />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input type="time" name="time" value={slotForm.time} onChange={handleSlotChange} required />
              </div>
              <div className="form-group">
                <label>Vet Name</label>
                <input type="text" name="vetName" value={slotForm.vetName} onChange={handleSlotChange} required />
              </div>
            </div>
            <button type="submit" className="btn btn-secondary">Create Slot</button>
          </form>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>All Appointments</h3>
        {appointments.length === 0 ? (
          <p style={{ color: '#666' }}>No appointments found.</p>
        ) : (
          appointments.map((appt) => (
            <div key={appt._id} style={{ padding: '15px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{appt.owner?.name}</strong>
                  <span style={{ color: '#666', margin: '0 10px' }}>|</span>
                  <strong>{appt.pet?.name}</strong> ({appt.pet?.species})
                  <p style={{ color: '#666', marginTop: '4px' }}>
                    {appt.reason} - {appt.slot?.date} at {appt.slot?.time}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span className={`badge badge-${appt.status}`}>{appt.status}</span>
                  {appt.status === 'pending' && (
                    <>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleStatusUpdate(appt._id, 'confirmed')}>
                        Confirm
                      </button>
                      <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleStatusUpdate(appt._id, 'cancelled')}>
                        Reject
                      </button>
                    </>
                  )}
                  {appt.status === 'confirmed' && (
                    <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleStatusUpdate(appt._id, 'completed')}>
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPanel;