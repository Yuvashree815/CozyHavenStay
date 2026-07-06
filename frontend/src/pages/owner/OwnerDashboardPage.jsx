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
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border" style={{ color: 'var(--primary)' }} role="status" />
      <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
    </div>
  );

  const quickActions = [
    { icon: '➕', label: 'Add New Hotel', path: '/owner/hotels/new', gold: true },
    { icon: '🏨', label: 'My Hotels', path: '/owner/hotels', gold: false },
    { icon: '📋', label: 'View Bookings', path: '/owner/hotels', gold: false },
    {
      icon: '💰',
      label: 'Pending Refunds',
      path: '/owner/refunds',
      gold: pendingRefunds.length > 0,
      badge: pendingRefunds.length > 0 ? pendingRefunds.length : null
    },
  ];

  return (
    <div>
      {/* Welcome header */}
      <div className="dashboard-header mb-4">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <p style={{
                color: 'var(--accent)',
                fontWeight: 600,
                fontSize: '0.8rem',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                marginBottom: '0.5rem'
              }}>
                Hotel Owner Portal
              </p>
              <h3 style={{ color: 'white', marginBottom: '0.25rem' }}>
                Welcome back, {user?.fullName?.split(' ')[0]} 👋
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 0, fontSize: '0.9rem' }}>
                Manage your hotels, bookings, and refunds from here.
              </p>
            </div>
            <button
              className="btn-gold"
              onClick={() => navigate('/owner/hotels/new')}
              style={{ borderRadius: 'var(--radius-sm)', whiteSpace: 'nowrap' }}
            >
              ➕ Add Hotel
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row mb-4">
        {[
          { icon: '🏨', value: hotels.length, label: 'Total Hotels', color: 'var(--primary)' },
          {
            icon: '✅',
            value: hotels.filter(h => h.isActive).length,
            label: 'Active Hotels',
            color: 'var(--success)'
          },
          {
            icon: '💰',
            value: pendingRefunds.length,
            label: 'Pending Refunds',
            color: pendingRefunds.length > 0 ? 'var(--warning)' : 'var(--success)'
          },
        ].map(({ icon, value, label, color }) => (
          <div className="col-md-4 mb-3" key={label}>
            <div className="stat-card">
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
              <div className="stat-number" style={{ color }}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h5 className="section-title mb-3">Quick Actions</h5>
      <div className="row mb-4">
        {quickActions.map(({ icon, label, path, gold, badge }) => (
          <div className="col-md-3 col-6 mb-2" key={label}>
            <button
              onClick={() => navigate(path)}
              style={{
                width: '100%',
                padding: '1.25rem 0.75rem',
                background: gold ? 'var(--accent)' : 'var(--surface)',
                border: `1.5px solid ${gold ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              {badge && (
                <span style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  background: 'var(--danger)',
                  color: 'white',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700
                }}>
                  {badge}
                </span>
              )}
              <div style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>{icon}</div>
              <div style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: gold ? 'var(--primary)' : 'var(--text-primary)'
              }}>
                {label}
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* My hotels summary */}
      {hotels.length > 0 && (
        <>
          <h5 className="section-title mb-3">My Hotels</h5>
          <div className="row">
            {hotels.slice(0, 3).map((hotel) => (
              <div className="col-md-4 mb-3" key={hotel.id}>
                <div className="cozy-card h-100">
                  {/* Hotel card image placeholder */}
                  <div style={{
                    height: 120,
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    position: 'relative'
                  }}>
                    🏨
                    <span style={{
                      position: 'absolute',
                      bottom: '0.5rem',
                      right: '0.5rem',
                      background: hotel.isActive
                        ? 'rgba(45,122,79,0.9)'
                        : 'rgba(192,57,43,0.9)',
                      color: 'white',
                      fontSize: '0.7rem',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '20px',
                      fontWeight: 600
                    }}>
                      {hotel.isActive ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </div>

                  <div style={{ padding: '1rem' }}>
                    <h6 style={{
                      fontFamily: 'Playfair Display, serif',
                      fontWeight: 600,
                      marginBottom: '0.25rem'
                    }}>
                      {hotel.name}
                    </h6>
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.82rem',
                      marginBottom: '0.75rem'
                    }}>
                      📍 {hotel.location}
                    </p>
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-outline-primary btn-sm flex-grow-1"
                        onClick={() => navigate(`/owner/hotels/${hotel.id}/bookings`)}
                      >
                        Bookings
                      </button>
                      <button
                        className="btn btn-primary btn-sm flex-grow-1"
                        onClick={() => navigate(`/owner/hotels/${hotel.id}/edit`)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pending refunds alert */}
      {pendingRefunds.length > 0 && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem 1.25rem',
          background: '#fff3cd',
          border: '1px solid #ffeeba',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div>
            <strong style={{ color: '#856404' }}>⚠️ Action Required</strong>
            <p style={{
              margin: 0,
              fontSize: '0.875rem',
              color: '#856404'
            }}>
              You have <strong>{pendingRefunds.length}</strong> pending
              refund(s) awaiting your approval.
            </p>
          </div>
          <button
            className="btn-gold"
            onClick={() => navigate('/owner/refunds')}
            style={{
              borderRadius: 'var(--radius-sm)',
              whiteSpace: 'nowrap',
              fontSize: '0.875rem'
            }}
          >
            Review Now →
          </button>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboardPage;