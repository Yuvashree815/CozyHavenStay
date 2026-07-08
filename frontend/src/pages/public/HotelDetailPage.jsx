import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getHotelByIdApi, getAvailableRoomsApi } from "../../api/hotelApi";
import {
  getHotelRatingSummaryApi,
  getHotelReviewsApi,
} from "../../api/reviewApi";
import { useAuth } from "../../context/AuthContext";

const HotelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
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
    } catch {
      setError("Failed to load hotel details.");
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
    } catch {
      setError("Failed to check availability. Please try again.");
    } finally {
      setCheckingAvailability(false);
    }
  };

  const getAmenities = (hotel) => {
    const list = [];
    if (hotel.hasFreeWifi) list.push({ icon: "📶", label: "Free WiFi" });
    if (hotel.hasDining) list.push({ icon: "🍽️", label: "Dining" });
    if (hotel.hasParking) list.push({ icon: "🚗", label: "Free Parking" });
    if (hotel.hasSwimmingPool)
      list.push({ icon: "🏊", label: "Swimming Pool" });
    if (hotel.hasFitnessCenter)
      list.push({ icon: "💪", label: "Fitness Center" });
    if (hotel.hasRoomService) list.push({ icon: "🛎️", label: "Room Service" });
    return list;
  };

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} style={{ color: i < full ? "var(--accent)" : "#ddd" }}>
          ★
        </span>,
      );
    }
    return stars;
  };

  const nights =
    checkIn && checkOut
      ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000)
      : 0;

  if (loading)
    return (
      <div>
        <div
          className="skeleton"
          style={{
            height: 280,
            borderRadius: "var(--radius-lg)",
            marginBottom: "1.5rem",
          }}
        />
        <div className="row">
          <div className="col-md-8">
            <div
              className="skeleton"
              style={{ height: 24, width: "60%", marginBottom: 12 }}
            />
            <div
              className="skeleton"
              style={{ height: 16, width: "40%", marginBottom: 20 }}
            />
            <div
              className="skeleton"
              style={{ height: 120, marginBottom: 16 }}
            />
          </div>
        </div>
      </div>
    );

  if (error)
    return <div className="alert alert-danger rounded-3 mt-3">{error}</div>;

  if (!hotel) return null;

  const availableCount = rooms.filter((r) => r.isAvailable).length;

  return (
    <div>
      {/* Back button */}
      <button
        className="btn btn-outline-primary btn-sm mb-3"
        onClick={() => navigate(-1)}
      >
        ← Back to Results
      </button>

      {/* Hero banner — shows real image if available */}
      <div
        style={{
          borderRadius: "var(--radius-lg)",
          marginBottom: "1.5rem",
          position: "relative",
          overflow: "hidden",
          minHeight: 280,
          background:
            "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)",
        }}
      >
        {/* Real hotel image */}
        {hotel.imageUrl && (
          <img
            src={hotel.imageUrl}
            alt={hotel.name}
            style={{
              width: "100%",
              height: 280,
              objectFit: "cover",
              display: "block",
              position: "absolute",
              top: 0,
              left: 0,
            }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}

        {/* Dark overlay for text readability */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: hotel.imageUrl
              ? "linear-gradient(to bottom, rgba(26,60,94,0.2), rgba(26,60,94,0.85))"
              : "transparent",
            borderRadius: "var(--radius-lg)",
          }}
        />

        {/* Decorative circle — only when no image */}
        {!hotel.imageUrl && (
          <div
            style={{
              position: "absolute",
              top: "-40%",
              right: "-5%",
              width: 300,
              height: 300,
              background:
                "radial-gradient(circle, rgba(201,168,76,0.2) 0%, transparent 70%)",
              borderRadius: "50%",
            }}
          />
        )}

        {/* Content overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "2rem 2.5rem",
            zIndex: 1,
          }}
        >
          <div className="d-flex justify-content-between align-items-end flex-wrap gap-3">
            <div>
              <h2
                style={{
                  color: "white",
                  fontFamily: "Playfair Display, serif",
                  fontSize: "2rem",
                  marginBottom: "0.5rem",
                }}
              >
                {hotel.name}
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.85)",
                  marginBottom: "0.75rem",
                }}
              >
                📍 {hotel.location}
              </p>
              {ratingSummary && ratingSummary.totalReviews > 0 && (
                <div className="d-flex align-items-center gap-2">
                  <div style={{ fontSize: "1.2rem" }}>
                    {renderStars(ratingSummary.averageRating)}
                  </div>
                  <span
                    style={{
                      background: "var(--accent)",
                      color: "var(--primary)",
                      fontWeight: 700,
                      padding: "0.2rem 0.6rem",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                    }}
                  >
                    {ratingSummary.averageRating}
                  </span>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: "0.85rem",
                    }}
                  >
                    ({ratingSummary.totalReviews} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Premium badge — only when no image */}
            {!hotel.imageUrl && (
              <div
                style={{
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "var(--radius-md)",
                  padding: "1rem 1.5rem",
                  textAlign: "center",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div style={{ fontSize: "2rem" }}>🏨</div>
                <div
                  style={{
                    color: "var(--accent)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                  }}
                >
                  Premium Hotel
                </div>
              </div>
            )}
          </div>

          {hotel.description && (
            <p
              style={{
                color: "rgba(255,255,255,0.8)",
                marginTop: "1rem",
                marginBottom: 0,
                maxWidth: "600px",
                fontSize: "0.95rem",
              }}
            >
              {hotel.description}
            </p>
          )}
        </div>
      </div>

      <div className="row">
        {/* Left column */}
        <div className="col-lg-8">
          {/* Amenities */}
          <div className="cozy-card mb-4">
            <div style={{ padding: "1.25rem 1.5rem" }}>
              <h5 className="section-title">Hotel Amenities</h5>
              <div className="row mt-3">
                {getAmenities(hotel).map(({ icon, label }) => (
                  <div className="col-6 col-md-4 mb-3" key={label}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.6rem 0.75rem",
                        background: "var(--surface-warm)",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <span style={{ fontSize: "1.2rem" }}>{icon}</span>
                      <span
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          color: "var(--text-primary)",
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  </div>
                ))}
                {getAmenities(hotel).length === 0 && (
                  <p className="text-secondary">No amenities listed.</p>
                )}
              </div>
            </div>
          </div>

          {/* Available rooms */}
          {availabilityChecked && (
            <div className="mb-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <h5 className="section-title mb-0">
                  {availableCount === 0
                    ? "No Rooms Available"
                    : `${availableCount} Room${availableCount > 1 ? "s" : ""} Available`}
                </h5>
                {availableCount > 0 && (
                  <span
                    style={{
                      background: "#d4edda",
                      color: "var(--success)",
                      fontSize: "0.8rem",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "20px",
                      fontWeight: 600,
                    }}
                  >
                    ✓ For {nights} night{nights > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <div className="row">
                {rooms.map((room) => (
                  <div className="col-md-6 mb-3" key={room.id}>
                    <div
                      className={`room-card ${room.isAvailable ? "available" : "unavailable"}`}
                    >
                      {/* Room image if available */}
                      {room.imageUrl && (
                        <div style={{ height: 140, overflow: "hidden" }}>
                          <img
                            src={room.imageUrl}
                            alt={`${room.bedType} room`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.target.parentElement.style.display = "none";
                            }}
                          />
                        </div>
                      )}

                      <div className="room-card-header">
                        <div>
                          <span
                            style={{ fontWeight: 600, fontSize: "0.95rem" }}
                          >
                            🛏️ {room.bedType} Bed Room
                          </span>
                          <br />
                          <span
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {room.roomSize} · Max {room.maxOccupancy} guests
                          </span>
                        </div>
                        <span
                          style={{
                            background: room.isAvailable
                              ? "#d4edda"
                              : "#f8d7da",
                            color: room.isAvailable
                              ? "var(--success)"
                              : "var(--danger)",
                            fontSize: "0.75rem",
                            padding: "0.25rem 0.6rem",
                            borderRadius: "20px",
                            fontWeight: 600,
                            border: `1px solid ${room.isAvailable ? "#c3e6cb" : "#f5c6cb"}`,
                          }}
                        >
                          {room.isAvailable ? "✓ Available" : "✗ Booked"}
                        </span>
                      </div>

                      <div style={{ padding: "1rem 1.25rem" }}>
                        <div className="d-flex gap-2 mb-3">
                          <span className="amenity-badge">
                            ❄️ {room.isAC ? "AC" : "Non-AC"}
                          </span>
                          <span className="amenity-badge">
                            👥 {room.maxOccupancy} guests max
                          </span>
                        </div>

                        <div className="d-flex justify-content-between align-items-end">
                          <div>
                            <div className="room-price">
                              ₹{room.baseFare.toLocaleString()}
                            </div>
                            <div className="room-price-label">
                              per night + taxes
                            </div>
                          </div>
                          {room.isAvailable && (
                            <button
                              className="btn btn-primary"
                              onClick={() => {
                                if (!isAuthenticated) {
                                  navigate("/login");
                                  return;
                                }
                                navigate(`/book/${room.id}`, {
                                  state: { room, hotel, checkIn, checkOut },
                                });
                              }}
                            >
                              Book Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="cozy-card mb-4">
            <div style={{ padding: "1.25rem 1.5rem" }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="section-title mb-0">Guest Reviews</h5>
                {ratingSummary && ratingSummary.totalReviews > 0 && (
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "2rem",
                        fontWeight: 700,
                        color: "var(--primary)",
                        fontFamily: "Playfair Display, serif",
                        lineHeight: 1,
                      }}
                    >
                      {ratingSummary.averageRating}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      out of 5 · {ratingSummary.totalReviews} reviews
                    </div>
                  </div>
                )}
              </div>

              {reviews.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
                    💬
                  </div>
                  <p style={{ margin: 0 }}>
                    No reviews yet. Be the first to review!
                  </p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: "var(--primary)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.85rem",
                            fontWeight: 700,
                          }}
                        >
                          G
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                            Verified Guest
                          </div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-light)",
                            }}
                          >
                            {new Date(review.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </div>
                        </div>
                      </div>
                      <div
                        className="review-stars"
                        style={{ fontSize: "1rem" }}
                      >
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </div>
                    </div>
                    {review.comment && (
                      <p
                        style={{
                          margin: "0.5rem 0 0 44px",
                          fontSize: "0.9rem",
                          color: "var(--text-secondary)",
                          lineHeight: 1.6,
                        }}
                      >
                        "{review.comment}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column — sticky availability checker */}
        <div className="col-lg-4">
          <div style={{ position: "sticky", top: "80px" }}>
            <div className="cozy-card">
              <div className="cozy-card-header">
                <h6 style={{ margin: 0, fontWeight: 600 }}>
                  🗓️ Check Availability
                </h6>
              </div>
              <div style={{ padding: "1.25rem" }}>
                <div className="mb-3">
                  <label className="form-label">Check-in</label>
                  <input
                    type="date"
                    className="form-control"
                    value={checkIn}
                    min={today}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Check-out</label>
                  <input
                    type="date"
                    className="form-control"
                    value={checkOut}
                    min={checkIn}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>

                {nights > 0 && (
                  <div
                    style={{
                      background: "var(--surface-warm)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                      padding: "0.6rem 0.75rem",
                      marginBottom: "1rem",
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Duration</span>
                    <span
                      style={{ fontWeight: 600, color: "var(--text-primary)" }}
                    >
                      {nights} night{nights > 1 ? "s" : ""}
                    </span>
                  </div>
                )}

                <button
                  className="btn btn-primary w-100"
                  onClick={handleCheckAvailability}
                  disabled={checkingAvailability}
                >
                  {checkingAvailability
                    ? "Checking..."
                    : "🔍 Check Availability"}
                </button>

                {availabilityChecked && (
                  <div
                    style={{
                      marginTop: "1rem",
                      padding: "0.75rem",
                      background: availableCount > 0 ? "#d4edda" : "#f8d7da",
                      borderRadius: "var(--radius-sm)",
                      textAlign: "center",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color:
                        availableCount > 0 ? "var(--success)" : "var(--danger)",
                    }}
                  >
                    {availableCount > 0
                      ? `✓ ${availableCount} room${availableCount > 1 ? "s" : ""} available!`
                      : "✗ No rooms available for these dates"}
                  </div>
                )}
              </div>
            </div>

            {/* Cancellation policy */}
            <div className="cozy-card mt-3">
              <div style={{ padding: "1.25rem" }}>
                <h6 style={{ fontWeight: 600, marginBottom: "0.75rem" }}>
                  🛡️ Cancellation Policy
                </h6>
                {[
                  {
                    icon: "✅",
                    text: "Full refund if cancelled 48+ hours before check-in",
                  },
                  {
                    icon: "⚠️",
                    text: "50% refund if cancelled 24-48 hours before",
                  },
                  { icon: "❌", text: "No refund within 24 hours of check-in" },
                ].map(({ icon, text }) => (
                  <div
                    key={text}
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      marginBottom: "0.5rem",
                      fontSize: "0.82rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <span>{icon}</span>
                    <span>{text}</span>
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

export default HotelDetailPage;
