import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { calculateFareApi } from '../../api/hotelApi';
import { createBookingApi } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';

const BookingPage = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Data passed from HotelDetailPage via navigate state
  const { room, hotel, checkIn, checkOut } = location.state || {};

  const [numberOfAdults, setNumberOfAdults] = useState(1);
  const [numberOfChildren, setNumberOfChildren] = useState(0);
  const [guestAges, setGuestAges] = useState(['']);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [fare, setFare] = useState(null);
  const [fareLoading, setFareLoading] = useState(false);
  const [fareError, setFareError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  // If no state was passed (direct URL access), redirect back
  useEffect(() => {
    if (!room || !hotel || !checkIn || !checkOut) {
      navigate('/');
    }
  }, []);

  // Update guest ages array when counts change
  useEffect(() => {
    const total = numberOfAdults + numberOfChildren;
    setGuestAges(Array(total).fill('').map((_, i) => guestAges[i] || ''));
  }, [numberOfAdults, numberOfChildren]);

  const handleAgeChange = (index, value) => {
    const updated = [...guestAges];
    updated[index] = value;
    setGuestAges(updated);
  };

  const handleCalculateFare = async () => {
    const ages = guestAges.map(Number);
    if (ages.some(isNaN) || ages.some(a => a < 0)) {
      setFareError('Please enter valid ages for all guests.');
      return;
    }

    setFareLoading(true);
    setFareError('');
    try {
      const response = await calculateFareApi(roomId, {
        checkIn,
        checkOut,
        numberOfAdults,
        numberOfChildren,
        allGuestAges: ages,
      });
      setFare(response.data);
    } catch (err) {
      setFareError(err.response?.data?.message || 'Failed to calculate fare.');
    } finally {
      setFareLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!fare) {
      setError('Please calculate the fare first.');
      return;
    }

    if (fare.exceedsMaxOccupancy) {
      setError('Number of guests exceeds room capacity.');
      return;
    }

    setBookingLoading(true);
    setError('');
    try {
      const response = await createBookingApi({
        hotelId: hotel.id,
        roomId: Number(roomId),
        checkIn,
        checkOut,
        numberOfAdults,
        numberOfChildren,
        guestAges: guestAges.map(Number),
        paymentMethod,
      });

      navigate(`/bookings/${response.data.id}`, {
        state: { bookingSuccess: true }
      });
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors && errors.length > 0) {
        setError(errors.join(' '));
      } else {
        setError(err.response?.data?.message || 'Booking failed. Please try again.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const nights = checkIn && checkOut
    ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000)
    : 0;

  if (!room || !hotel) return null;

  return (
    <div className="row">
      {/* Left — Booking form */}
      <div className="col-md-7">
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h4 className="card-title mb-4">Complete Your Booking</h4>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Guest count */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Number of Adults</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  max={room.maxOccupancy}
                  value={numberOfAdults}
                  onChange={(e) => setNumberOfAdults(Number(e.target.value))}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Number of Children</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  max={room.maxOccupancy - numberOfAdults}
                  value={numberOfChildren}
                  onChange={(e) => setNumberOfChildren(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Guest ages */}
            <div className="mb-3">
              <label className="form-label">Guest Ages</label>
              <div className="row g-2">
                {guestAges.map((age, index) => (
                  <div className="col-md-3 col-6" key={index}>
                    <input
                      type="number"
                      className="form-control"
                      placeholder={`Guest ${index + 1}`}
                      min="0"
                      max="120"
                      value={age}
                      onChange={(e) => handleAgeChange(index, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <small className="text-muted">
                Enter age for each guest — used for fare calculation
              </small>
            </div>

            {/* Payment method */}
            <div className="mb-4">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="UPI">UPI</option>
                <option value="CreditCard">Credit Card</option>
                <option value="DebitCard">Debit Card</option>
                <option value="NetBanking">Net Banking</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            {/* Calculate fare button */}
            {fareError && <div className="alert alert-warning">{fareError}</div>}
            <button
              className="btn btn-outline-primary w-100 mb-3"
              onClick={handleCalculateFare}
              disabled={fareLoading}
            >
              {fareLoading ? 'Calculating...' : '🧮 Calculate Fare'}
            </button>

            {/* Fare breakdown */}
            {fare && (
              <div className={`alert ${fare.exceedsMaxOccupancy ? 'alert-danger' : 'alert-info'}`}>
                {fare.exceedsMaxOccupancy ? (
                  <strong>❌ Guests exceed room capacity ({room.maxOccupancy} max)</strong>
                ) : (
                  <>
                    <div className="d-flex justify-content-between">
                      <span>Base fare per night:</span>
                      <span>₹{fare.baseFare.toLocaleString()}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Number of nights:</span>
                      <span>{fare.numberOfNights}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Free occupancy:</span>
                      <span>{fare.freeOccupancy} guests</span>
                    </div>
                    {fare.surchargeAmount > 0 && (
                      <div className="d-flex justify-content-between text-warning">
                        <span>Surcharge (extra guests):</span>
                        <span>₹{fare.surchargeAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <hr className="my-2" />
                    <div className="d-flex justify-content-between fw-bold">
                      <span>Total Fare:</span>
                      <span className="text-primary fs-5">
                        ₹{fare.totalFare.toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Confirm booking button */}
            <button
              className="btn btn-success w-100 btn-lg"
              onClick={handleBooking}
              disabled={bookingLoading || !fare || fare.exceedsMaxOccupancy}
            >
              {bookingLoading ? 'Confirming...' : '✅ Confirm Booking'}
            </button>
          </div>
        </div>
      </div>

      {/* Right — Booking summary */}
      <div className="col-md-5">
        <div className="card shadow-sm mb-4 sticky-top" style={{ top: '80px' }}>
          <div
            className="card-header text-white"
            style={{ background: 'linear-gradient(135deg, #0d6efd, #0a58ca)' }}
          >
            <h5 className="mb-0">Booking Summary</h5>
          </div>
          <div className="card-body">
            <h6 className="fw-bold">{hotel.name}</h6>
            <p className="text-muted small mb-3">📍 {hotel.location}</p>

            <div className="mb-2">
              <span className="text-muted">Room Type:</span>
              <span className="float-end fw-bold">{room.bedType} Bed</span>
            </div>
            <div className="mb-2">
              <span className="text-muted">Room Size:</span>
              <span className="float-end">{room.roomSize}</span>
            </div>
            <div className="mb-2">
              <span className="text-muted">AC:</span>
              <span className="float-end">{room.isAC ? 'Yes' : 'No'}</span>
            </div>
            <hr />
            <div className="mb-2">
              <span className="text-muted">Check-in:</span>
              <span className="float-end fw-bold">
                {new Date(checkIn).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </span>
            </div>
            <div className="mb-2">
              <span className="text-muted">Check-out:</span>
              <span className="float-end fw-bold">
                {new Date(checkOut).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </span>
            </div>
            <div className="mb-2">
              <span className="text-muted">Duration:</span>
              <span className="float-end">{nights} night{nights !== 1 ? 's' : ''}</span>
            </div>
            <hr />
            <div className="mb-2">
              <span className="text-muted">Base fare/night:</span>
              <span className="float-end">₹{room.baseFare.toLocaleString()}</span>
            </div>
            <div className="mb-2">
              <span className="text-muted">Booked by:</span>
              <span className="float-end">{user?.fullName}</span>
            </div>

            {/* Cancellation policy notice */}
            <div className="alert alert-light border mt-3 mb-0 small">
              <strong>Cancellation Policy:</strong>
              <ul className="mb-0 ps-3 mt-1">
                <li>Full refund if cancelled 48+ hours before check-in</li>
                <li>50% refund if cancelled 24-48 hours before</li>
                <li>No refund within 24 hours of check-in</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;