# CozyHavenStay — Frontend

A professional hotel booking platform frontend built with React 18 + Vite, connected to a .NET 8 microservices backend via an Ocelot API Gateway.

**Developer:** Yuvashree R

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool and dev server |
| React Router DOM | Client-side routing |
| Axios | HTTP client with JWT interceptors |
| Bootstrap 5 | UI components and responsive grid |
| useContext + useReducer | Global auth state management |
| Google Fonts (Playfair Display + Inter) | Typography |

---

## Project Structure

```
src/
├── api/                     # Axios instance + all API call functions
│   ├── axiosInstance.js     # Base Axios config, JWT interceptors
│   ├── authApi.js           # Identity service calls (login, register, forgot/reset password)
│   ├── hotelApi.js          # Hotel and room calls + filter endpoint
│   ├── bookingApi.js        # Booking lifecycle calls
│   └── reviewApi.js         # Review and rating calls
├── context/                 # Global state
│   ├── AuthContext.jsx      # useContext + useReducer auth provider
│   └── AuthReducer.js       # LOGIN / LOGOUT / UPDATE_PROFILE actions
├── components/              # Reusable components
│   ├── Navbar.jsx           # Role-aware navigation
│   ├── ProtectedRoute.jsx   # Redirects unauthenticated users
│   └── RoleRoute.jsx        # Redirects unauthorized roles
├── pages/
│   ├── public/              # No login required
│   │   ├── HomePage.jsx           # Hero search + smart keyword parsing
│   │   ├── SearchResultsPage.jsx  # Hotel cards + filter chips + sort
│   │   └── HotelDetailPage.jsx    # Availability checker + room cards + reviews
│   ├── auth/
│   │   ├── LoginPage.jsx          # JWT login + role-based redirect
│   │   ├── RegisterPage.jsx       # Guest / HotelOwner registration + real-time validation
│   │   ├── ForgotPasswordPage.jsx # Send password reset email
│   │   └── ResetPasswordPage.jsx  # Reset password via token link
│   ├── guest/
│   │   ├── ProfilePage.jsx        # View + edit profile
│   │   ├── MyBookingsPage.jsx     # Booking history with hotel names
│   │   ├── BookingDetailPage.jsx  # Fare breakdown + refund policy + cancel
│   │   ├── BookingPage.jsx        # Fare calculator + booking confirmation
│   │   └── WriteReviewPage.jsx    # Star rating + comment submission
│   ├── owner/
│   │   ├── OwnerDashboardPage.jsx    # Stats + quick actions + hotel summary
│   │   ├── MyHotelsPage.jsx          # Hotels list + expandable rooms panel
│   │   ├── HotelFormPage.jsx         # Create / edit hotel with image URL preview
│   │   ├── RoomFormPage.jsx          # Create / edit room with image URL preview
│   │   ├── HotelBookingsPage.jsx     # All bookings for a hotel
│   │   └── PendingRefundsPage.jsx    # Approve pending refunds
│   └── admin/
│       ├── AdminDashboardPage.jsx    # Stats + register admin modal
│       ├── AllUsersPage.jsx          # User table + role filter chips
│       └── AllHotelsPage.jsx         # Hotel table + status filter chips
└── utils/
    └── searchParser.js       # Smart keyword search parser
```

---

## Setup

### Prerequisites
- Node.js 18+
- Backend services running (see `backend/README.md`)

### Installation

```bash
cd frontend
npm install
```

### Environment Configuration

```bash
cp .env.example .env
```

Update `.env` with your gateway URL:
```
VITE_API_BASE_URL=https://localhost:7100
```

### Start Development Server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Key Features

### Smart Search
The search bar supports both simple and natural language queries:

| Query | Behaviour |
|---|---|
| `Chennai` | Direct location search — no parsing |
| `Mumbai` | Direct location search — no parsing |
| `hotel in chennai with pool` | Extracts location + hasSwimmingPool filter |
| `mumbai with wifi and dining` | Extracts location + hasFreeWifi + hasDining |
| `hotels with gym and parking` | Amenity-only filter across all cities |

Detects 30 Indian cities and 6 amenity categories (pool, wifi, gym, dining, parking, room service).

### Authentication & Authorization
- JWT stored in `localStorage` — survives page refresh
- `useReducer` manages `user`, `token`, `isAuthenticated` atomically
- `ProtectedRoute` — redirects unauthenticated users to `/login`
- `RoleRoute` — redirects users without the required role to `/`
- Auto-redirect on login based on role (Admin → dashboard, HotelOwner → dashboard, Guest → home)
- 401 interceptor — clears auth and redirects to login on token expiry

