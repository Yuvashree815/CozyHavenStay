# CozyHavenStay — Backend

A hotel booking platform backend built with .NET 8 microservices, developed as part of the Hexaware Full Stack Developer Training Program.

**Developer:** Yuvashree R

---

## Architecture

```
Client (React Frontend / Postman)
              │
              ▼
   Ocelot API Gateway (:7100)
              │
  ┌───────────┼───────────┬───────────┐
  ▼           ▼           ▼           ▼
Identity    Hotel       Booking     Review
Service     Service     Service     Service
(:7101)    (:7102)     (:7103)     (:7104)
   │           │           │           │
  DB          DB          DB          DB
```

Each service is independently deployable with its own SQL Server database. Services communicate via HTTP calls — no shared databases, no shared code assemblies.

---

## Services

| Service | Port | Database | Responsibility |
|---|---|---|---|
| IdentityService | 7101 | CozyHavenV3_Identity | User registration, login, JWT issuance, profile management, forgot/reset password |
| HotelService | 7102 | CozyHavenV3_Hotel | Hotel/room CRUD, fare calculation, room availability, room blocking, amenity filtering, image URLs |
| BookingService | 7103 | CozyHavenV3_Booking | Booking creation, payment simulation, cancellation, tiered refund workflow, booking confirmation email |
| ReviewService | 7104 | CozyHavenV3_Review | Review submission with verified-stay enforcement, ratings summary |
| Gateway | 7100 | — | Ocelot API Gateway — routes all external traffic to appropriate services |

---

## Key Features

### Authentication & Authorization
- Custom authentication — hand-rolled User/Role entities with `PasswordHasher<T>`, no ASP.NET Identity framework dependency
- JWT-based authorization — tokens issued by IdentityService, independently validated by all other services
- Role-based access — three roles: Admin, HotelOwner, User with separate endpoint restrictions
- Ownership-enforced authorization — HotelOwners can only manage their own hotels and bookings
- **Forgot password flow** — secure token-based reset with expiry, email sent via Gmail SMTP
- Bootstrap admin — seeded automatically on first startup

### Booking & Payments
- **Saga pattern** — BookingService coordinates a 6-step booking saga with compensating rollback
- **Tiered cancellation refund policy:**
  - 100% refund — cancelled 48+ hours before check-in
  - 50% refund — cancelled 24-48 hours before check-in
  - 0% refund — cancelled within 24 hours of check-in
- Refund policy endpoint — guests can check refund amount before confirming cancellation
- **Booking confirmation email** — sent to guest after booking is confirmed via Gmail SMTP

### Realistic Fare Calculation
- Children aged 5 and under are always free regardless of occupancy
- Adults fill free occupancy slots first (descending age order)
- Extra adults beyond free occupancy → 40% surcharge per night
- Extra children (age 6-14) beyond free occupancy → 20% surcharge per night
- All surcharges multiplied by number of nights

### Hotel & Room Management
- Per-room pricing — each room has its own base fare set by the hotel owner
- Room availability tracking via RoomBlock entity
- Combined availability endpoint returns all rooms with `isAvailable` flag per date range
- **Amenity-based hotel filtering** — filter by WiFi, dining, parking, pool, gym, room service
- **Image URL support** — optional image URLs on hotels and rooms
- Duplicate hotel prevention per owner

### Reviews
- Verified-stay enforcement — ReviewService calls BookingService to confirm a completed booking before allowing a review
- Rating summary endpoint returns average rating and total review count per hotel

### Platform-Wide
- Pagination — all list endpoints support `pageNumber` and `pageSize`
- Soft deletes — users and hotels are deactivated, never hard-deleted
- Centralized exception handling — `GlobalExceptionMiddleware` across all services
- Structured logging — log4net with rolling file appender (daily rotation, 10-day retention)

---

## Technology Stack

| Category | Technology |
|---|---|
| Framework | .NET 8, ASP.NET Core Web API |
| ORM | Entity Framework Core 8 (Code-First, Migrations) |
| Database | SQL Server (Windows Authentication) |
| Gateway | Ocelot 24.1.0 |
| Authentication | JWT Bearer |
| Email | System.Net.Mail (Gmail SMTP) |
| Mapping | AutoMapper 14.0.0 |
| Validation | FluentValidation 11.11.0 |
| Logging | log4net 3.3.0 |
| Testing | NUnit 4.x, Moq 4.20.72 |
| API Documentation | Swagger / OpenAPI (Swashbuckle) |

---

## Project Structure

