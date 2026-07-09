import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getRoomsByHotelApi,
  deleteRoomApi,
  getHotelByIdApi,
  getRoomBlocksApi,
  blockRoomForMaintenanceApi,
  unblockMaintenanceApi,
} from "../../api/hotelApi";

const HotelRoomsPage = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingRoomId, setDeletingRoomId] = useState(null);

  // Block modal state
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [blockCheckIn, setBlockCheckIn] = useState("");
  const [blockCheckOut, setBlockCheckOut] = useState("");
  const [blockError, setBlockError] = useState("");
  const [blocking, setBlocking] = useState(false);

  // Blocks per room
  const [roomBlocks, setRoomBlocks] = useState({});
  const [loadingBlocksFor, setLoadingBlocksFor] = useState(null);
  const [expandedBlocksRoom, setExpandedBlocksRoom] = useState(null);
  const [unblockingId, setUnblockingId] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchData();
  }, [hotelId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hotelRes, roomsRes] = await Promise.all([
        getHotelByIdApi(hotelId),
        getRoomsByHotelApi(hotelId),
      ]);
      setHotel(hotelRes.data);
      setRooms(roomsRes.data || []);
    } catch {
      setError("Failed to load rooms.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Delete this room?")) return;
    setDeletingRoomId(roomId);
    try {
      await deleteRoomApi(roomId);
      setRooms(rooms.filter((r) => r.id !== roomId));
    } catch {
      setError("Failed to delete room.");
    } finally {
      setDeletingRoomId(null);
    }
  };

  // Open block modal
  const handleOpenBlockModal = (room) => {
    setSelectedRoom(room);
    setBlockCheckIn("");
    setBlockCheckOut("");
    setBlockError("");
    setShowBlockModal(true);
  };

  // Submit block
  const handleBlockSubmit = async () => {
    setBlockError("");
    if (!blockCheckIn || !blockCheckOut) {
      setBlockError("Please select both check-in and check-out dates.");
      return;
    }
    if (new Date(blockCheckOut) <= new Date(blockCheckIn)) {
      setBlockError("Check-out must be after check-in.");
      return;
    }
    setBlocking(true);
    try {
      await blockRoomForMaintenanceApi(selectedRoom.id, {
        checkIn: blockCheckIn,
        checkOut: blockCheckOut,
      });
      setShowBlockModal(false);
      setSelectedRoom(null);
      // Refresh blocks if expanded
      if (expandedBlocksRoom === selectedRoom.id) {
        await fetchBlocksForRoom(selectedRoom.id);
      }
    } catch (err) {
      setBlockError(err.response?.data?.message || "Failed to block room.");
    } finally {
      setBlocking(false);
    }
  };

  // Fetch blocks for a room
  const fetchBlocksForRoom = async (roomId) => {
    setLoadingBlocksFor(roomId);
    try {
      const res = await getRoomBlocksApi(roomId);
      setRoomBlocks((prev) => ({ ...prev, [roomId]: res.data || [] }));
    } catch {
      setRoomBlocks((prev) => ({ ...prev, [roomId]: [] }));
    } finally {
      setLoadingBlocksFor(null);
    }
  };

  // Toggle blocks panel
  const handleToggleBlocks = async (roomId) => {
    if (expandedBlocksRoom === roomId) {
      setExpandedBlocksRoom(null);
      return;
    }
    setExpandedBlocksRoom(roomId);
    await fetchBlocksForRoom(roomId);
  };

  // Unblock
  const handleUnblock = async (roomId, blockId) => {
    if (!window.confirm("Remove this maintenance block?")) return;
    setUnblockingId(blockId);
    try {
      await unblockMaintenanceApi(roomId, blockId);
      setRoomBlocks((prev) => ({
        ...prev,
        [roomId]: prev[roomId].filter((b) => b.id !== blockId),
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to unblock room.");
    } finally {
      setUnblockingId(null);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: "var(--primary)" }} />
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
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
            onClick={() => navigate("/owner/hotels")}
          >
            ← Back to My Hotels
          </button>
          <h4 className="page-title mb-0">{hotel?.name} — Rooms</h4>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.875rem",
              margin: 0,
            }}
          >
            📍 {hotel?.location} · {rooms.length} room
            {rooms.length !== 1 ? "s" : ""}
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

      {/* Hotel banner */}
      {hotel?.imageUrl && (
        <div
          style={{
            height: 200,
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            marginBottom: "1.5rem",
            position: "relative",
          }}
        >
          <img
            src={hotel.imageUrl}
            alt={hotel.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "1rem",
              left: "1.5rem",
              color: "white",
              zIndex: 1,
            }}
          >
            <h4
              style={{
                fontFamily: "Playfair Display, serif",
                margin: 0,
                color: "white",
              }}
            >
              {hotel.name}
            </h4>
            <p style={{ margin: 0, opacity: 0.85 }}>📍 {hotel.location}</p>
          </div>
        </div>
      )}

      {rooms.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            background: "var(--surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛏️</div>
          <h5
            style={{
              fontFamily: "Playfair Display, serif",
              marginBottom: "0.5rem",
            }}
          >
            No rooms yet
          </h5>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
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
              <div
                className="cozy-card h-100"
                style={{ display: "flex", flexDirection: "column" }}
              >
                {/* Room image */}
                <div
                  style={{
                    height: 180,
                    background: room.imageUrl
                      ? "none"
                      : "linear-gradient(135deg, var(--primary), var(--primary-light))",
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: "var(--radius-md) var(--radius-md) 0 0",
                    flexShrink: 0,
                  }}
                >
                  {room.imageUrl ? (
                    <img
                      src={room.imageUrl}
                      alt={`${room.bedType} room`}
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
                      🛏️
                    </div>
                  )}

                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
                    }}
                  />

                  <div
                    style={{
                      position: "absolute",
                      bottom: "0.75rem",
                      left: "1rem",
                      color: "white",
                      zIndex: 1,
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
                      🛏️ {room.bedType} Bed Room
                    </div>
                    <div style={{ fontSize: "0.78rem", opacity: 0.9 }}>
                      {room.roomSize} · Max {room.maxOccupancy} guests
                    </div>
                  </div>

                  <div
                    style={{
                      position: "absolute",
                      top: "0.75rem",
                      right: "0.75rem",
                      zIndex: 2,
                    }}
                  >
                    <span
                      style={{
                        background: "rgba(0,0,0,0.5)",
                        color: "white",
                        fontSize: "0.72rem",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "20px",
                        fontWeight: 600,
                      }}
                    >
                      {room.isAC ? "❄️ AC" : "Non-AC"}
                    </span>
                  </div>
                </div>

                {/* Room details */}
                <div style={{ padding: "1rem 1.25rem", flex: 1 }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <span className="amenity-badge">
                        👥 Max {room.maxOccupancy}
                      </span>{" "}
                      <span className="amenity-badge">{room.roomSize}</span>
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "Playfair Display, serif",
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "var(--primary)",
                    }}
                  >
                    ₹{room.baseFare?.toLocaleString()}
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.78rem",
                        fontWeight: 400,
                        color: "var(--text-light)",
                      }}
                    >
                      {" "}
                      /night
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div
                  style={{
                    padding: "0.75rem 1.25rem",
                    borderTop: "1px solid var(--border)",
                    background: "var(--surface-warm)",
                    display: "flex",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                    flexShrink: 0,
                  }}
                >
                  <button
                    className="btn btn-outline-primary btn-sm flex-grow-1"
                    onClick={() =>
                      navigate(`/owner/hotels/${hotelId}/rooms/${room.id}/edit`)
                    }
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-outline-warning btn-sm flex-grow-1"
                    onClick={() => handleOpenBlockModal(room)}
                  >
                    🔒 Block Dates
                  </button>
                  <button
                    className="btn-deactivate"
                    onClick={() => handleDeleteRoom(room.id)}
                    disabled={deletingRoomId === room.id}
                  >
                    {deletingRoomId === room.id ? "..." : "🗑️"}
                  </button>
                  {/* View blocks toggle */}
                  <button
                    className="btn btn-outline-secondary btn-sm w-100 mt-1"
                    onClick={() => handleToggleBlocks(room.id)}
                  >
                    {loadingBlocksFor === room.id
                      ? "Loading..."
                      : expandedBlocksRoom === room.id
                        ? "▲ Hide Blocks"
                        : "▼ View Blocks"}
                  </button>
                </div>

                {/* Blocks panel */}
                {expandedBlocksRoom === room.id && (
                  <div
                    style={{
                      padding: "1rem 1.25rem",
                      borderTop: "1px solid var(--border)",
                      background: "var(--bg)",
                    }}
                  >
                    {!roomBlocks[room.id] ||
                    roomBlocks[room.id].length === 0 ? (
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.82rem",
                          margin: 0,
                          textAlign: "center",
                        }}
                      >
                        No active blocks for this room.
                      </p>
                    ) : (
                      roomBlocks[room.id].map((block) => (
                        <div
                          key={block.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0.5rem 0.75rem",
                            marginBottom: "0.5rem",
                            background:
                              block.source === "Maintenance"
                                ? "#fff3cd"
                                : "#d4edda",
                            border: `1px solid ${
                              block.source === "Maintenance"
                                ? "#ffeeba"
                                : "#c3e6cb"
                            }`,
                            borderRadius: "var(--radius-sm)",
                            fontSize: "0.8rem",
                          }}
                        >
                          <div>
                            <span
                              style={{
                                fontWeight: 600,
                                color:
                                  block.source === "Maintenance"
                                    ? "#856404"
                                    : "var(--success)",
                              }}
                            >
                              {block.source === "Maintenance"
                                ? "🔧 Maintenance"
                                : "📋 Booking"}
                            </span>
                            <div
                              style={{
                                color: "var(--text-secondary)",
                                marginTop: "0.15rem",
                              }}
                            >
                              {formatDate(block.checkIn)} →{" "}
                              {formatDate(block.checkOut)}
                            </div>
                          </div>
                          {block.source === "Maintenance" && (
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleUnblock(room.id, block.id)}
                              disabled={unblockingId === block.id}
                              style={{ fontSize: "0.75rem" }}
                            >
                              {unblockingId === block.id ? "..." : "🔓 Unblock"}
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Block Modal */}
      {showBlockModal && selectedRoom && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1050,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              borderRadius: "var(--radius-lg)",
              padding: "2rem",
              width: "100%",
              maxWidth: 420,
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <h5
              style={{
                fontFamily: "Playfair Display, serif",
                marginBottom: "0.25rem",
              }}
            >
              🔒 Block Room for Maintenance
            </h5>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
                marginBottom: "1.25rem",
              }}
            >
              {selectedRoom.bedType} Bed Room · {selectedRoom.roomSize}
            </p>

            {blockError && (
              <div
                style={{
                  background: "#f8d7da",
                  border: "1px solid #f5c6cb",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.6rem 0.75rem",
                  marginBottom: "1rem",
                  color: "var(--danger)",
                  fontSize: "0.85rem",
                }}
              >
                ⚠️ {blockError}
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">Block From</label>
              <input
                type="date"
                className="form-control"
                value={blockCheckIn}
                min={today}
                onChange={(e) => {
                  setBlockCheckIn(e.target.value);
                  setBlockError("");
                }}
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Block Until</label>
              <input
                type="date"
                className="form-control"
                value={blockCheckOut}
                min={blockCheckIn || today}
                onChange={(e) => {
                  setBlockCheckOut(e.target.value);
                  setBlockError("");
                }}
              />
            </div>

            <div
              style={{
                background: "#fff3cd",
                border: "1px solid #ffeeba",
                borderRadius: "var(--radius-sm)",
                padding: "0.6rem 0.75rem",
                marginBottom: "1.25rem",
                fontSize: "0.8rem",
                color: "#856404",
              }}
            >
              ⚠️ Guests will not be able to book this room for the selected
              dates.
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-primary flex-grow-1"
                onClick={handleBlockSubmit}
                disabled={blocking}
              >
                {blocking ? "Blocking..." : "🔒 Confirm Block"}
              </button>
              <button
                className="btn btn-outline-secondary flex-grow-1"
                onClick={() => {
                  setShowBlockModal(false);
                  setSelectedRoom(null);
                }}
                disabled={blocking}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelRoomsPage;
