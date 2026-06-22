# CozyHavenStayV3 — Hotel Booking Platform

A full-stack hotel booking platform built as a **.NET 8 microservices backend**, developed as part of the Hexaware Full Stack Developer training program.

---

## Project Overview

CozyHavenStayV3 is a hotel booking system that allows guests to search hotels, book rooms, and leave reviews — while hotel owners manage their listings and handle refunds, and administrators oversee the entire platform.

The backend is architected as **four independent microservices**, each with its own database, fronted by an **Ocelot API Gateway** as the single entry point for all external traffic.

---

## Architecture

Client (Postman / Frontend)

│

▼

Ocelot API Gateway (:7100)

│

┌──────┼──────────────┐

▼      ▼              ▼          ▼

Identity  Hotel       Booking    Review

Service   Service     Service    Service

(:7101)   (:7102)     (:7103)    (:7104)

│         │            │          │

DB        DB           DB         DB

Each service is independently deployable with its own SQL Server database. Services communicate via HTTP calls — no shared databases, no shared code assemblies.

---

## Services

| Service | Port | Database | Responsibility |
|---|---|---|---|
| **IdentityService** | 7101 | CozyHavenV3_Identity | User registration, login, JWT issuance, profile management |
| **HotelService** | 7102 | CozyHavenV3_Hotel | Hotel/room CRUD, fare calculation, room availability, room blocking |
| **BookingService** | 7103 | CozyHavenV3_Booking | Booking creation, payment simulation, cancellation, refund workflow |
| **ReviewService** | 7104 | CozyHavenV3_Review | Review submission with verified-stay enforcement, ratings |
| **Gateway** | 7100 | — | Ocelot API Gateway — routes all external traffic to appropriate services |

---

## Key Features

- **Custom authentication** — hand-rolled User/Role entities with `PasswordHasher<T>`, no ASP.NET Identity framework dependency
- **JWT-based authorization** — tokens issued by IdentityService, independently validated by all other services using a shared secret
- **Cross-service orchestration** — BookingService coordinates a 6-step booking saga (availability → fare → payment → room-blocking) with compensating rollback if any step fails
- **Ownership-enforced authorization** — HotelOwners can only manage their own hotels/bookings, verified via cross-service HTTP calls
- **Nights-based fare calculation** — occupancy surcharges (40% per extra adult, 20% per extra child) multiplied by number of nights
- **Verified-stay reviews** — ReviewService calls BookingService to confirm a guest actually has a confirmed booking before allowing a review
- **Pagination** — all list endpoints support `?pageNumber=&pageSize=` query parameters with a configurable max page size of 100
- **Soft deletes** — users and hotels are deactivated, never hard-deleted, preserving referential integrity
- **Centralized exception handling** — `GlobalExceptionMiddleware` across all services maps exception types to appropriate HTTP status codes with consistent JSON error responses
- **Structured logging** — log4net configured with both rolling file appender (daily rotation, 10-day retention) and console appender across all services

---

## Technology Stack

| Category | Technology |
|---|---|
| Framework | .NET 8, ASP.NET Core Web API |
| ORM | Entity Framework Core 8 (Code-First) |
| Database | SQL Server (Windows Authentication) |
| Gateway | Ocelot 24.1.0 |
| Authentication | JWT Bearer (Microsoft.AspNetCore.Authentication.JwtBearer) |
| Mapping | AutoMapper 13.0.1 |
| Validation | FluentValidation 11.11.0 |
| Logging | log4net 3.3.0 |
| Testing | NUnit, Moq 4.20.72 |
| API Documentation | Swagger / OpenAPI (Swashbuckle) |

---

## Project Structure

CozyHavenStayV3/

├── CozyHavenStayV3.IdentityService/

├── CozyHavenStayV3.HotelService/

├── CozyHavenStayV3.BookingService/

├── CozyHavenStayV3.ReviewService/

├── CozyHavenStayV3.Gateway/

├── CozyHavenStayV3.HotelService.Tests/

