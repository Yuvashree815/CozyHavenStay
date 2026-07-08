import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyHotelsApi } from "../../api/hotelApi";
import { getPendingRefundsApi } from "../../api/bookingApi";
import { useAuth } from "../../context/AuthContext";

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

  if (loading)
    return (
      <div className="text-center py-5">
        <div
          className="spinner-border"
          style={{ color: "var(--primary)" }}
          role="status"
        />
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          Loading dashboard...
        </p>
      </div>
    );

  const getAmenityCount = (hotel) => {
    return [
      hotel.hasFreeWifi,
      hotel.hasDining,
      hotel.hasParking,
      hotel.hasSwimmingPool,
      hotel.hasFitnessCenter,
      hotel.hasRoomService,
    ].filter(Boolean).length;
  };

  return (
    <div>
      {/* Welcome header */}
      <div
        style={{
          background:
            "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 60%, #1a5276 100%)",
          borderRadius: "var(--radius-lg)",
          padding: "2rem 2.5rem",
          marginBottom: "1.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
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
        <div
          style={{
            position: "absolute",
            bottom: "-50%",
            left: "30%",
            width: 200,
            height: 200,
            background:
              "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
              <p
                style={{
                  color: "var(--accent)",
                  fontWeight: 600,
                  fontSize: "0.78rem",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  marginBottom: "0.5rem",
                }}
              >
                🏨 Hotel Owner Portal
              </p>
              <h3
                style={{
                  color: "white",
                  marginBottom: "0.25rem",
                  fontSize: "1.75rem",
                }}
              >
                Welcome back, {user?.fullName?.split(" ")[0]} 👋
              </h3>
              <p
                style={{
                  color: "rgba(255,255,255,0.7)",
                  marginBottom: "1.25rem",
                  fontSize: "0.9rem",
                }}
              >
                Manage your hotels, bookings, and refunds from here.
              </p>
              {/* Mini stats in header */}
              <div className="d-flex gap-3 flex-wrap">
                {[
                  { value: hotels.length, label: "Hotels" },
                  {
                    value: hotels.filter((h) => h.isActive).length,
                    label: "Active",
                  },
                  { value: pendingRefunds.length, label: "Pending Refunds" },
                ].map(({ value, label }) => (
                  <div
                    key={label}
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      borderRadius: "var(--radius-sm)",
                      padding: "0.5rem 1rem",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "Playfair Display, serif",
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: "white",
                        lineHeight: 1,
                      }}
                    >
                      {value}
                    </div>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: "rgba(255,255,255,0.7)",
                        marginTop: "0.15rem",
                      }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              className="btn-gold"
              onClick={() => navigate("/owner/hotels/new")}
              style={{
                borderRadius: "var(--radius-sm)",
                whiteSpace: "nowrap",
                alignSelf: "flex-start",
              }}
            >
              ➕ Add Hotel
            </button>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <h5 className="section-title mb-3">Quick Actions</h5>
      <div className="row mb-4">
        {[
          {
            icon: "➕",
            label: "Add New Hotel",
            desc: "List a new property",
            path: "/owner/hotels/new",
            gold: true,
          },
          {
            icon: "🏨",
            label: "My Hotels",
            desc: "View all properties",
            path: "/owner/hotels",
            gold: false,
          },
          {
            icon: "📋",
            label: "View Bookings",
            desc: "Manage reservations",
            path: "/owner/hotels",
            gold: false,
          },
          {
            icon: "💰",
            label: "Pending Refunds",
            desc: `${pendingRefunds.length} awaiting approval`,
            path: "/owner/refunds",
            gold: pendingRefunds.length > 0,
            badge: pendingRefunds.length > 0 ? pendingRefunds.length : null,
            alert: pendingRefunds.length > 0,
          },
        ].map(({ icon, label, desc, path, gold, badge, alert }) => (
          <div className="col-md-3 col-6 mb-2" key={label}>
            <button
              onClick={() => navigate(path)}
              style={{
                width: "100%",
                padding: "1.25rem 0.75rem",
                background: gold ? "var(--accent)" : "var(--surface)",
                border: `1.5px solid ${alert ? "var(--warning)" : gold ? "var(--accent)" : "var(--border)"}`,
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                position: "relative",
                boxShadow: "var(--shadow-sm)",
                textAlign: "center",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "var(--shadow-sm)";
              }}
            >
              {badge && (
                <span
                  style={{
                    position: "absolute",
                    top: "0.5rem",
                    right: "0.5rem",
                    background: "var(--danger)",
                    color: "white",
                    borderRadius: "50%",
                    width: 20,
                    height: 20,
                    fontSize: "0.7rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                  }}
                >
                  {badge}
                </span>
              )}
              <div style={{ fontSize: "1.75rem", marginBottom: "0.4rem" }}>
                {icon}
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: gold ? "var(--primary)" : "var(--text-primary)",
                  marginBottom: "0.2rem",
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: gold ? "rgba(26,60,94,0.7)" : "var(--text-secondary)",
                }}
              >
                {desc}
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* My hotels summary */}
      {hotels.length > 0 && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="section-title mb-0">My Hotels</h5>
          </div>
          <div className="row">
            {hotels.slice(0, 3).map((hotel) => (
              <div className="col-md-4 mb-3" key={hotel.id}>
                <div
                  className="cozy-card h-100"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Hotel image */}
                  <div
                    style={{
                      height: 140,
                      background: hotel.imageUrl
                        ? "none"
                        : "linear-gradient(135deg, var(--primary), var(--primary-light))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2.5rem",
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
                      "🏨"
                    )}

                    {/* Dark overlay */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.65), transparent)",
                      }}
                    />

                    {/* Status badge */}
                    <span
                      style={{
                        position: "absolute",
                        top: "0.5rem",
                        right: "0.5rem",
                        background: hotel.isActive
                          ? "rgba(45,122,79,0.9)"
                          : "rgba(192,57,43,0.9)",
                        color: "white",
                        fontSize: "0.7rem",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "20px",
                        fontWeight: 600,
                        zIndex: 1,
                      }}
                    >
                      {hotel.isActive ? "✓ Active" : "✗ Inactive"}
                    </span>

                    {/* Hotel name on image */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "0.6rem",
                        left: "0.75rem",
                        color: "white",
                        zIndex: 1,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "Playfair Display, serif",
                          fontWeight: 600,
                          fontSize: "0.95rem",
                          textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                        }}
                      >
                        {hotel.name}
                      </div>
                      <div style={{ fontSize: "0.72rem", opacity: 0.85 }}>
                        📍 {hotel.location}
                      </div>
                    </div>
                  </div>

                  {/* Hotel info */}
                  <div style={{ padding: "0.85rem 1rem", flex: 1 }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {getAmenityCount(hotel)} amenities
                      </span>
                    </div>
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-outline-primary btn-sm flex-grow-1"
                        onClick={() =>
                          navigate(`/owner/hotels/${hotel.id}/bookings`)
                        }
                      >
                        📋 Bookings
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm flex-grow-1"
                        onClick={() =>
                          navigate(`/owner/hotels/${hotel.id}/rooms`)
                        }
                      >
                        🛏️ Rooms
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                          navigate(`/owner/hotels/${hotel.id}/edit`)
                        }
                      >
                        ✏️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hotels.length > 3 && (
            <div className="text-center mt-2 mb-4">
              <button
                className="btn btn-outline-primary"
                onClick={() => navigate("/owner/hotels")}
              >
                View All {hotels.length} Hotels →
              </button>
            </div>
          )}
        </>
      )}

      {/* Pending refunds alert */}
      {pendingRefunds.length > 0 && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem 1.25rem",
            background: "#fff3cd",
            border: "1px solid #ffeeba",
            borderRadius: "var(--radius-md)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div>
            <strong style={{ color: "#856404" }}>⚠️ Action Required</strong>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#856404" }}>
              You have <strong>{pendingRefunds.length}</strong> pending
              refund(s) awaiting your approval.
            </p>
          </div>
          <button
            className="btn-gold"
            onClick={() => navigate("/owner/refunds")}
            style={{
              borderRadius: "var(--radius-sm)",
              whiteSpace: "nowrap",
              fontSize: "0.875rem",
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
