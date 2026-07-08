import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchHotelsApi, filterHotelsApi } from "../../api/hotelApi";

const AMENITY_OPTIONS = [
  { key: "hasFreeWifi", label: "📶 Free WiFi" },
  { key: "hasDining", label: "🍽️ Dining" },
  { key: "hasParking", label: "🚗 Parking" },
  { key: "hasSwimmingPool", label: "🏊 Swimming Pool" },
  { key: "hasFitnessCenter", label: "💪 Fitness Center" },
  { key: "hasRoomService", label: "🛎️ Room Service" },
];

const SORT_OPTIONS = [
  { value: "name_asc", label: "Name A → Z" },
  { value: "name_desc", label: "Name Z → A" },
  { value: "amenities_desc", label: "Most Amenities" },
];

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const location = searchParams.get("location") || "";
  const originalQuery = searchParams.get("originalQuery") || "";
  const urlHasFreeWifi = searchParams.get("hasFreeWifi") === "true";
  const urlHasDining = searchParams.get("hasDining") === "true";
  const urlHasParking = searchParams.get("hasParking") === "true";
  const urlHasSwimmingPool = searchParams.get("hasSwimmingPool") === "true";
  const urlHasFitnessCenter = searchParams.get("hasFitnessCenter") === "true";
  const urlHasRoomService = searchParams.get("hasRoomService") === "true";

  const [filters, setFilters] = useState({
    hasFreeWifi: urlHasFreeWifi,
    hasDining: urlHasDining,
    hasParking: urlHasParking,
    hasSwimmingPool: urlHasSwimmingPool,
    hasFitnessCenter: urlHasFitnessCenter,
    hasRoomService: urlHasRoomService,
  });

  const [sortBy, setSortBy] = useState("name_asc");
  const [hotels, setHotels] = useState([]);
  const [allHotels, setAllHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const isFiltered = Object.values(filters).some(Boolean);

  useEffect(() => {
    fetchHotels();
  }, [location, pageNumber, filters]);

  useEffect(() => {
    const sorted = sortHotels([...allHotels], sortBy);
    setHotels(sorted);
  }, [sortBy, allHotels]);

  const fetchHotels = async () => {
    setLoading(true);
    setError("");
    try {
      let response;
      if (isFiltered) {
        response = await filterHotelsApi({
          location: location || null,
          ...filters,
          pageNumber,
          pageSize: 6,
        });
      } else {
        response = await searchHotelsApi(location, pageNumber, 6);
      }
      const items = response.data.items;
      setAllHotels(items);
      setHotels(sortHotels([...items], sortBy));
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount);
    } catch {
      setError("Failed to load hotels. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sortHotels = (list, sort) => {
    switch (sort) {
      case "name_asc":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "name_desc":
        return list.sort((a, b) => b.name.localeCompare(a.name));
      case "amenities_desc":
        return list.sort((a, b) => getAmenityCount(b) - getAmenityCount(a));
      default:
        return list;
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

  const handleFilterChange = (key) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
    setPageNumber(1);
  };

  const handleClearFilters = () => {
    setFilters({
      hasFreeWifi: false,
      hasDining: false,
      hasParking: false,
      hasSwimmingPool: false,
      hasFitnessCenter: false,
      hasRoomService: false,
    });
    setPageNumber(1);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  if (loading)
    return (
      <div>
        <div className="search-header">
          <div>
            <div
              className="skeleton"
              style={{ width: 220, height: 28, marginBottom: 8 }}
            />
            <div className="skeleton" style={{ width: 140, height: 18 }} />
          </div>
        </div>
        <div className="row">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div className="col-md-6 col-lg-4 mb-4" key={i}>
              <div className="hotel-card">
                <div className="skeleton" style={{ height: 200 }} />
                <div className="hotel-card-body">
                  <div
                    className="skeleton"
                    style={{ height: 22, marginBottom: 10 }}
                  />
                  <div
                    className="skeleton"
                    style={{ height: 16, width: "60%", marginBottom: 12 }}
                  />
                  <div className="d-flex gap-1">
                    <div
                      className="skeleton"
                      style={{ height: 24, width: 70, borderRadius: 20 }}
                    />
                    <div
                      className="skeleton"
                      style={{ height: 24, width: 70, borderRadius: 20 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <div>
      {/* Search header */}
      <div className="search-header">
        <div>
          {originalQuery && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.4rem",
              }}
            >
              <span
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary), var(--primary-light))",
                  color: "white",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  padding: "0.2rem 0.6rem",
                  borderRadius: "20px",
                }}
              >
                🔍 Smart Search
              </span>
              <span
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-secondary)",
                  fontStyle: "italic",
                }}
              >
                "{originalQuery}"
              </span>
            </div>
          )}
          <h4 className="search-title mb-1">
            {location ? (
              <>
                Hotels in <span className="text-navy">{location}</span>
              </>
            ) : (
              "Filtered Hotels"
            )}
          </h4>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.875rem",
              margin: 0,
            }}
          >
            {totalCount > 0
              ? `${totalCount} hotel${totalCount > 1 ? "s" : ""} found`
              : "No hotels found"}
          </p>
        </div>
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={() => navigate("/")}
        >
          ← New Search
        </button>
      </div>

      {/* Filter + Sort bar */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "0.85rem 1.25rem",
          marginBottom: "1.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              background:
                activeFilterCount > 0
                  ? "var(--primary)"
                  : "var(--surface-warm)",
              border: `1.5px solid ${
                activeFilterCount > 0 ? "var(--primary)" : "var(--border)"
              }`,
              color: activeFilterCount > 0 ? "white" : "var(--text-primary)",
              borderRadius: "var(--radius-sm)",
              padding: "0.4rem 0.85rem",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            🎛️ Filters
            {activeFilterCount > 0 && (
              <span
                style={{
                  background: "white",
                  color: "var(--primary)",
                  borderRadius: "50%",
                  width: 18,
                  height: 18,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          {AMENITY_OPTIONS.filter((a) => filters[a.key]).map(
            ({ key, label }) => (
              <span
                key={key}
                onClick={() => handleFilterChange(key)}
                style={{
                  background: "rgba(26,60,94,0.08)",
                  border: "1px solid rgba(26,60,94,0.2)",
                  color: "var(--primary)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  padding: "0.25rem 0.6rem",
                  borderRadius: "20px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                {label} ✕
              </span>
            ),
          )}

          {activeFilterCount > 0 && (
            <button
              onClick={handleClearFilters}
              style={{
                background: "none",
                border: "none",
                color: "var(--danger)",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                padding: "0.25rem",
              }}
            >
              Clear all
            </button>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              fontSize: "0.82rem",
              color: "var(--text-secondary)",
              fontWeight: 500,
            }}
          >
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              border: "1.5px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "0.35rem 0.75rem",
              fontSize: "0.85rem",
              fontWeight: 500,
              color: "var(--text-primary)",
              background: "var(--surface)",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expandable filter panel */}
      {showFilters && (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "1.25rem 1.5rem",
            marginBottom: "1.25rem",
          }}
        >
          <h6 style={{ fontWeight: 600, marginBottom: "0.75rem" }}>
            Filter by Amenities
          </h6>
          <div className="row">
            {AMENITY_OPTIONS.map(({ key, label }) => (
              <div className="col-md-4 col-6 mb-2" key={key}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.6rem 0.75rem",
                    background: filters[key]
                      ? "rgba(26,60,94,0.06)"
                      : "var(--surface-warm)",
                    border: `1.5px solid ${
                      filters[key] ? "var(--primary)" : "var(--border)"
                    }`,
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    userSelect: "none",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={filters[key]}
                    onChange={() => handleFilterChange(key)}
                    style={{ accentColor: "var(--primary)" }}
                  />
                  {label}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {!loading && !error && hotels.length === 0 && (
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
          <h4 style={{ fontFamily: "Playfair Display, serif" }}>
            No hotels found
          </h4>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            Try removing some filters or search a different location.
          </p>
          <div className="d-flex justify-content-center gap-2">
            {activeFilterCount > 0 && (
              <button
                className="btn btn-outline-primary"
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
            )}
            <button
              className="btn btn-primary px-4"
              onClick={() => navigate("/")}
            >
              New Search
            </button>
          </div>
        </div>
      )}

      {/* Hotel cards */}
      <div className="row">
        {hotels.map((hotel) => (
          <div className="col-md-6 col-lg-4 mb-4" key={hotel.id}>
            <div className="hotel-card">
              {/* Image section */}
              <div className="hotel-card-image">
                {hotel.imageUrl ? (
                  <img
                    src={hotel.imageUrl}
                    alt={hotel.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      position: "absolute",
                      top: 0,
                      left: 0,
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <span style={{ fontSize: "4rem" }}>🏨</span>
                )}
                <div
                  style={{
                    position: "absolute",
                    bottom: "0.75rem",
                    left: "0.75rem",
                    zIndex: 1,
                  }}
                >
                  {hotel.isActive && (
                    <span
                      style={{
                        background: "rgba(45,122,79,0.9)",
                        color: "white",
                        fontSize: "0.75rem",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "20px",
                        fontWeight: 600,
                      }}
                    >
                      ✓ Available
                    </span>
                  )}
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: "0.75rem",
                    right: "0.75rem",
                    zIndex: 1,
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
                    {getAmenityCount(hotel)} amenities
                  </span>
                </div>
              </div>

              <div className="hotel-card-body">
                <h5 className="hotel-card-name">{hotel.name}</h5>
                <p className="hotel-card-location">📍 {hotel.location}</p>

                {hotel.description && (
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
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

              <div className="hotel-card-footer">
                <button
                  className="btn btn-primary w-100"
                  onClick={() => navigate(`/hotels/${hotel.id}`)}
                >
                  View Rooms & Availability →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center gap-2 mt-2 mb-4">
          <button
            className="btn btn-outline-primary"
            disabled={pageNumber === 1}
            onClick={() => setPageNumber((p) => p - 1)}
          >
            ← Previous
          </button>
          <span
            style={{
              padding: "0.375rem 0.75rem",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
            }}
          >
            {pageNumber} / {totalPages}
          </span>
          <button
            className="btn btn-outline-primary"
            disabled={pageNumber === totalPages}
            onClick={() => setPageNumber((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
