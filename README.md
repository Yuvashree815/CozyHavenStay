# CozyHavenStay — Hotel Booking Platform

A full-stack hotel booking platform built with .NET 8 microservices backend and React 18 frontend, developed as part of the Hexaware Full Stack Developer Training Program.

**Developer:** Yuvashree R  
**Batch:** .NET + React Full Stack Developer  
**GitHub:** [Yuvashree815/CozyHavenStay](https://github.com/Yuvashree815/CozyHavenStay)

---

## What is CozyHavenStay?

The CozyHavenStay Hotel Booking System is a comprehensive web application that allows users to search, book, and manage hotel reservations online. It caters to both guests and hotel administrators, providing a user-friendly experience for travelers and efficient management tools for hotel staff.

---

## Repository Structure

```
CozyHavenStayV3/
├── backend/     # .NET 8 microservices (Identity, Hotel, Booking, Review, Gateway)
├── frontend/    # React 18 + Vite frontend
└── README.md
```

---

## Architecture Overview

```
Client (React Frontend)
        │
        ▼
Ocelot API Gateway (:7100)
        │
┌───────┼───────────┬───────────┐
▼       ▼           ▼           ▼
Identity  Hotel    Booking    Review
Service   Service  Service    Service
(:7101)  (:7102)  (:7103)    (:7104)
   │        │        │          │
  DB       DB       DB         DB
```

Each service is independently deployable with its own SQL Server database. Services communicate via HTTP — no shared databases, no shared code assemblies.

---

## Key Features

### Platform Features
- 🏨 **18 hotels** across 6 Indian cities (Chennai, Mumbai, Bangalore, Delhi, Goa, Hyderabad)
- 🔍 **Smart keyword search** — natural language parsing detecting 30 Indian cities and 6 amenity categories
- 🎛️ **Filter & Sort** — filter by amenities, sort by name or amenity count
- 📧 **Email notifications** — booking confirmation and password reset emails via Gmail SMTP
- 🖼️ **Hotel & room images** — real images via URL with live preview in admin forms

### Authentication & Security
- Custom JWT authentication — hand-rolled without ASP.NET Identity framework
- Role-based access control — Admin, HotelOwner, Guest
- Forgot password flow with secure token-based reset
- Real-time registration validation with password strength indicator

### Booking & Payments
- Saga pattern booking — 6-step with compensating rollback
- Tiered cancellation refund policy (100% / 50% / 0%)
- Realistic child pricing — under-6 always free, adults fill free slots first
- Refund policy preview before cancellation

### Reviews
- Verified-stay enforcement — cross-service booking validation before review submission
- Star ratings with average summary per hotel

---

## Quick Start

### Backend
See [backend/README.md](backend/README.md) for full setup instructions.

### Frontend
See [frontend/README.md](frontend/README.md) for full setup instructions.

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@cozyhavenstay.com | CozyHaven@Admin123 |
| Hotel Owner | rajesh.owner@cozyhaven.com | CozyOwner@123 |
| Guest | ananya@gmail.com | CozyGuest@123 |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Backend | .NET 8, ASP.NET Core Web API |
| Frontend | React 18, Vite |
| Database | SQL Server (EF Core 8 Code-First) |
| Gateway | Ocelot 24.1.0 |
| Authentication | JWT Bearer |
| Email | Gmail SMTP (System.Net.Mail) |
| Testing | NUnit 4.x, Moq — 70 tests passing |
| API Docs | Swagger / OpenAPI |

---

## Author

**Yuvashree R**  
Hexaware Full Stack Developer Training — .NET + React Batch  
GitHub: [@Yuvashree815](https://github.com/Yuvashree815)