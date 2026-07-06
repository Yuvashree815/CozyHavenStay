import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHotelByIdApi, getAvailableRoomsApi } from '../../api/hotelApi';
import { getHotelRatingSummaryApi, getHotelReviewsApi } from '../../api/reviewApi';
import { useAuth } from '../../context/AuthContext';

const HotelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Date inputs for availability check
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);

  useEffect(() => {
    fetchHotelDetails();
  }, [id]);

  const fetchHotelDetails = async () => {
    setLoading(true);
    try {
      const [hotelRes, summaryRes, reviewsRes] = await Promise.all([
        getHotelByIdApi(id),
        getHotelRatingSummaryApi(id),
        getHotelReviewsApi(id, 1, 5),
      ]);
      setHotel(hotelRes.data);
      setRatingSummary(summaryRes.data);
      setReviews(reviewsRes.data.items || []);
    } catch (err) {
      setError('Failed to load hotel details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAvailability = async () => {
    setCheckingAvailability(true);
    try {
      const response = await getAvailableRoomsApi(id, checkIn, checkOut);
      setRooms(response.data);
      setAvailabilityChecked(true);
    } catch (err) {
      setError('Failed to check availability.');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const getAmenities = (hotel) => {
    const amenities = [];
    if (hotel.hasFreeWifi) amenities.push('📶 Free WiFi');
    if (hotel.hasDining) amenities.push('🍽️ Dining');
    if (hotel.hasParking) amenities.push('🚗 Parking');
    if (hotel.hasSwimmingPool) amenities.push('🏊 Swimming Pool');
    if (hotel.hasFitnessCenter) amenities.push('💪 Fitness Center');
    if (hotel.hasRoomService) amenities.push('🛎️ Room Service');
    return amenities;
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(Math.round(rating));
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status" />
      <p className="mt-2">Loading hotel details...</p>
    </div>
  );

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!hotel) return null;

  return (
    <div>
      {/* Back button */}
      <button
        className="btn btn-outline-secondary mb-3"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      {/* Hotel header */}
      <div
        className="text-white p-4 rounded mb-4"
        style={{ background: 'linear-gradient(135deg, #0d6efd, #0a58ca)' }}
      >
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h2 className="mb-1">{hotel.name}</h2>
            <p className="mb-2">📍 {hotel.location}</p>
            {ratingSummary && ratingSummary.totalReviews > 0 && (
              <span className="badge bg-warning text-dark fs-6">
                {renderStars(ratingSummary.averageRating)} {ratingSummary.averageRating} ({ratingSummary.totalReviews} reviews)
              </span>
            )}
          </div>
        </div>
        {hotel.description && (
          <p className="mt-3 mb-0 opacity-75">{hotel.description}</p>
        )}
      </div>

      {/* Amenities */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Amenities</h5>
          <div className="d-flex flex-wrap gap-2">
            {getAmenities(hotel).map((amenity) => (
              <span key={amenity} className="badge bg-primary fs-6 px-3 py-2">
                {amenity}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Availability checker */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Check Room Availability</h5>
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Check-in Date</label>
              <input
                type="date"
                className="form-control"
                value={checkIn}
                min={today}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Check-out Date</label>
              <input
                type="date"
                className="form-control"
                value={checkOut}
                min={checkIn}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <button
                className="btn btn-primary w-100"
                onClick={handleCheckAvailability}
                disabled={checkingAvailability}
              >
                {checkingAvailability ? 'Checking...' : 'Check Availability'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Available rooms */}
      {availabilityChecked && (
        <div className="mb-4">
          <h5 className="mb-3">
            {rooms.filter(r => r.isAvailable).length === 0
              ? '❌ No rooms available for selected dates'
              : `✅ ${rooms.filter(r => r.isAvailable).length} Room(s) Available`}
          </h5>
          <div className="row">
            {rooms.map((room) => (
              <div className="col-md-6 mb-3" key={room.id}>
                <div className={`card h-100 ${!room.isAvailable ? 'opacity-50' : 'shadow-sm'}`}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="card-title mb-0">
                        {room.bedType} Bed Room
                      </h6>
                      <span className={`badge ${room.isAvailable ? 'bg-success' : 'bg-danger'}`}>
                        {room.isAvailable ? 'Available' : 'Booked'}
                      </span>
                    </div>
                    <p className="text-muted small mb-1">📐 {room.roomSize}</p>
                    <p className="text-muted small mb-1">👥 Max {room.maxOccupancy} guests</p>
                    <p className="text-muted small mb-2">❄️ {room.isAC ? 'AC' : 'Non-AC'}</p>
                    <p className="fw-bold text-primary mb-3">
                      ₹{room.baseFare.toLocaleString()} / night
                    </p>
                    {room.isAvailable && (
                      <button
                        className="btn btn-success w-100"
                        onClick={() => {
                          if (!isAuthenticated) {
                            navigate('/login');
                            return;
                          }
                          navigate(`/book/${room.id}`, {
                            state: {
                              room,
                              hotel,
                              checkIn,
                              checkOut,
                            }
                          });
                        }}
                      >
                        Book Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">
            Guest Reviews
            {ratingSummary && ratingSummary.totalReviews > 0 && (
              <span className="text-muted fs-6 ms-2">
                ({ratingSummary.totalReviews} total)
              </span>
            )}
          </h5>
          {reviews.length === 0 ? (
            <p className="text-muted">No reviews yet for this hotel.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border-bottom pb-3 mb-3">
                <div className="d-flex justify-content-between">
                  <span className="fw-bold">Guest #{review.userId}</span>
                  <span className="text-warning">
                    {'⭐'.repeat(review.rating)}
                  </span>
                </div>
                {review.comment && (
                  <p className="mb-0 text-muted">{review.comment}</p>
                )}
                <small className="text-muted">
                  {new Date(review.createdAt).toLocaleDateString()}
                </small>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelDetailPage;