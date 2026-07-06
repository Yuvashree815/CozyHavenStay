import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyHotelsApi, getRoomsByHotelApi, deleteRoomApi } from '../../api/hotelApi';

const MyHotelsPage = () => {
  const [hotels, setHotels] = useState([]);
  const [hotelRooms, setHotelRooms] = useState({});
  const [expandedHotel, setExpandedHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingRoomId, setDeletingRoomId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchHotels(); }, []);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const response = await getMyHotelsApi();
      setHotels(response.data || []);
    } catch {
      setError('Failed to load hotels.');
    } finally {
      setLoading(false);
    }
  };

  const handleExpandHotel = async (hotelId) => {
    if (expandedHotel === hotelId) {
      setExpandedHotel(null);
      return;
    }
    setExpandedHotel(hotelId);
    if (!hotelRooms[hotelId]) {
      try {
        const response = await getRoomsByHotelApi(hotelId);
        setHotelRooms({ ...hotelRooms, [hotelId]: response.data || [] });
      } catch {
        setHotelRooms({ ...hotelRooms, [hotelId]: [] });
      }
    }
  };

  const handleDeleteRoom = async (hotelId, roomId) => {
    if (!window.confirm('Delete this room?')) return;
    setDeletingRoomId(roomId);
    try {
      await deleteRoomApi(roomId);
      setHotelRooms({
        ...hotelRooms,
        [hotelId]: hotelRooms[hotelId].filter(r => r.id !== roomId)
      });
    } catch {
      setError('Failed to delete room.');
    } finally {
      setDeletingRoomId(null);
    }
  };

  const getAmenities = (hotel) => {
    const list = [];
    if (hotel.hasFreeWifi) list.push('📶 WiFi');
    if (hotel.hasDining) list.push('🍽️ Dining');
    if (hotel.hasParking) list.push('🚗 Parking');
    if (hotel.hasSwimmingPool) list.push('🏊 Pool');
    if (hotel.hasFitnessCenter) list.push('💪 Gym');
    if (hotel.hasRoomService) list.push('🛎️ Room Service');
    return list;
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border" style={{ color: 'var(--primary)' }} />
      <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
        Loading your hotels...
      </p>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h4 className="page-title">My Hotels</h4>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.875rem', margin: 0
          }}>
            Manage your properties and rooms
          </p>
        </div>
        <button className="btn btn-primary"
          onClick={() => navigate('/owner/hotels/new')}>
          ➕ Add New Hotel
        </button>
      </div>

      {error && (
        <div style={{
          background: '#f8d7da', border: '1px solid #f5c6cb',
          borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
          marginBottom: '1rem', color: 'var(--danger)', fontSize: '0.875rem'
        }}>⚠️ {error}</div>
      )}

      {hotels.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏨</div>
          <h5 style={{ fontFamily: 'Playfair Display, serif', marginBottom: '0.5rem' }}>
            No hotels yet
          </h5>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Add your first hotel to start receiving bookings.
          </p>
          <button className="btn btn-primary px-4"
            onClick={() => navigate('/owner/hotels/new')}>
            Add Hotel
          </button>
        </div>
      ) : (
        hotels.map((hotel) => (
          <div className="cozy-card mb-3" key={hotel.id}>
            <div style={{ padding: '1.25rem 1.5rem' }}>
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <h5 style={{
                      fontFamily: 'Playfair Display, serif',
                      fontWeight: 600, margin: 0, fontSize: '1.15rem'
                    }}>
                      {hotel.name}
                    </h5>
                    <span className={hotel.isActive
                      ? 'status-active' : 'status-inactive'}>
                      {hotel.isActive ? '● Active' : '● Inactive'}
                    </span>
                  </div>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem', marginBottom: '0.75rem'
                  }}>
                    📍 {hotel.location}
                  </p>
                  {hotel.description && (
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.82rem', marginBottom: '0.75rem',
                      lineHeight: 1.5
                    }}>
                      {hotel.description.length > 120
                        ? hotel.description.substring(0, 120) + '...'
                        : hotel.description}
                    </p>
                  )}
                  <div className="d-flex flex-wrap gap-1">
                    {getAmenities(hotel).map((a) => (
                      <span key={a} className="amenity-badge">{a}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{
              padding: '0.75rem 1.5rem',
              borderTop: '1px solid var(--border)',
              background: 'var(--surface-warm)',
              display: 'flex', gap: '0.5rem', flexWrap: 'wrap'
            }}>
              <button className="btn btn-outline-primary btn-sm"
                onClick={() => navigate(`/owner/hotels/${hotel.id}/bookings`)}>
                📋 View Bookings
              </button>
              <button className="btn btn-outline-secondary btn-sm"
                onClick={() => navigate(`/owner/hotels/${hotel.id}/edit`)}>
                ✏️ Edit Hotel
              </button>
              <button className="btn btn-primary btn-sm"
                onClick={() => navigate(`/owner/hotels/${hotel.id}/rooms/new`)}>
                🛏️ Add Room
              </button>
              <button
                className="btn btn-outline-secondary btn-sm ms-auto"
                onClick={() => handleExpandHotel(hotel.id)}
              >
                {expandedHotel === hotel.id ? '▲ Hide Rooms' : '▼ View Rooms'}
              </button>
            </div>

            {/* Expandable rooms */}
            {expandedHotel === hotel.id && (
              <div style={{
                padding: '1.25rem 1.5rem',
                borderTop: '1px solid var(--border)',
                background: 'var(--bg)'
              }}>
                {!hotelRooms[hotel.id] ? (
                  <div className="text-center py-2">
                    <div className="spinner-border spinner-border-sm"
                      style={{ color: 'var(--primary)' }} />
                  </div>
                ) : hotelRooms[hotel.id].length === 0 ? (
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem', margin: 0
                  }}>
                    No rooms added yet.
                  </p>
                ) : (
                  <div className="row">
                    {hotelRooms[hotel.id].map((room) => (
                      <div className="col-md-6 mb-2" key={room.id}>
                        <div style={{
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.75rem 1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{
                              fontWeight: 600, fontSize: '0.875rem',
                              marginBottom: '0.2rem'
                            }}>
                              🛏️ {room.bedType} Bed Room
                            </div>
                            <div style={{
                              fontSize: '0.78rem',
                              color: 'var(--text-secondary)'
                            }}>
                              {room.roomSize} · {room.isAC ? '❄️ AC' : 'Non-AC'}
                              {' · '}👥 Max {room.maxOccupancy}
                              {' · '}
                              <span style={{
                                fontWeight: 600,
                                color: 'var(--primary)'
                              }}>
                                ₹{room.baseFare?.toLocaleString()}/night
                              </span>
                            </div>
                          </div>
                          <div className="d-flex gap-1">
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => navigate(
                                `/owner/hotels/${hotel.id}/rooms/${room.id}/edit`
                              )}
                              title="Edit room"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-deactivate"
                              onClick={() => handleDeleteRoom(hotel.id, room.id)}
                              disabled={deletingRoomId === room.id}
                              title="Delete room"
                            >
                              {deletingRoomId === room.id ? '...' : '🗑️'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default MyHotelsPage;