### Forgot Password Flow
- "Forgot password?" link on login page
- User enters email → backend sends reset link to registered email
- Reset link contains secure token valid for 1 hour
- ResetPasswordPage shows password strength indicator and requirements checklist
- On success → auto-redirect to login after 3 seconds

### Registration with Real-Time Validation
- Green border + ✓ when field is valid
- Red border + ⚠️ message when field is invalid
- Password strength bar (Weak / Fair / Good / Strong)
- Live password requirements checklist (length, uppercase, lowercase, number, special character)
- Passwords match indicator on confirm password field

### Hotel & Room Images
- Hotel owners can add image URLs when creating/editing hotels and rooms
- Live image preview in the form before saving
- Real hotel photos displayed in search result cards
- Hero banner with real image and dark overlay on hotel detail page
- Room images shown in availability checker

### Role-Based Journeys

**Guest**
- Search hotels by location or natural language query
- Check room availability by date range
- Calculate fare with transparent guest-based surcharge breakdown
- Book rooms with multiple payment methods
- Receive booking confirmation email after successful booking
- View booking history with hotel names resolved cross-service
- View refund policy before cancelling
- Write verified reviews after completed stays

**Hotel Owner**
- Create and manage hotel listings with amenities and image URL
- Add, edit, and delete individual rooms with custom pricing and image URL
- View all bookings for their properties
- Approve pending refunds with refund amount displayed

**Admin**
- View platform-wide user and hotel statistics
- Filter users by role (Admin / HotelOwner / User)
- Filter hotels by status (Active / Inactive)
- Deactivate user accounts and hotel listings
- Register new admin accounts via modal

### Fare Calculation
Transparent fare breakdown showing:
- Base fare per night
- Number of nights
- Free occupancy threshold
- Extra guest surcharge (adults 40%, children 6-14 at 20%)
- Children aged 5 and under always free
- Total fare

### Cancellation Policy
Tiered refund policy displayed before every cancellation:
- Full refund — cancel 48+ hours before check-in
- 50% refund — cancel 24-48 hours before check-in
- No refund — cancel within 24 hours of check-in

---

## Design System

Custom CSS variables defined in `src/index.css`:

| Variable | Value | Usage |
|---|---|---|
| `--primary` | `#1a3c5e` | Navy blue — buttons, headers, navbar |
| `--accent` | `#c9a84c` | Gold — highlights, hover states |
| `--bg` | `#f8f6f2` | Warm off-white — page background |
| `--surface` | `#ffffff` | Card backgrounds |
| `--text-primary` | `#1a1a2e` | Main text |
| `--text-secondary` | `#5a5a7a` | Muted text |

**Fonts:** Playfair Display (headings) + Inter (body) via Google Fonts

**Custom components:** `cozy-card`, `booking-card`, `stat-card`, `hotel-card`, `room-card`, `pro-table`, `admin-card`, `page-header`, `section-title`, `amenity-badge`, `role-admin`, `role-owner`, `role-user`, `status-active`, `status-inactive`, `badge-confirmed`, `badge-cancelled`, `badge-pending`, `badge-refunded`, `skeleton`

---

## API Integration

All API calls go through the Ocelot Gateway at `VITE_API_BASE_URL`.

| Service | Prefix | Port |
|---|---|---|
| IdentityService | `/identity/` | 7101 |
| HotelService | `/hotel/` | 7102 |
| BookingService | `/booking/` | 7103 |
| ReviewService | `/review/` | 7104 |

The Axios instance (`src/api/axiosInstance.js`) automatically:
- Attaches `Authorization: Bearer <token>` to every request
- Clears auth state and redirects to `/login` on any 401 response

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@cozyhavenstay.com | CozyHaven@Admin123 |
| Hotel Owner | rajesh.owner@cozyhaven.com | CozyOwner@123 |
| Guest | ananya@gmail.com | CozyGuest@123 |

---

## Known Limitations

- No real payment gateway — payments are simulated and always succeed
- Smart search covers 30 Indian cities — international cities fall back to direct text match
- No TypeScript — plain JavaScript used throughout

---

## Author

**Yuvashree R**  
Hexaware Full Stack Developer Training — .NET + React Batch  
GitHub: [@Yuvashree815](https://github.com/Yuvashree815)