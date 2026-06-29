import React, { useState, useEffect } from 'react';
import './app.css';

function App() {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // Fetch all clients
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clients`);
      const data = await response.json();
      if (data.status === 'success') {
        setClients(data.clients);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name cannot be blank';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    const cleanedMobile = formData.mobile.replace(/[\s\-\+\(\)]/g, '');
    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!cleanedMobile.match(/^\d+$/)) {
      newErrors.mobile = 'Mobile must contain only digits';
    } else if (cleanedMobile.length < 10) {
      newErrors.mobile = 'Mobile must have at least 10 digits';
    } else if (cleanedMobile.length > 15) {
      newErrors.mobile = 'Mobile must not exceed 15 digits';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address cannot be blank';
    } else if (formData.address.trim().length < 5) {
      newErrors.address = 'Address must be at least 5 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', mobile: '', address: '' });
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (client) => {
    setEditingId(client.id);
    setFormData({
      name: client.name,
      email: client.email,
      mobile: client.mobile,
      address: client.address
    });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', email: '', mobile: '', address: '' });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setSuccessMessage(editingId ? 'Client updated successfully!' : 'Client added successfully!');
        closeModal();
        fetchClients();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrors({ submit: data.detail || 'Failed to save client' });
      }
    } catch (error) {
      setErrors({ submit: 'Error connecting to server. Make sure backend is running on ' + API_BASE_URL });
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchClients();
          setSuccessMessage('Client deleted successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
        }
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>📋 CMS</h2>
          <p></p>
        </div>
        
        <nav className="sidebar-menu">
          <button 
            className={`menu-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveMenu('dashboard')}
          >
            <span className="icon">📊</span>
            <span>Dashboard</span>
          </button>
          <button 
            className={`menu-item ${activeMenu === 'clients' ? 'active' : ''}`}
            onClick={() => setActiveMenu('clients')}
          >
            <span className="icon">👥</span>
            <span>Clients</span>
          </button>
          <button 
            className={`menu-item ${activeMenu === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveMenu('settings')}
          >
            <span className="icon">⚙️</span>
            <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <p>Version 1.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-header">
          <h1>Clients Management</h1>
          <button className="add-btn" onClick={openAddModal}>
            ➕ Add Client
          </button>
        </div>

        {successMessage && (
          <div className="success-message">
            ✓ {successMessage}
          </div>
        )}

        {/* Clients List */}
        <div className="clients-container">
          {clients.length === 0 ? (
            <div className="empty-state">
              <p>No clients added yet.</p>
              <button className="add-btn-secondary" onClick={openAddModal}>
                Add First Client
              </button>
            </div>
          ) : (
            <table className="clients-table">
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client, index) => (
                  <tr key={client.id} className={index % 2 === 0 ? 'even' : 'odd'}>
                    <td><strong>{client.name}</strong></td>
                    <td>{client.email}</td>
                    <td>{client.mobile}</td>
                    <td className="address-cell">{client.address}</td>
                    <td className="actions-cell">
                      <button 
                        className="edit-btn"
                        onClick={() => openEditModal(client)}
                        title="Edit client"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteClient(client.id)}
                        title="Delete client"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Modal Overlay */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Client' : 'Add New Client'}</h2>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>

            {errors.submit && (
              <div className="error-message">
                ✗ {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="client-form">
              <div className="form-group">
                <label htmlFor="name">Client Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter client name"
                  className={errors.name ? 'input-error' : ''}
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Client Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email (e.g., client@example.com)"
                  className={errors.email ? 'input-error' : ''}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="mobile">Mobile Number *</label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="Enter mobile number (10-15 digits)"
                  className={errors.mobile ? 'input-error' : ''}
                />
                {errors.mobile && <span className="field-error">{errors.mobile}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="address">Client Address *</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter complete address"
                  rows="3"
                  className={errors.address ? 'input-error' : ''}
                />
                {errors.address && <span className="field-error">{errors.address}</span>}
              </div>

              <div className="modal-actions">
                <button 
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : editingId ? 'Update Client' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
