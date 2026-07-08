import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyHotelsApi, deleteRoomApi } from "../../api/hotelApi";

const MyHotelsPage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const response = await getMyHotelsApi();
      setHotels(response.data || []);
    } catch {
      setError("Failed to load hotels.");
    } finally {
      setLoading(false);
    }
  };

  const getAmenities = (hotel) => {
    const list = [];
    if (hotel.hasFreeWifi) list.push("📶 WiFi");
    if (hotel.hasDining) list.push("🍽️ Dining");
    if (hotel.hasParking) list.push("🚗 Parking");
    if (hotel.hasSwimmingPool) list.push("🏊 Pool");
    if (hotel.hasFitnessCenter) list.push("💪 Gym");
    if (hotel.hasRoomService) list.push("🛎️ Room Service");
    return list;
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: "var(--primary)" }} />
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          Loading your hotels...
        </p>
      </div>
    );

  return (
    <div>
      <div className="page-header">
        <div>
          <h4 className="page-title">My Hotels</h4>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.875rem",
              margin: 0,
            }}
          >
            Manage your properties and rooms
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/owner/hotels/new")}
        >
          ➕ Add New Hotel
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "#f8d7da",
            border: "1px solid #f5c6cb",
            borderRadius: "var(--radius-sm)",
            padding: "0.75rem 1rem",
            marginBottom: "1rem",
            color: "var(--danger)",
            fontSize: "0.875rem",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {hotels.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            background: "var(--surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🏨</div>
          <h5
            style={{
              fontFamily: "Playfair Display, serif",
              marginBottom: "0.5rem",
            }}
          >
            No hotels yet
          </h5>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            Add your first hotel to start receiving bookings.
          </p>
          <button
            className="btn btn-primary px-4"
            onClick={() => navigate("/owner/hotels/new")}
          >
            Add Hotel
          </button>
        </div>
      ) : (
        <div className="row">
          {hotels.map((hotel) => (
            <div className="col-md-6 col-lg-4 mb-4" key={hotel.id}>
              <div
                className="cozy-card h-100"
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Hotel image banner */}
                <div
                  style={{
                    height: 180,
                    background: hotel.imageUrl
                      ? "none"
                      : "linear-gradient(135deg, var(--primary), var(--primary-light))",
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: "var(--radius-md) var(--radius-md) 0 0",
                    flexShrink: 0,
                  }}
                >
                  {hotel.imageUrl ? (
                    <img
                      src={hotel.imageUrl}
                      alt={hotel.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.style.background =
                          "linear-gradient(135deg, var(--primary), var(--primary-light))";
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "3rem",
                      }}
                    >
                      🏨
                    </div>
                  )}

                  {/* Status badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: "0.75rem",
                      right: "0.75rem",
                      zIndex: 2,
                    }}
                  >
                    <span
                      className={
                        hotel.isActive ? "status-active" : "status-inactive"
                      }
                    >
                      {hotel.isActive ? "● Active" : "● Inactive"}
                    </span>
                  </div>

                  {/* Dark overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.65), transparent)",
                      zIndex: 1,
                    }}
                  />

                  {/* Hotel name + location */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "0.75rem",
                      left: "1rem",
                      color: "white",
                      zIndex: 2,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "Playfair Display, serif",
                        fontWeight: 600,
                        fontSize: "1rem",
                        textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                      }}
                    >
                      {hotel.name}
                    </div>
                    <div style={{ fontSize: "0.78rem", opacity: 0.9 }}>
                      📍 {hotel.location}
                    </div>
                  </div>
                </div>

                {/* Hotel info */}
                <div style={{ padding: "1rem 1.25rem", flex: 1 }}>
                  {hotel.description && (
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.82rem",
                        marginBottom: "0.75rem",
                        lineHeight: 1.5,
                      }}
                    >
                      {hotel.description.length > 90
                        ? hotel.description.substring(0, 90) + "..."
                        : hotel.description}
                    </p>
                  )}
                  <div className="d-flex flex-wrap gap-1">
                    {getAmenities(hotel)
                      .slice(0, 4)
                      .map((a) => (
                        <span key={a} className="amenity-badge">
                          {a}
                        </span>
                      ))}
                    {getAmenities(hotel).length > 4 && (
                      <span className="amenity-badge">
                        +{getAmenities(hotel).length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div
                  style={{
                    padding: "0.75rem 1.25rem",
                    borderTop: "1px solid var(--border)",
                    background: "var(--surface-warm)",
                    display: "flex",
                    gap: "0.4rem",
                    flexWrap: "wrap",
                    flexShrink: 0,
                  }}
                >
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() =>
                      navigate(`/owner/hotels/${hotel.id}/bookings`)
                    }
                  >
                    📋 Bookings
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => navigate(`/owner/hotels/${hotel.id}/edit`)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() =>
                      navigate(`/owner/hotels/${hotel.id}/rooms/new`)
                    }
                  >
                    🛏️ Add Room
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm w-100 mt-1"
                    onClick={() => navigate(`/owner/hotels/${hotel.id}/rooms`)}
                  >
                    🛏️ View Rooms
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

export default MyHotelsPage;
