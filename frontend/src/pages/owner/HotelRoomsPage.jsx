import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRoomsByHotelApi, deleteRoomApi, getHotelByIdApi } from '../../api/hotelApi';

const HotelRoomsPage = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingRoomId, setDeletingRoomId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [hotelId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hotelRes, roomsRes] = await Promise.all([
        getHotelByIdApi(hotelId),
        getRoomsByHotelApi(hotelId)
      ]);
      setHotel(hotelRes.data);
      console.log('Hotel data:', hotelRes.data);
      setRooms(roomsRes.data || []);
    } catch {
      setError('Failed to load rooms.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Delete this room?')) return;
    setDeletingRoomId(roomId);
    try {
      await deleteRoomApi(roomId);
      setRooms(rooms.filter(r => r.id !== roomId));
    } catch {
      setError('Failed to delete room.');
    } finally {
      setDeletingRoomId(null);
    }
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border" style={{ color: 'var(--primary)' }} />
      <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
        Loading rooms...
      </p>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <button
            className="btn btn-outline-secondary btn-sm mb-2"
            onClick={() => navigate('/owner/hotels')}
          >
            ← Back to My Hotels
          </button>
          <h4 className="page-title mb-0">
            {hotel?.name} — Rooms
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            📍 {hotel?.location} · {rooms.length} room{rooms.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/owner/hotels/${hotelId}/rooms/new`)}
        >
          🛏️ Add New Room
        </button>
      </div>

      {error && (
        <div style={{
          background: '#f8d7da', border: '1px solid #f5c6cb',
          borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
          marginBottom: '1rem', color: 'var(--danger)', fontSize: '0.875rem'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Hotel banner */}
      {hotel?.imageUrl && (
        <div style={{
          height: 200, borderRadius: 'var(--radius-lg)',
          overflow: 'hidden', marginBottom: '1.5rem',
          position: 'relative'
        }}>
          <img
            src={hotel.imageUrl}
            alt={hotel.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)'
          }} />
          <div style={{
            position: 'absolute', bottom: '1rem', left: '1.5rem',
            color: 'white', zIndex: 1
          }}>
            <h4 style={{
              fontFamily: 'Playfair Display, serif',
              margin: 0, color: 'white'
            }}>
              {hotel.name}
            </h4>
            <p style={{ margin: 0, opacity: 0.85 }}>📍 {hotel.location}</p>
          </div>
        </div>
      )}

      {rooms.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛏️</div>
          <h5 style={{ fontFamily: 'Playfair Display, serif', marginBottom: '0.5rem' }}>
            No rooms yet
          </h5>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Add your first room to start accepting bookings.
          </p>
          <button
            className="btn btn-primary px-4"
            onClick={() => navigate(`/owner/hotels/${hotelId}/rooms/new`)}
          >
            Add Room
          </button>
        </div>
      ) : (
        <div className="row">
          {rooms.map((room) => (
            <div className="col-md-6 col-lg-4 mb-4" key={room.id}>
              <div className="cozy-card h-100" style={{
                display: 'flex', flexDirection: 'column'
              }}>

                {/* Room image */}
                <div style={{
                  height: 180,
                  background: room.imageUrl
                    ? 'none'
                    : 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                  position: 'relative', overflow: 'hidden',
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  flexShrink: 0
                }}>
                  {room.imageUrl ? (
                    <img
                      src={room.imageUrl}
                      alt={`${room.bedType} room`}
                      style={{
                        width: '100%', height: '100%',
                        objectFit: 'cover', display: 'block'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.background =
                          'linear-gradient(135deg, var(--primary), var(--primary-light))';
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '3rem'
                    }}>
                      🛏️
                    </div>
                  )}

                  {/* Dark overlay */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)'
                  }} />

                  {/* Bed type overlay */}
                  <div style={{
                    position: 'absolute', bottom: '0.75rem', left: '1rem',
                    color: 'white', zIndex: 1
                  }}>
                    <div style={{
                      fontFamily: 'Playfair Display, serif',
                      fontWeight: 600, fontSize: '1rem',
                      textShadow: '0 1px 3px rgba(0,0,0,0.4)'
                    }}>
                      🛏️ {room.bedType} Bed Room
                    </div>
                    <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>
                      {room.roomSize} · Max {room.maxOccupancy} guests
                    </div>
                  </div>

                  {/* AC badge */}
                  <div style={{
                    position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 2
                  }}>
                    <span style={{
                      background: 'rgba(0,0,0,0.5)', color: 'white',
                      fontSize: '0.72rem', padding: '0.2rem 0.5rem',
                      borderRadius: '20px', fontWeight: 600
                    }}>
                      {room.isAC ? '❄️ AC' : 'Non-AC'}
                    </span>
                  </div>
                </div>

                {/* Room details */}
                <div style={{ padding: '1rem 1.25rem', flex: 1 }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <span className="amenity-badge">👥 Max {room.maxOccupancy}</span>
                      {' '}
                      <span className="amenity-badge">{room.roomSize}</span>
                    </div>
                  </div>
                  <div style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '1.5rem', fontWeight: 700,
                    color: 'var(--primary)'
                  }}>
                    ₹{room.baseFare?.toLocaleString()}
                    <span style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.78rem', fontWeight: 400,
                      color: 'var(--text-light)'
                    }}>
                      {' '}/night
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{
                  padding: '0.75rem 1.25rem',
                  borderTop: '1px solid var(--border)',
                  background: 'var(--surface-warm)',
                  display: 'flex', gap: '0.5rem',
                  flexShrink: 0
                }}>
                  <button
                    className="btn btn-outline-primary btn-sm flex-grow-1"
                    onClick={() => navigate(
                      `/owner/hotels/${hotelId}/rooms/${room.id}/edit`
                    )}
                  >
                    ✏️ Edit Room
                  </button>
                  <button
                    className="btn-deactivate"
                    onClick={() => handleDeleteRoom(room.id)}
                    disabled={deletingRoomId === room.id}
                  >
                    {deletingRoomId === room.id ? '...' : '🗑️ Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HotelRoomsPage;