├── CozyHavenStayV3.IdentityService.Tests/

├── CozyHavenStayV3.BookingService.Tests/

├── CozyHavenStayV3.ReviewService.Tests/

└── CozyHavenStayV3.sln

Each service follows an identical folder structure:

ServiceName/

├── Common/         # Shared pagination types (PagedResult, PaginationQuery)

├── Controllers/    # API endpoints

├── Data/           # ApplicationDbContext (EF Core)

├── DTOs/           # Request/response shapes

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

## Cross-Service Communication

| Caller | Callee | Purpose | HTTP Verb |
|---|---|---|---|
| BookingService | HotelService | Check room availability | GET |
| BookingService | HotelService | Calculate authoritative fare | POST |
| BookingService | HotelService | Block room after booking | POST |
| BookingService | HotelService | Release block on cancellation | DELETE |
| BookingService | HotelService | Verify hotel ownership | GET |
| BookingService | HotelService | Get all owned hotel IDs | GET |
| ReviewService | BookingService | Verify completed stay before review | GET |

---

## Unit Tests

| Test Project | Test Classes | Tests | Key Coverage |
|---|---|---|---|
| HotelService.Tests | RoomServiceTests, HotelManagementServiceTests, RoomBlockServiceTests | 17 | Fare calculation (nights + occupancy), ownership enforcement, overlap detection |
| IdentityService.Tests | AuthServiceTests, AccountServiceTests | 10 | Account enumeration protection, password hashing verification, role assignment |
| BookingService.Tests | BookingManagementServiceTests | 9 | Saga rollback on mid-process failure, ownership-enforced cancel/refund |
| ReviewService.Tests | ReviewManagementServiceTests | 5 | Cross-service stay verification, duplicate review prevention |
| **Total** | **7 classes** | **44 tests** | |

Tests use **NUnit** for structure and **Moq** for dependency mocking — allowing full isolation of business logic without requiring a running database.

---

## Getting Started

### Prerequisites
- .NET 8 SDK
- SQL Server (local instance with Windows Authentication)
- Visual Studio 2022 (recommended) or VS Code

### Setup

**1. Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

**2. Configure each service**

For each of the five projects, copy the example config and fill in your values:
```bash
cp CozyHavenStayV3.IdentityService/appsettings.example.json \
   CozyHavenStayV3.IdentityService/appsettings.json
```
Update `Server=` in the connection string to your SQL Server instance name, and set a strong JWT secret (minimum 32 characters, same value across all services).

**3. Run database migrations**

Migrations run automatically on startup via `context.Database.MigrateAsync()` in each service's `Program.cs` — databases and tables are created automatically the first time each service starts.

**4. Configure Multiple Startup Projects**

In Visual Studio: right-click Solution → Properties → Multiple Startup Projects → set all five projects to "Start."

**5. Run the solution**

Press **F5**. Five console windows open. The bootstrap Admin account (`admin@cozyhavenstay.com`) is seeded automatically by IdentityService on first startup.

### API Documentation

Once running, each service exposes Swagger UI (Development mode only):
- IdentityService: `https://localhost:7101/swagger`
- HotelService: `https://localhost:7102/swagger`
- BookingService: `https://localhost:7103/swagger`
- ReviewService: `https://localhost:7104/swagger`

All production API calls should go through the Gateway at `https://localhost:7100`.

---

## Known Limitations

- **Simulated payment** — no real payment gateway; all payments complete immediately and always succeed
- **No service-to-service authentication** — internal cross-service HTTP calls carry no dedicated auth token; appropriate for this training project's scope
- **No duplicate hotel check** — a hotel owner can currently create two hotels with identical name and location
- **In-memory refund filtering** — `GetPendingRefundsAsync` loads all pending refunds then filters in C#, rather than filtering at the SQL level
- **No token revocation** — JWT tokens remain valid until natural expiry (60 minutes) even if the user account is deactivated mid-session

---

## Author

Yuvashree R
Hexaware Full Stack Developer Training — .NET + React batch