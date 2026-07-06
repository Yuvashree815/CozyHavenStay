import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyHotelsApi } from '../../api/hotelApi';
import { getPendingRefundsApi } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';

const OwnerDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [pendingRefunds, setPendingRefunds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [hotelsRes, refundsRes] = await Promise.all([
        getMyHotelsApi(),
        getPendingRefundsApi(),
      ]);
      setHotels(hotelsRes.data || []);
      setPendingRefunds(refundsRes.data || []);
    } catch (err) {
      // Silent fail — dashboard still renders with empty data
    } finally {
      setLoading(false);
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
        <h3 className="mb-1">Welcome back, {user?.fullName} 👋</h3>
        <p className="mb-0 opacity-75">Hotel Owner Dashboard</p>
      </div>

      {/* Stats cards */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center p-4">
              <div className="fs-1 mb-2">🏨</div>
              <h2 className="fw-bold text-primary">{hotels.length}</h2>
              <p className="text-muted mb-0">My Hotels</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center p-4">
              <div className="fs-1 mb-2">💰</div>
              <h2 className="fw-bold text-warning">{pendingRefunds.length}</h2>
              <p className="text-muted mb-0">Pending Refunds</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center p-4">
              <div className="fs-1 mb-2">🛏️</div>
              <h2 className="fw-bold text-success">
                {hotels.filter(h => h.isActive).length}
              </h2>
              <p className="text-muted mb-0">Active Hotels</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <h5 className="mb-3">Quick Actions</h5>
      <div className="row mb-4">
        {[
          {
            icon: '➕',
            label: 'Add New Hotel',
            path: '/owner/hotels/new',
            variant: 'primary'
          },
          {
            icon: '🏨',
            label: 'My Hotels',
            path: '/owner/hotels',
            variant: 'outline-primary'
          },
          {
            icon: '📋',
            label: 'View Bookings',
            path: '/owner/hotels',
            variant: 'outline-primary'
          },
          {
            icon: '💰',
            label: 'Pending Refunds',
            path: '/owner/refunds',
            variant: pendingRefunds.length > 0 ? 'warning' : 'outline-secondary'
          },
        ].map(({ icon, label, path, variant }) => (
          <div className="col-md-3 col-6 mb-2" key={label}>
            <button
              className={`btn btn-${variant} w-100 py-3`}
              onClick={() => navigate(path)}
            >
              <div className="fs-4 mb-1">{icon}</div>
              <small>{label}</small>
            </button>
          </div>
        ))}
      </div>

      {/* My hotels summary */}
      {hotels.length > 0 && (
        <>
          <h5 className="mb-3">My Hotels</h5>
          <div className="row">
            {hotels.slice(0, 3).map((hotel) => (
              <div className="col-md-4 mb-3" key={hotel.id}>
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="fw-bold">{hotel.name}</h6>
                    <p className="text-muted small mb-2">📍 {hotel.location}</p>
                    <span className={`badge ${hotel.isActive ? 'bg-success' : 'bg-danger'} mb-2`}>
                      {hotel.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="card-footer bg-white border-0 d-flex gap-1">
                    <button
                      className="btn btn-outline-primary btn-sm flex-grow-1"
                      onClick={() => navigate(`/owner/hotels/${hotel.id}/bookings`)}
                    >
                      Bookings
                    </button>
                    <button
                      className="btn btn-outline-secondary btn-sm flex-grow-1"
                      onClick={() => navigate(`/owner/hotels/${hotel.id}/edit`)}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pending refunds alert */}
      {pendingRefunds.length > 0 && (
        <div className="alert alert-warning d-flex justify-content-between align-items-center mt-3">
          <span>
            ⚠️ You have <strong>{pendingRefunds.length}</strong> pending refund(s) awaiting approval.
          </span>
          <button
            className="btn btn-warning btn-sm"
            onClick={() => navigate('/owner/refunds')}
          >
            Review Now
          </button>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboardPage;