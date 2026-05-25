import React, { useState, useEffect } from 'react';
import { appointmentService, petService, slotService } from '../services/api';
import { toast } from 'react-toastify';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ petId: '', slotId: '', reason: '', notes: '' });

  const fetchData = async () => {
    try {
      const [apptRes, petsRes, slotsRes] = await Promise.all([
        appointmentService.getAll(),
        petService.getAll(),
        slotService.getAll()
      ]);
      setAppointments(apptRes.data);
      setPets(petsRes.data);
      setSlots(slotsRes.data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await appointmentService.create(formData);
      toast.success('Appointment booked successfully');
      setShowForm(false);
      setFormData({ petId: '', slotId: '', reason: '', notes: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await appointmentService.cancel(id);
      toast.success('Appointment cancelled');
      fetchData();
    } catch (error) {
      toast.error('Failed to cancel appointment');
    }
  };

  if (loading) return <div className="loading">Loading appointments...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 className="page-title" style={{ margin: 0 }}>Appointments</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Book Appointment'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>Book New Appointment</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label>Select Pet</label>
                <select name="petId" value={formData.petId} onChange={handleChange} required>
                  <option value="">Choose a pet</option>
                  {pets.map((pet) => (
                    <option key={pet._id} value={pet._id}>{pet.name} ({pet.species})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Available Time Slot</label>
                <select name="slotId" value={formData.slotId} onChange={handleChange} required>
                  <option value="">Choose a time slot</option>
                  {slots.map((slot) => (
                    <option key={slot._id} value={slot._id}>
                      {slot.date} at {slot.time} - {slot.vetName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Reason for Visit</label>
              <input type="text" name="reason" value={formData.reason} onChange={handleChange} placeholder="Annual checkup, vaccination, etc." required />
            </div>
            <div className="form-group">
              <label>Additional Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Any additional information for the vet" rows="3" style={{ resize: 'vertical' }} />
            </div>
            <button type="submit" className="btn btn-primary">Book Appointment</button>
          </form>
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="card text-center">
          <p style={{ color: '#666', padding: '20px' }}>No appointments yet. Book your first one!</p>
        </div>
      ) : (
        <div>
          {appointments.map((appt) => (
            <div key={appt._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ color: 'var(--dark)', marginBottom: '8px' }}>
                    {appt.pet?.name} - {appt.reason}
                  </h3>
                  <p style={{ color: '#666', marginBottom: '5px' }}>
                    Date: {appt.slot?.date} at {appt.slot?.time}
                  </p>
                  <p style={{ color: '#666', marginBottom: '5px' }}>
                    Vet: {appt.slot?.vetName}
                  </p>
                  {appt.notes && (
                    <p style={{ color: '#666' }}>Notes: {appt.notes}</p>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                  <span className={`badge badge-${appt.status}`}>{appt.status}</span>
                  {(appt.status === 'pending' || appt.status === 'confirmed') && (
                    <button className="btn btn-danger" style={{ padding: '6px 14px', fontSize: '0.85rem' }} onClick={() => handleCancel(appt._id)}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Appointments;