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

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const response = await getMyHotelsApi();
      setHotels(response.data || []);
    } catch (err) {
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
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    setDeletingRoomId(roomId);
    try {
      await deleteRoomApi(roomId);
      setHotelRooms({
        ...hotelRooms,
        [hotelId]: hotelRooms[hotelId].filter(r => r.id !== roomId)
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete room.');
    } finally {
      setDeletingRoomId(null);
    }
  };

  const getAmenities = (hotel) => {
    const amenities = [];
    if (hotel.hasFreeWifi) amenities.push('📶 WiFi');
    if (hotel.hasDining) amenities.push('🍽️ Dining');
    if (hotel.hasParking) amenities.push('🚗 Parking');
    if (hotel.hasSwimmingPool) amenities.push('🏊 Pool');
    if (hotel.hasFitnessCenter) amenities.push('💪 Gym');
    if (hotel.hasRoomService) amenities.push('🛎️ Room Service');
    return amenities;
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status" />
      <p className="mt-2">Loading your hotels...</p>
    </div>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">My Hotels</h4>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/owner/hotels/new')}
        >
          + Add New Hotel
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {hotels.length === 0 ? (
        <div className="text-center py-5">
          <div className="fs-1">🏨</div>
          <h5 className="mt-3">No hotels yet</h5>
          <p className="text-muted">
            Add your first hotel to start receiving bookings.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/owner/hotels/new')}
          >
            Add Hotel
          </button>
        </div>
      ) : (
        hotels.map((hotel) => (
          <div className="card shadow-sm mb-3" key={hotel.id}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <h5 className="mb-0">{hotel.name}</h5>
                    <span className={`badge ${hotel.isActive ? 'bg-success' : 'bg-danger'}`}>
                      {hotel.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-muted mb-2">📍 {hotel.location}</p>
                  {hotel.description && (
                    <p className="text-muted small mb-2">
                      {hotel.description.length > 120
                        ? hotel.description.substring(0, 120) + '...'
                        : hotel.description}
                    </p>
                  )}
                  <div className="d-flex flex-wrap gap-1">
                    {getAmenities(hotel).map((a) => (
                      <span key={a} className="badge bg-light text-dark border">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Hotel actions */}
            <div className="card-footer bg-white d-flex gap-2 flex-wrap">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => navigate(`/owner/hotels/${hotel.id}/bookings`)}
              >
                📋 View Bookings
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => navigate(`/owner/hotels/${hotel.id}/edit`)}
              >
                ✏️ Edit Hotel
              </button>
              <button
                className="btn btn-outline-success btn-sm"
                onClick={() => navigate(`/owner/hotels/${hotel.id}/rooms/new`)}
              >
                🛏️ Add Room
              </button>
              <button
                className="btn btn-outline-info btn-sm"
                onClick={() => handleExpandHotel(hotel.id)}
              >
                {expandedHotel === hotel.id ? '▲ Hide Rooms' : '▼ View Rooms'}
              </button>
            </div>

            {/* Expandable rooms list */}
            {expandedHotel === hotel.id && (
              <div className="card-body border-top bg-light">
                {!hotelRooms[hotel.id] ? (
                  <div className="text-center py-2">
                    <div className="spinner-border spinner-border-sm text-primary" />
                  </div>
                ) : hotelRooms[hotel.id].length === 0 ? (
                  <p className="text-muted small mb-0">
                    No rooms added yet.
                  </p>
                ) : (
                  <div className="row">
                    {hotelRooms[hotel.id].map((room) => (
                      <div className="col-md-6 mb-2" key={room.id}>
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-body py-2 px-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <span className="fw-bold small">
                                  🛏️ {room.bedType} Bed
                                </span>
                                <span className="text-muted small ms-2">
                                  {room.roomSize}
                                </span>
                                <br />
                                <span className="text-muted small">
                                  👥 Max {room.maxOccupancy} |
                                  ❄️ {room.isAC ? 'AC' : 'Non-AC'} |
                                  💰 ₹{room.baseFare?.toLocaleString()}/night
                                </span>
                              </div>
                              <div className="d-flex gap-1">
                                <button
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() => navigate(
                                    `/owner/hotels/${hotel.id}/rooms/${room.id}/edit`
                                  )}
                                >
                                  ✏️
                                </button>
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleDeleteRoom(hotel.id, room.id)}
                                  disabled={deletingRoomId === room.id}
                                >
                                  {deletingRoomId === room.id ? '...' : '🗑️'}
                                </button>
                              </div>
                            </div>
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