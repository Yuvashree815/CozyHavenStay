# CozyHavenStay — Backend

A hotel booking platform backend built with **.NET 8 microservices**, developed as part of the Hexaware Full Stack Developer training program.

---

## Project Overview

CozyHavenStay is a hotel chain management platform — similar to how OYO or Marriott operates. A central admin manages the brand, appointed hotel owners manage individual properties, and guests book directly through the platform.

The backend is architected as **four independent microservices**, each with its own database, fronted by an **Ocelot API Gateway** as the single entry point for all external traffic.

---

## Architecture

Client (React Frontend / Postman)
│
▼
Ocelot API Gateway (:7100)
│
┌─────────┼──────────┬──────────┐
▼         ▼          ▼          ▼
Identity    Hotel     Booking    Review
Service    Service    Service    Service
(:7101)   (:7102)    (:7103)    (:7104)
│          │          │          │
DB         DB         DB         DB

Each service is independently deployable with its own SQL Server database. Services communicate via HTTP calls — no shared databases, no shared code assemblies.

---

## Services

| Service | Port | Database | Responsibility |
|---|---|---|---|
| **IdentityService** | 7101 | CozyHavenV3_Identity | User registration, login, JWT issuance, profile management |
| **HotelService** | 7102 | CozyHavenV3_Hotel | Hotel/room CRUD, fare calculation, room availability, room blocking, amenity filtering |
| **BookingService** | 7103 | CozyHavenV3_Booking | Booking creation, payment simulation, cancellation, tiered refund workflow |
| **ReviewService** | 7104 | CozyHavenV3_Review | Review submission with verified-stay enforcement, ratings summary |
| **Gateway** | 7100 | — | Ocelot API Gateway — routes all external traffic to appropriate services |

---

## Key Features

### Authentication & Authorization
- **Custom authentication** — hand-rolled User/Role entities with `PasswordHasher<T>`, no ASP.NET Identity framework dependency
- **JWT-based authorization** — tokens issued by IdentityService, independently validated by all other services using a shared secret
- **Role-based access** — three roles: `Admin`, `HotelOwner`, `User` with separate endpoint restrictions
- **Ownership-enforced authorization** — HotelOwners can only manage their own hotels and bookings, verified via cross-service HTTP calls

### Booking & Payments
- **Saga pattern** — BookingService coordinates a 6-step booking saga (availability check → fare calculation → payment simulation → room blocking) with compensating rollback if any step fails
- **Tiered cancellation refund policy:**
  - 100% refund — cancelled 48+ hours before check-in
  - 50% refund — cancelled 24-48 hours before check-in
  - 0% refund — cancelled within 24 hours of check-in
- **Refund policy endpoint** — guests can check their refund amount before confirming cancellation

### Realistic Fare Calculation
- Children aged **5 and under** are always free regardless of occupancy
- **Adults fill free occupancy slots first** (descending age order)
- Extra adults beyond free occupancy → **40% surcharge per night**
- Extra children (age 6-14) beyond free occupancy → **20% surcharge per night**
- All surcharges multiplied by number of nights

### Hotel & Room Management
- Per-room pricing — each room has its own base fare set by the hotel owner
- Room availability tracking via `RoomBlock` entity
- Combined availability endpoint returns all rooms with `isAvailable` flag per date range
- Amenity-based hotel filtering — filter by WiFi, dining, parking, pool, gym, room service
- Duplicate hotel prevention per owner

### Reviews
- **Verified-stay enforcement** — ReviewService calls BookingService to confirm a completed booking before allowing a review
- Rating summary endpoint returns average rating and total review count per hotel

### Platform-wide
- **Pagination** — all list endpoints support `pageNumber` and `pageSize` with configurable max of 100
- **Soft deletes** — users and hotels are deactivated, never hard-deleted
- **Centralized exception handling** — `GlobalExceptionMiddleware` across all services with consistent JSON error responses
- **Structured logging** — log4net with rolling file appender (daily rotation, 10-day retention) and console appender

---

## Technology Stack

| Category | Technology |
|---|---|
| Framework | .NET 8, ASP.NET Core Web API |
| ORM | Entity Framework Core 8 (Code-First, Migrations) |
| Database | SQL Server (Windows Authentication) |
| Gateway | Ocelot 24.1.0 |
| Authentication | JWT Bearer (Microsoft.AspNetCore.Authentication.JwtBearer) |
| Mapping | AutoMapper 13.0.1 |
| Validation | FluentValidation 11.11.0 |
| Logging | log4net 3.3.0 |
| Testing | NUnit 4.x, Moq 4.20.72 |
| API Documentation | Swagger / OpenAPI (Swashbuckle) |

---

## Project Structure

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


Each service follows an identical internal structure:

ServiceName/
├── Common/         # PagedResult<T>, PaginationQuery
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

---

## API Endpoints Summary

### IdentityService (:7101)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/login` | None | Login, returns JWT |
| POST | `/api/v1/account/register/user` | None | Register guest |
| POST | `/api/v1/account/register/hotelowner` | None | Register hotel owner |
| POST | `/api/v1/account/register/admin` | Admin | Register admin |
| GET | `/api/v1/account/profile` | Any | Get own profile |
| PUT | `/api/v1/account/profile` | Any | Update own profile |
| GET | `/api/v1/account/users` | Admin | List all users (paginated) |
| DELETE | `/api/v1/account/users/{id}` | Admin | Deactivate user |

