# gdje-izlazimo.ba — MVP

A web application that helps users discover venues (clubs, bars, restaurants) and make table reservations without relying on Instagram messages or phone calls.

This project represents a real-world MVP, built to validate the core reservation workflow for both users and venues.

![Landing Page](spm/images/venue-landing-page.png)
---

## 🎯 Vision

Young people often struggle to discover venues and make reservations due to fragmented communication channels.  
**gdje-izlazimo.ba** centralizes venue discovery, reservations, and basic management into one simple platform.

---

## 👥 Target Users

- Young adults and students (ages 16–30)
- Urban, socially active, tech-savvy users
- Venue owners who need a simple reservation system

---

## 🧱 MVP Scope

The MVP focuses on validating the core reservation flow with real users and venues.

**Key goals:**
- Clear reservation rules
- Manual approval by venues
- Transparent reservation status
- Minimal automation to reduce complexity

---

## 👤 User Roles (MVP)

- **USER**
  - Browse venues
  - Create and track reservations
- **VENUE OWNER**
  - Accept or reject reservations manually
  - View basic reservation statistics
- **ADMIN**
  - Manage venues
  - Monitor platform activity

---

## ✅ Core MVP Features

### Authentication
- Email-based registration and login
- Mandatory authentication for reservations
- Role-based access control (JWT)

### Venue Discovery
- Paginated venue list
- Search by venue name
- Category filtering
- Venue detail page with:
  - Images
  - Description
  - Opening hours
  - Table types with pricing and capacity

### Reservation System
- Reservation request with:
  - Date and time (within opening hours)
  - Table type
  - Number of people
- Reservation status flow:
  - **PENDING → ACCEPTED / REJECTED / CANCELLED**
- Business rules:
  - One reservation per user per venue per day
  - Cancellation allowed up to 2 hours before reservation time

### Dashboards
- **User Dashboard**
  - View and cancel reservations
  - Clear status indicators
- **Venue Owner Dashboard**
  - Manage incoming reservations
  - Mandatory rejection reasons
  - Basic daily overview

### Notifications
- Email notifications for:
  - New reservations
  - Reservation accepted or rejected
  - Reservation cancelled

---

## 🏗 Tech Stack

**Frontend**
- Angular
- Tailwind CSS

**Backend**
- Spring Boot
- REST API
- JPA / Hibernate

**Authentication**
- Keycloak (JWT-based)

**Database**
- PostgreSQL

---

## 📌 Project Context

- **Development Methodology:** Scrum  
- **Work Mode:** Solo development  
- **Delivery:** Planned and executed in sprint-based iterations  

---

## 🧠 Architecture Overview

The application follows a client–server architecture.  
Angular handles the frontend UI and communicates with a secured Spring Boot REST API.  
Authentication and authorization are handled via Keycloak using JWT tokens.

---

## 📊 MVP Success Metrics

The MVP is considered successful if it achieves:
- 50+ active users
- 10+ registered venues
- 100+ processed reservations

---

## 🚫 Out of Scope (MVP)

The following features were intentionally excluded to reduce complexity:

- Payments and monetization
- Ratings and reviews
- Favorites system
- Push notifications
- QR code check-in
- Advanced analytics
- Mobile application
- Automatic reservation expiry
- Location-based recommendations

---

## 🚀 Post-MVP / Planned Features

- Online payments
- Venue promotions and featured listings
- Ratings and reviews
- Favorites system
- Real-time availability
- Push notifications
- QR-based check-in
- Advanced analytics for venues
- Mobile application (iOS / Android)

---

## 👨‍💻 Author

**Alexander Jason Kaiser**  
Software Developer & UI Designer  

Built as a solo project using Scrum methodology, sprint planning, and iterative delivery.
