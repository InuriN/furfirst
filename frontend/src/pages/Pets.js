import React, { useState, useEffect } from 'react';
import { petService } from '../services/api';
import { toast } from 'react-toastify';

const Pets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editPet, setEditPet] = useState(null);
  const [formData, setFormData] = useState({
    name: '', species: 'dog', breed: '', age: '', weight: '', notes: ''
  });

  const fetchPets = async () => {
    try {
      const res = await petService.getAll();
      setPets(res.data);
    } catch (error) {
      toast.error('Failed to load pets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPets(); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editPet) {
        await petService.update(editPet._id, formData);
        toast.success('Pet updated successfully');
      } else {
        await petService.create(formData);
        toast.success('Pet added successfully');
      }
      setShowForm(false);
      setEditPet(null);
      setFormData({ name: '', species: 'dog', breed: '', age: '', weight: '', notes: '' });
      fetchPets();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const handleEdit = (pet) => {
    setEditPet(pet);
    setFormData({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      age: pet.age || '',
      weight: pet.weight || '',
      notes: pet.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this pet?')) return;
    try {
      await petService.delete(id);
      toast.success('Pet removed');
      fetchPets();
    } catch (error) {
      toast.error('Failed to delete pet');
    }
  };

  if (loading) return <div className="loading">Loading pets...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 className="page-title" style={{ margin: 0 }}>My Pets</h2>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditPet(null); setFormData({ name: '', species: 'dog', breed: '', age: '', weight: '', notes: '' }); }}>
          {showForm ? 'Cancel' : 'Add New Pet'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>{editPet ? 'Edit Pet' : 'Add New Pet'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label>Pet Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Bella" required />
              </div>
              <div className="form-group">
                <label>Species</label>
                <select name="species" value={formData.species} onChange={handleChange}>
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
                  <option value="rabbit">Rabbit</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Breed</label>
                <input type="text" name="breed" value={formData.breed} onChange={handleChange} placeholder="Labrador" />
              </div>
              <div className="form-group">
                <label>Age (years)</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="3" min="0" />
              </div>
              <div className="form-group">
                <label>Weight (kg)</label>
                <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="25" min="0" />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <input type="text" name="notes" value={formData.notes} onChange={handleChange} placeholder="Any special conditions" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              {editPet ? 'Update Pet' : 'Add Pet'}
            </button>
          </form>
        </div>
      )}

      {pets.length === 0 ? (
        <div className="card text-center">
          <p style={{ color: '#666', padding: '20px' }}>No pets added yet. Add your first pet above!</p>
        </div>
      ) : (
        <div className="grid-3">
          {pets.map((pet) => (
            <div key={pet._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ color: 'var(--primary)', marginBottom: '5px' }}>{pet.name}</h3>
                  <p style={{ textTransform: 'capitalize', color: '#666' }}>{pet.species} - {pet.breed}</p>
                </div>
                <span style={{ fontSize: '2rem' }}>
                  {pet.species === 'dog' ? '' : pet.species === 'cat' ? '' : ''}
                </span>
              </div>
              <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#555' }}>
                {pet.age && <p>Age: {pet.age} years</p>}
                {pet.weight && <p>Weight: {pet.weight} kg</p>}
                {pet.notes && <p>Notes: {pet.notes}</p>}
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button className="btn btn-secondary" style={{ flex: 1, padding: '8px' }} onClick={() => handleEdit(pet)}>
                  Edit
                </button>
                <button className="btn btn-danger" style={{ flex: 1, padding: '8px' }} onClick={() => handleDelete(pet._id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Pets;