### HotelService (:7102)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/hotels/search` | None | Search hotels by location |
| GET | `/api/v1/hotels/filter` | None | Filter hotels by location + amenities |
| GET | `/api/v1/hotels/{id}` | None | Get hotel details |
| POST | `/api/v1/hotels` | HotelOwner | Create hotel |
| PUT | `/api/v1/hotels/{id}` | HotelOwner | Update hotel |
| DELETE | `/api/v1/hotels/{id}` | Admin | Deactivate hotel |
| GET | `/api/v1/hotels/my-hotels` | HotelOwner | Get own hotels |
| GET | `/api/v1/hotels/{hotelId}/rooms` | None | Get rooms for hotel |
| GET | `/api/v1/hotels/{hotelId}/rooms/availability` | None | Get rooms with availability |
| POST | `/api/v1/hotels/{hotelId}/rooms` | HotelOwner | Add room |
| GET | `/api/v1/rooms/{id}` | None | Get room by ID |
| PUT | `/api/v1/rooms/{id}` | HotelOwner | Update room |
| DELETE | `/api/v1/rooms/{id}` | HotelOwner | Delete room |
| POST | `/api/v1/rooms/{id}/calculate-fare` | None | Calculate fare |

### BookingService (:7103)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/bookings` | User | Create booking |
| GET | `/api/v1/bookings/{id}` | Any | Get booking by ID |
| GET | `/api/v1/bookings/my-bookings` | User | Get own bookings |
| POST | `/api/v1/bookings/{id}/cancel` | User | Cancel booking |
| GET | `/api/v1/bookings/{id}/refund-policy` | User | Check refund amount before cancel |
| GET | `/api/v1/bookings/hotel/{hotelId}` | HotelOwner | Get bookings for hotel |
| GET | `/api/v1/bookings/pending-refunds` | HotelOwner | Get pending refunds |
| POST | `/api/v1/bookings/{id}/approve-refund` | HotelOwner | Approve refund |

### ReviewService (:7104)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/reviews` | User | Submit review (verified stay required) |
| GET | `/api/v1/reviews/hotel/{hotelId}` | None | Get hotel reviews (paginated) |
| GET | `/api/v1/reviews/hotel/{hotelId}/summary` | None | Get average rating + count |

---

## Cross-Service Communication

| Caller | Callee | Purpose | HTTP Verb |
|---|---|---|---|
| BookingService | HotelService | Check room availability | GET |
| BookingService | HotelService | Calculate authoritative fare | POST |
| BookingService | HotelService | Block room after booking confirmed | POST |
| BookingService | HotelService | Release room block on cancellation | DELETE |
| BookingService | HotelService | Verify hotel ownership | GET |
| BookingService | HotelService | Get all hotel IDs owned by user | GET |
| ReviewService | BookingService | Verify completed stay before review | GET |

---

## Unit Tests

70 tests across 4 test projects — all passing.

| Test Project | Tests | Key Coverage |
|---|---|---|
| HotelService.Tests | 17 | Realistic fare calculation (child pricing, always-free under-6, adults fill slots first), availability checking, ownership enforcement, room block overlap detection |
| IdentityService.Tests | 13 | Login, registration, password hashing, role assignment, account enumeration protection, phone number validation |
| BookingService.Tests | 26 | Booking creation saga, cancellation with tiered refunds, already-cancelled guard, ownership-enforced operations, refund approval |
| ReviewService.Tests | 8 | Cross-service stay verification, duplicate review prevention, rating summary calculation |
| Validator Tests | 6 | CreateBookingDto (past date, min/max stay), RegisterUserDto (phone format), CreateReviewDto (rating range 1-5) |
| **Total** | **70** | |

Tests use **NUnit** for structure and **Moq** for dependency mocking — full isolation of business logic without a running database.

---

## Getting Started

### Prerequisites
- .NET 8 SDK
- SQL Server (local instance with Windows Authentication)
- Visual Studio 2022 or VS Code

### Setup

**1. Clone the repository**
```bash
git clone https://github.com/vidya-udayakumar123/CozyHavenStayV3.git
cd CozyHavenStayV3/backend
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
- `JwtSettings.Secret` — minimum 32 characters, **same value across all five services**
- `JwtSettings.Issuer` and `Audience` — same across all services
- `BootstrapAdmin` — credentials for the seeded admin account (IdentityService only)

**3. Run database migrations**

Migrations run automatically on startup via `context.Database.MigrateAsync()` — databases and tables are created automatically the first time each service starts. No manual migration commands needed.

**4. Configure Multiple Startup Projects**

In Visual Studio:
1. Right-click Solution → Properties
2. Common Properties → Startup Project
3. Select **Multiple startup projects**
4. Set all five projects to **Start**
5. Click OK

**5. Start the solution**

Press **F5**. Five console windows open. The bootstrap Admin account is seeded automatically by IdentityService on first startup.

### Default Admin Credentials
Email:    admin@cozyhavenstay.com
Password: CozyHaven@Admin123

### API Documentation

Each service exposes Swagger UI in Development mode:

| Service | Swagger URL |
|---|---|
| IdentityService | https://localhost:7101/swagger |
| HotelService | https://localhost:7102/swagger |
| BookingService | https://localhost:7103/swagger |
| ReviewService | https://localhost:7104/swagger |

All production API calls go through the Gateway: `https://localhost:7100`

---

## Known Limitations

- **Simulated payment** — no real payment gateway; all payments complete immediately and always succeed
- **No service-to-service authentication** — internal cross-service HTTP calls carry no dedicated auth token
- **No token revocation** — JWT tokens remain valid until natural expiry (60 minutes) even after account deactivation
- **No hotel image support** — image/video upload is a planned future feature
- **In-memory refund filtering** — `GetPendingRefundsAsync` filters in C# rather than at the SQL level

---

## Author

Yuvashree R
Hexaware Full Stack Developer Training — .NET + React batch
