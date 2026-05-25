import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { petService, appointmentService } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [petsRes, apptRes] = await Promise.all([
          petService.getAll(),
          appointmentService.getAll()
        ]);
        setPets(petsRes.data);
        setAppointments(apptRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'pending' || a.status === 'confirmed'
  );

  return (
    <div className="container">
      <h2 className="page-title">Welcome back, {user.name}</h2>

      <div className="grid-3" style={{ marginBottom: '30px' }}>
        <div className="card text-center">
          <h3 style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>{pets.length}</h3>
          <p style={{ color: '#666', marginTop: '5px' }}>Registered Pets</p>
        </div>
        <div className="card text-center">
          <h3 style={{ fontSize: '2.5rem', color: 'var(--secondary)' }}>
            {upcomingAppointments.length}
          </h3>
          <p style={{ color: '#666', marginTop: '5px' }}>Upcoming Appointments</p>
        </div>
        <div className="card text-center">
          <h3 style={{ fontSize: '2.5rem', color: '#856404' }}>
            {appointments.filter((a) => a.status === 'completed').length}
          </h3>
          <p style={{ color: '#666', marginTop: '5px' }}>Completed Visits</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>My Pets</h3>
            <Link to="/pets" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Manage Pets
            </Link>
          </div>
          {pets.length === 0 ? (
            <p style={{ color: '#666' }}>No pets added yet. Add your first pet!</p>
          ) : (
            pets.slice(0, 3).map((pet) => (
              <div key={pet._id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <strong>{pet.name}</strong>
                <span style={{ color: '#666', marginLeft: '10px', textTransform: 'capitalize' }}>
                  {pet.species} - {pet.breed}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Recent Appointments</h3>
            <Link to="/appointments" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              View All
            </Link>
          </div>
          {upcomingAppointments.length === 0 ? (
            <p style={{ color: '#666' }}>No upcoming appointments.</p>
          ) : (
            upcomingAppointments.slice(0, 3).map((appt) => (
              <div key={appt._id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <strong>{appt.pet?.name}</strong>
                <span style={{ color: '#666', marginLeft: '10px' }}>{appt.reason}</span>
                <div style={{ marginTop: '4px' }}>
                  <span className={`badge badge-${appt.status}`}>{appt.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;