```
backend/
├── CozyHavenStayV3.IdentityService/
├── CozyHavenStayV3.HotelService/
├── CozyHavenStayV3.BookingService/
├── CozyHavenStayV3.ReviewService/
├── CozyHavenStayV3.Gateway/
├── CozyHavenStayV3.IdentityService.Tests/
├── CozyHavenStayV3.HotelService.Tests/
├── CozyHavenStayV3.BookingService.Tests/
├── CozyHavenStayV3.ReviewService.Tests/
└── CozyHavenStayV3.slnx
```

Each service follows an identical internal structure:

```
ServiceName/
├── Common/         # PagedResult, PaginationQuery
├── Controllers/    # API endpoints
├── Data/           # ApplicationDbContext (EF Core)
├── DTOs/           # Request and response shapes
├── Mapping/        # AutoMapper profiles
├── Middleware/     # GlobalExceptionMiddleware
├── Models/         # Database entities
├── Repositories/   # Data access layer (Interface + Implementation)
├── Services/       # Business logic layer (Interface + Implementation)
├── Validators/     # FluentValidation rules
├── Migrations/     # EF Core auto-generated migrations
├── appsettings.example.json
├── log4net.config
└── Program.cs
```

---

## API Endpoints Summary

### IdentityService (:7101)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/v1/auth/login | None | Login, returns JWT |
| POST | /api/v1/auth/forgot-password | None | Send password reset email |
| POST | /api/v1/auth/reset-password | None | Reset password with token |
| POST | /api/v1/account/register/user | None | Register guest |
| POST | /api/v1/account/register/hotelowner | None | Register hotel owner |
| POST | /api/v1/account/register/admin | Admin | Register admin |
| GET | /api/v1/account/profile | Any | Get own profile |
| PUT | /api/v1/account/profile | Any | Update own profile |
| GET | /api/v1/account/users | Admin | List all users (paginated) |
| DELETE | /api/v1/account/users/{id} | Admin | Deactivate user |

### HotelService (:7102)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/v1/hotels/search | None | Search hotels by location |
| GET | /api/v1/hotels/filter | None | Filter hotels by location + amenities |
| GET | /api/v1/hotels/{id} | None | Get hotel details |
| POST | /api/v1/hotels | HotelOwner | Create hotel |
| PUT | /api/v1/hotels/{id} | HotelOwner | Update hotel |
| DELETE | /api/v1/hotels/{id} | Admin | Deactivate hotel |
| GET | /api/v1/hotels/my-hotels | HotelOwner | Get own hotels |
| GET | /api/v1/hotels/{hotelId}/rooms | None | Get rooms for hotel |
| GET | /api/v1/hotels/{hotelId}/rooms/availability | None | Get rooms with availability |
| POST | /api/v1/hotels/{hotelId}/rooms | HotelOwner | Add room |
| GET | /api/v1/rooms/{id} | None | Get room by ID |
| PUT | /api/v1/rooms/{id} | HotelOwner | Update room |
| DELETE | /api/v1/rooms/{id} | HotelOwner | Delete room |
| POST | /api/v1/rooms/{id}/calculate-fare | None | Calculate fare |

### BookingService (:7103)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/v1/bookings | User | Create booking (sends confirmation email) |
| GET | /api/v1/bookings/{id} | Any | Get booking by ID |
| GET | /api/v1/bookings/my-bookings | User | Get own bookings |
| POST | /api/v1/bookings/{id}/cancel | User | Cancel booking |
| GET | /api/v1/bookings/{id}/refund-policy | User | Check refund amount before cancel |
| GET | /api/v1/bookings/hotel/{hotelId} | HotelOwner | Get bookings for hotel |
| GET | /api/v1/bookings/pending-refunds | HotelOwner | Get pending refunds |
| POST | /api/v1/bookings/{id}/approve-refund | HotelOwner | Approve refund |

### ReviewService (:7104)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/v1/reviews | User | Submit review (verified stay required) |
| GET | /api/v1/reviews/hotel/{hotelId} | None | Get hotel reviews (paginated) |
| GET | /api/v1/reviews/hotel/{hotelId}/summary | None | Get average rating + count |

---

## Cross-Service Communication

| Caller | Callee | Purpose | HTTP Verb |
|---|---|---|---|
| BookingService | HotelService | Check room availability | GET |
| BookingService | HotelService | Calculate authoritative fare | POST |
| BookingService | HotelService | Block room after booking confirmed | POST |
| BookingService | HotelService | Release room block on cancellation | DELETE |
| BookingService | HotelService | Verify hotel ownership | GET |
| BookingService | HotelService | Get hotel/room details for email | GET |
| ReviewService | BookingService | Verify completed stay before review | GET |

