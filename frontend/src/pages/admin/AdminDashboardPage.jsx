import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsersApi, registerAdminApi } from '../../api/authApi';
import { getAllHotelsAdminApi } from '../../api/hotelApi';
import { useAuth } from '../../context/AuthContext';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsers: 0, totalHotels: 0 });
  const [loading, setLoading] = useState(true);

  // Register admin modal state
  const [showModal, setShowModal] = useState(false);
  const [adminForm, setAdminForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    phoneNumber: '',
    address: '',
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [usersRes, hotelsRes] = await Promise.all([
        getAllUsersApi(1, 1),
        getAllHotelsAdminApi(1, 1),
      ]);
      setStats({
        totalUsers: usersRes.data.totalCount,
        totalHotels: hotelsRes.data.totalCount,
      });
    } catch (err) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const handleAdminFormChange = (e) => {
    setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
  };

  const handleRegisterAdmin = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    if (adminForm.password !== adminForm.confirmPassword) {
      setRegisterError('Passwords do not match.');
      return;
    }

    setRegisterLoading(true);
    try {
      await registerAdminApi(adminForm);
      setRegisterSuccess('Admin registered successfully!');
      setAdminForm({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        gender: '',
        phoneNumber: '',
        address: '',
      });
      // Refresh stats
      fetchStats();
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors && errors.length > 0) {
        setRegisterError(errors.join(' '));
      } else {
        setRegisterError(err.response?.data?.message || 'Failed to register admin.');
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status" />
      <p className="mt-2">Loading dashboard...</p>
    </div>
  );

  return (
    <div>
      {/* Welcome header */}
      <div
        className="text-white p-4 rounded mb-4"
        style={{ background: 'linear-gradient(135deg, #0d6efd, #0a58ca)' }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h3 className="mb-1">Admin Dashboard 👑</h3>
            <p className="mb-0 opacity-75">Welcome, {user?.fullName}</p>
          </div>
          <button
            className="btn btn-light"
            onClick={() => {
              setShowModal(true);
              setRegisterError('');
              setRegisterSuccess('');
            }}
          >
            ➕ Add Admin
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center p-4">
              <div className="fs-1 mb-2">👥</div>
              <h2 className="fw-bold text-primary">{stats.totalUsers}</h2>
              <p className="text-muted mb-0">Total Users</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center p-4">
              <div className="fs-1 mb-2">🏨</div>
              <h2 className="fw-bold text-success">{stats.totalHotels}</h2>
              <p className="text-muted mb-0">Total Hotels</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center p-4">
              <div className="fs-1 mb-2">⚙️</div>
              <h2 className="fw-bold text-warning">Admin</h2>
              <p className="text-muted mb-0">System Role</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <h5 className="mb-3">Quick Actions</h5>
      <div className="row">
        {[
          {
            icon: '👥',
            label: 'Manage Users',
            desc: 'View and deactivate user accounts',
            path: '/admin/users',
            variant: 'primary'
          },
          {
            icon: '🏨',
            label: 'Manage Hotels',
            desc: 'View and deactivate hotel listings',
            path: '/admin/hotels',
            variant: 'success'
          },
        ].map(({ icon, label, desc, path, variant }) => (
          <div className="col-md-6 mb-3" key={label}>
            <div className="card shadow-sm h-100 border-0">
              <div className="card-body p-4">
                <div className="fs-2 mb-2">{icon}</div>
                <h5 className="fw-bold">{label}</h5>
                <p className="text-muted small mb-3">{desc}</p>
                <button
                  className={`btn btn-${variant}`}
                  onClick={() => navigate(path)}
                >
                  Go to {label}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Register Admin Modal */}
      {showModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div
                className="modal-header text-white"
                style={{ background: 'linear-gradient(135deg, #0d6efd, #0a58ca)' }}
              >
                <h5 className="modal-title">➕ Register New Admin</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body">
                {registerError && (
                  <div className="alert alert-danger">{registerError}</div>
                )}
                {registerSuccess && (
                  <div className="alert alert-success">{registerSuccess}</div>
                )}

                <form onSubmit={handleRegisterAdmin}>
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="fullName"
                      value={adminForm.fullName}
                      onChange={handleAdminFormChange}
                      required
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={adminForm.email}
                      onChange={handleAdminFormChange}
                      required
                      placeholder="Enter email"
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={adminForm.password}
                        onChange={handleAdminFormChange}
                        required
                        placeholder="Min 8 chars"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Confirm Password</label>
                      <input
                        type="password"
                        className="form-control"
                        name="confirmPassword"
                        value={adminForm.confirmPassword}
                        onChange={handleAdminFormChange}
                        required
                        placeholder="Repeat password"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Gender</label>
                      <select
                        className="form-select"
                        name="gender"
                        value={adminForm.gender}
                        onChange={handleAdminFormChange}
                        required
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="text"
                        className="form-control"
                        name="phoneNumber"
                        value={adminForm.phoneNumber}
                        onChange={handleAdminFormChange}
                        required
                        placeholder="e.g. 9876543210"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      value={adminForm.address}
                      onChange={handleAdminFormChange}
                      required
                      placeholder="Enter address"
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary flex-grow-1"
                      disabled={registerLoading}
                    >
                      {registerLoading ? 'Registering...' : 'Register Admin'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;