import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { calculateFareApi } from "../../api/hotelApi";
import { createBookingApi } from "../../api/bookingApi";
import { useAuth } from "../../context/AuthContext";

const BookingPage = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { room, hotel, checkIn, checkOut } = location.state || {};

  const [numberOfAdults, setNumberOfAdults] = useState(1);
  const [numberOfChildren, setNumberOfChildren] = useState(0);
  const [guestAges, setGuestAges] = useState([""]);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [fare, setFare] = useState(null);
  const [fareLoading, setFareLoading] = useState(false);
  const [fareError, setFareError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!room || !hotel || !checkIn || !checkOut) {
      navigate("/");
    }
  }, []);

  useEffect(() => {
    const total = numberOfAdults + numberOfChildren;
    setGuestAges(
      Array(total)
        .fill("")
        .map((_, i) => guestAges[i] || ""),
    );
  }, [numberOfAdults, numberOfChildren]);

  // Validate check-in and check-out dates
  const dateError = (() => {
    if (!checkIn || !checkOut) return null;
    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (ci < today) return "Check-in date cannot be in the past.";
    if (co <= ci) return "Check-out date must be after check-in date.";
    return null;
  })();

  const handleAgeChange = (index, value) => {
    const updated = [...guestAges];
    updated[index] = value;
    setGuestAges(updated);
  };

  const handleCalculateFare = async () => {
    if (dateError) {
      setFareError(dateError);
      return;
    }
    const ages = guestAges.map(Number);
    if (ages.some(isNaN) || ages.some((a) => a < 0)) {
      setFareError("Please enter valid ages for all guests.");
      return;
    }
    setFareLoading(true);
    setFareError("");
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
      setFareError(err.response?.data?.message || "Failed to calculate fare.");
    } finally {
      setFareLoading(false);
    }
  };

  const handleBooking = async () => {
    if (dateError) {
      setError(dateError);
      return;
    }
    if (!fare) {
      setError("Please calculate the fare first.");
      return;
    }
    if (fare.exceedsMaxOccupancy) {
      setError("Number of guests exceeds room capacity.");
      return;
    }
    setBookingLoading(true);
    setError("");
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
        guestEmail: user?.email,
        guestName: user?.fullName,
      });
      navigate(`/bookings/${response.data.id}`, {
        state: { bookingSuccess: true },
      });
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(
        errors?.length > 0
          ? errors.join(" ")
          : err.response?.data?.message || "Booking failed.",
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const nights =
    checkIn && checkOut
      ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000)
      : 0;

  if (!room || !hotel) return null;

  return (
    <div className="row">
      {/* Left — Booking form */}
      <div className="col-lg-7 mb-4">
        <div className="cozy-form-card">
          <div className="cozy-form-header">
            <h5
              style={{
                color: "white",
                margin: 0,
                fontFamily: "Playfair Display, serif",
              }}
            >
              🛏️ Complete Your Booking
            </h5>
          </div>
          <div className="cozy-form-body">
            {/* Date error — shown inline at top */}
            {dateError && (
              <div
                style={{
                  background: "#f8d7da",
                  border: "1px solid #f5c6cb",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.75rem 1rem",
                  marginBottom: "1rem",
                  color: "var(--danger)",
                  fontSize: "0.9rem",
                }}
              >
                ⚠️ {dateError}
              </div>
            )}

            {/* General error */}
            {error && (
              <div
                style={{
                  background: "#f8d7da",
                  border: "1px solid #f5c6cb",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.75rem 1rem",
                  marginBottom: "1rem",
                  color: "var(--danger)",
                  fontSize: "0.9rem",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* Guest count */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Adults</label>
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
                <label className="form-label">Children</label>
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
              <small style={{ color: "var(--text-light)", fontSize: "0.8rem" }}>
                Ages affect surcharge calculation
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

            {/* Fare error */}
            {fareError && (
              <div
                style={{
                  background: "#fff3cd",
                  border: "1px solid #ffeeba",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.75rem 1rem",
                  marginBottom: "1rem",
                  color: "#856404",
                  fontSize: "0.875rem",
                }}
              >
                ⚠️ {fareError}
              </div>
            )}

            <button
              className="btn btn-outline-primary w-100 mb-3"
              onClick={handleCalculateFare}
              disabled={fareLoading || !!dateError}
            >
              {fareLoading ? "Calculating..." : "🧮 Calculate Fare"}
            </button>

            {/* Fare breakdown */}
            {fare && (
              <div
                style={{
                  background: fare.exceedsMaxOccupancy
                    ? "#f8d7da"
                    : "var(--surface-warm)",
                  border: `1px solid ${
                    fare.exceedsMaxOccupancy ? "#f5c6cb" : "var(--border)"
                  }`,
                  borderRadius: "var(--radius-md)",
                  padding: "1.25rem",
                  marginBottom: "1rem",
                }}
              >
                {fare.exceedsMaxOccupancy ? (
                  <div style={{ color: "var(--danger)", fontWeight: 600 }}>
                    ❌ Guests exceed room capacity ({room.maxOccupancy} max)
                  </div>
                ) : (
                  <>
                    <h6
                      style={{
                        marginBottom: "0.75rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      Fare Breakdown
                    </h6>
                    {[
                      {
                        label: "Base fare / night",
                        value: `₹${fare.baseFare.toLocaleString()}`,
                      },
                      { label: "Number of nights", value: fare.numberOfNights },
                      {
                        label: "Free occupancy",
                        value: `${fare.freeOccupancy} guests`,
                      },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.875rem",
                          marginBottom: "0.4rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <span>{label}</span>
                        <span style={{ fontWeight: 500 }}>{value}</span>
                      </div>
                    ))}
                    {fare.surchargeAmount > 0 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.875rem",
                          marginBottom: "0.4rem",
                          color: "#856404",
                        }}
                      >
                        <span>⚠️ Extra guest surcharge</span>
                        <span style={{ fontWeight: 500 }}>
                          +₹{fare.surchargeAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <hr
                      style={{
                        borderColor: "var(--border)",
                        margin: "0.75rem 0",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>Total Fare</span>
                      <span className="price-tag">
                        ₹{fare.totalFare.toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            <button
              className="btn btn-primary w-100"
              onClick={handleBooking}
              disabled={
                bookingLoading ||
                !fare ||
                fare.exceedsMaxOccupancy ||
                !!dateError
              }
              style={{ padding: "0.85rem", fontSize: "1rem" }}
            >
              {bookingLoading ? "Confirming..." : "✅ Confirm Booking"}
            </button>
          </div>
        </div>
      </div>

      {/* Right — Summary */}
      <div className="col-lg-5">
        <div style={{ position: "sticky", top: "80px" }}>
          <div className="cozy-card">
            <div
              style={{
                background:
                  "linear-gradient(135deg, var(--primary), var(--primary-light))",
                padding: "1.25rem 1.5rem",
                color: "white",
              }}
            >
              <h6 style={{ color: "white", margin: 0, fontWeight: 600 }}>
                📋 Booking Summary
              </h6>
            </div>
            <div style={{ padding: "1.25rem" }}>
              <h6
                style={{
                  fontFamily: "Playfair Display, serif",
                  marginBottom: "0.25rem",
                }}
              >
                {hotel.name}
              </h6>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.85rem",
                  marginBottom: "1rem",
                }}
              >
                📍 {hotel.location}
              </p>

              {[
                { label: "Room Type", value: `${room.bedType} Bed` },
                { label: "Room Size", value: room.roomSize },
                {
                  label: "Air Conditioning",
                  value: room.isAC ? "Yes ❄️" : "No",
                },
                { label: "Max Guests", value: `${room.maxOccupancy} persons` },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                    fontSize: "0.875rem",
                  }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>
                    {label}
                  </span>
                  <span style={{ fontWeight: 600 }}>{value}</span>
                </div>
              ))}

              <hr
                style={{ borderColor: "var(--border)", margin: "0.75rem 0" }}
              />

              {[
                {
                  label: "Check-in",
                  value: new Date(checkIn).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }),
                },
                {
                  label: "Check-out",
                  value: new Date(checkOut).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }),
                },
                {
                  label: "Duration",
                  value:
                    nights > 0
                      ? `${nights} night${nights > 1 ? "s" : ""}`
                      : "⚠️ Invalid dates",
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                    fontSize: "0.875rem",
                  }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>
                    {label}
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      color:
                        label === "Duration" && nights <= 0
                          ? "var(--danger)"
                          : "inherit",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}

              <hr
                style={{ borderColor: "var(--border)", margin: "0.75rem 0" }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <span
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.875rem",
                  }}
                >
                  Base fare / night
                </span>
                <span style={{ fontWeight: 600 }}>
                  ₹{room.baseFare.toLocaleString()}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <span
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.875rem",
                  }}
                >
                  Booked by
                </span>
                <span style={{ fontWeight: 600 }}>{user?.fullName}</span>
              </div>

              {/* Cancellation policy */}
              <div
                style={{
                  background: "var(--surface-warm)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.75rem 1rem",
                  fontSize: "0.8rem",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: "0.4rem" }}>
                  🛡️ Cancellation Policy
                </div>
                {[
                  "✅ Full refund — cancel 48+ hours before",
                  "⚠️ 50% refund — cancel 24-48 hours before",
                  "❌ No refund — cancel within 24 hours",
                ].map((text) => (
                  <div
                    key={text}
                    style={{
                      color: "var(--text-secondary)",
                      marginBottom: "0.2rem",
                    }}
                  >
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