---

## Unit Tests

**70 tests across 4 test projects — all passing.**

| Test Project | Tests | Key Coverage |
|---|---|---|
| HotelService.Tests | 17 | Fare calculation, availability checking, ownership enforcement, room block overlap |
| IdentityService.Tests | 13 | Login, registration, password hashing, role assignment, account enumeration protection |
| BookingService.Tests | 26 | Booking saga, cancellation with tiered refunds, refund approval, ownership enforcement |
| ReviewService.Tests | 8 | Cross-service stay verification, duplicate review prevention, rating summary |
| Validator Tests | 6 | CreateBookingDto, RegisterUserDto, CreateReviewDto |
| **Total** | **70** | |

Tests use NUnit for structure and Moq for dependency mocking — full isolation of business logic without a running database.

---

## Getting Started

### Prerequisites
- .NET 8 SDK
- SQL Server (local instance with Windows Authentication)
- Visual Studio 2022
- Gmail account with App Password (for email features)

### Setup

**1. Clone the repository**
```bash
git clone https://github.com/Yuvashree815/CozyHavenStay.git
cd CozyHavenStay/backend
```

**2. Configure each service**

Copy the example config and fill in your values for each service:
```bash
cp CozyHavenStayV3.IdentityService/appsettings.example.json CozyHavenStayV3.IdentityService/appsettings.json
cp CozyHavenStayV3.HotelService/appsettings.example.json CozyHavenStayV3.HotelService/appsettings.json
cp CozyHavenStayV3.BookingService/appsettings.example.json CozyHavenStayV3.BookingService/appsettings.json
cp CozyHavenStayV3.ReviewService/appsettings.example.json CozyHavenStayV3.ReviewService/appsettings.json
cp CozyHavenStayV3.Gateway/appsettings.example.json CozyHavenStayV3.Gateway/appsettings.json
```

Update each `appsettings.json`:
- `ConnectionStrings.DefaultConnection` — your SQL Server instance name
- `Jwt.Secret` — minimum 32 characters, same value across all five services
- `EmailSettings.SenderEmail` — your Gmail address (IdentityService + BookingService)
- `EmailSettings.AppPassword` — Gmail App Password (no spaces)
- `FrontendBaseUrl` — `http://localhost:5173` (IdentityService)
- `BootstrapAdmin` — credentials for the seeded admin account (IdentityService only)

**3. Run database migrations**

Migrations run automatically on startup — databases and tables are created automatically the first time each service starts.

**4. Configure Multiple Startup Projects**

In Visual Studio:
- Right-click Solution → Properties
- Common Properties → Startup Project
- Select Multiple startup projects
- Set all five projects to **Start**
- Click OK

**5. Start the solution**

Press **F5**. Five console windows open. The bootstrap Admin account is seeded automatically by IdentityService on first startup.

---

## Default Admin Credentials

| Field | Value |
|---|---|
| Email | admin@cozyhavenstay.com |
| Password | CozyHaven@Admin123 |

---

## API Documentation

Each service exposes Swagger UI in Development mode:

| Service | Swagger URL |
|---|---|
| IdentityService | https://localhost:7101/swagger |
| HotelService | https://localhost:7102/swagger |
| BookingService | https://localhost:7103/swagger |
| ReviewService | https://localhost:7104/swagger |

All production API calls go through the Gateway: `https://localhost:7100`

---

## Email Configuration

CozyHavenStay uses Gmail SMTP for two email flows:

1. **Forgot Password** — IdentityService sends a secure reset link valid for 1 hour
2. **Booking Confirmation** — BookingService sends a formatted booking summary after confirmation

To enable emails:
1. Enable 2-Step Verification on your Gmail account
2. Generate an App Password (Google Account → Security → App passwords)
3. Add credentials to `appsettings.json` in both IdentityService and BookingService

---

## Known Limitations

- Simulated payment — no real payment gateway; all payments complete immediately
- No service-to-service authentication — internal cross-service HTTP calls carry no dedicated auth token
- No token revocation — JWT tokens remain valid until natural expiry (60 minutes)
- In-memory refund filtering — `GetPendingRefundsAsync` filters in C# rather than at the SQL level

---

## Author

**Yuvashree R**  
Hexaware Full Stack Developer Training — .NET + React Batch  
GitHub: [@Yuvashree815](https://github.com/Yuvashree815)