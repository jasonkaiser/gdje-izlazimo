<div align="center">

<img src="spm/images/venue-landing-page.png" alt="gdje-izlazimo.ba" width="100%" style="border-radius: 12px;" />

<br />
<br />

# gdje-izlazimo.ba

**The go-to platform for venue discovery and table reservations in Bosnia & Herzegovina.**

Ditch the Instagram DMs and phone calls — discover venues, check availability, and book your spot in seconds.

<br />

[![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Keycloak](https://img.shields.io/badge/Keycloak-4D4D4D?style=for-the-badge&logo=keycloak&logoColor=white)](https://www.keycloak.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

<br />

---

### 🚀 Live since May 7, 2025

| 📊 Metric | 📈 Result |
|:---|:---|
| Registered Users | **200+** |
| Unique Visitors (post-launch) | **2,500+** |
| Peak Daily Active Users | **250–300** (weekends) |
| Avg. Weekday Daily Users | **100–200** |
| Analytics | Google Analytics (verified) |

*Real traffic. Real users. No artificial inflation.*

---

</div>

## 📖 Overview

**gdje-izlazimo.ba** *(lit. "where are we going out")* is a production-grade, full-stack web platform built for young, socially active people in Bosnia & Herzegovina. It solves a real problem — venue discovery and reservation management was fragmented across Instagram DMs, phone calls, and word of mouth. This platform consolidates everything into a single, seamless experience.

> Built end-to-end as a solo project using Scrum methodology, sprint planning, and iterative delivery — from product conception to production deployment.

---

## ✨ Features

### 🔐 Authentication & Authorization
Secure, role-based access powered by **Keycloak** with JWT tokens. Three distinct roles keep the platform structured:

| Role | Description |
|------|-------------|
| **User** | Browse, reserve, review, favourite |
| **Venue Owner** | Dashboard, reservation management, events |
| **Admin** | Platform-wide control and moderation |

### 🏛️ Venue Discovery
Browse a curated list of venues with rich detail pages — images, descriptions, opening hours, table types, and pricing. Filter by category, search by name, and explore an **interactive map** with live venue pins across the city.

### 🗺️ Interactive Venue Map
A full modern map view with pinned locations for every registered venue. Tap any pin to preview the venue and jump straight to its detail page.

### 🔍 Search & Filtering
Real-time search by venue name and category-based filtering — all paginated for smooth browsing at scale.

### 📅 Reservation System
A complete, production-hardened reservation flow:

```
PENDING → ACCEPTED / REJECTED / CANCELLED
```

- Choose date, time, table type, and party size
- One active reservation per user per venue per day (conflict prevention)
- Cancellation allowed up to **2 hours before** the booking
- Venues must provide a reason when rejecting — no ghosting

### ❤️ Favourites
Save your go-to spots and build a personal list of favourite venues for instant access.

### 🎟️ Events System
Venues can publish upcoming events — themed nights, live music, DJ sets — so users always know what's happening nearby.

### ⭐ Ratings & Reviews
Post-visit reviews give future users social proof and give venue owners actionable feedback.

### 📊 Venue Owner Dashboard
A clean, purpose-built management interface:
- Accept or reject reservations with mandatory reasoning
- Daily reservation overview at a glance
- Monitor ratings, reviews, and event performance
- Manage table types, quantities, and images
- Configure operating hours and days

### 🛡️ Admin Panel
Platform-level control: venue approval, user management, activity monitoring, and quality enforcement.

### 📧 Email Notifications
Automated transactional emails keep all parties informed:
- Reservation received confirmation
- Reservation accepted or rejected (with reason)
- Cancellation notification

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                 Angular Frontend                │
│              Tailwind CSS · SPA                 │
└────────────────────┬────────────────────────────┘
                     │ REST API (JWT-secured)
┌────────────────────▼────────────────────────────┐
│              Spring Boot Backend                │
│            JPA / Hibernate · REST               │
└──────┬──────────────────────────┬───────────────┘
       │                          │
┌──────▼──────┐          ┌────────▼────────┐
│  PostgreSQL │          │    Keycloak     │
│  Database   │          │  Auth Server    │
└─────────────┘          └─────────────────┘
```

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Angular + Tailwind CSS | SPA, responsive UI |
| **Backend** | Spring Boot + REST | Business logic, API |
| **ORM** | JPA / Hibernate | Data persistence |
| **Auth** | Keycloak (JWT) | Role-based security |
| **Database** | PostgreSQL | Relational data store |
| **Email** | SMTP integration | Transactional notifications |

---

## 📐 Design Decisions

**Why Keycloak over custom auth?**  
Keycloak provides enterprise-grade identity management out of the box — token refresh, session management, role claims, and future SSO/OAuth2 extensibility without reinventing the wheel.

**Why a reservation conflict rule?**  
One reservation per user per venue per day prevents abuse, ensures fair table access, and keeps the system trustworthy for venue owners.

**Why mandatory rejection reasons?**  
Venue owners ghosting on reservation requests was a common pain point. A required reason field ensures transparency and builds user trust.

---

## 🎯 Success Metrics — Post-Launch (since May 7, 2025)

| Metric | Target | Achieved |
|--------|--------|----------|
| Registered users | 80+ | ✅ **200+** |
| Unique visitors | 500 | ✅ **2,500+** |
| Peak daily users | 50 | ✅ **200–300** |


---

## 🚀 Roadmap

- [ ] Featured venue listings & promotional placements
- [ ] QR-based check-in system
- [ ] Advanced venue analytics dashboard
- [ ] Push notifications (web + mobile)
- [ ] Mobile app (iOS & Android)
- [ ] Venue response to reviews

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular, Tailwind CSS |
| Backend | Spring Boot, REST API |
| ORM | JPA / Hibernate |
| Auth | Keycloak (JWT, role-based) |
| Database | PostgreSQL |
| Notifications | SMTP email |
| Analytics | Google Analytics |
| Methodology | Scrum · Solo Development |

---

