# G-RENT — Smart Car Rental Platform

A full-stack car rental platform with real-time GPS tracking, QR-based rental flow, admin dashboard with live map, dynamic pricing engine, and WebSocket real-time updates.

## Architecture

```
/g-rent
  /apps
    /web           Next.js 14 frontend (App Router, TailwindCSS, Mapbox GL, React Query, Zustand)
    /api           NestJS backend (TypeORM, PostgreSQL, Socket.IO, JWT auth)
    /gps-server    Node.js TCP server (Teltonika Codec8 protocol)
  /packages
    /types         Shared TypeScript types
    /utils         Shared utilities (pricing engine, validation)
```

## Tech Stack

| Layer     | Technology                                  |
|-----------|---------------------------------------------|
| Frontend  | Next.js 14, TypeScript, TailwindCSS, Mapbox GL, React Query, Zustand |
| Backend   | NestJS, TypeORM, PostgreSQL + PostGIS, Socket.IO |
| GPS       | Node.js TCP server, Teltonika Codec8 protocol |
| Auth      | JWT (Passport.js)                            |
| Realtime  | Socket.IO WebSocket                         |

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ with PostGIS extension
- npm 10+

## Quick Start

### 1. Clone and Install

```bash
git clone <repo-url>
cd g-rent
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your values:
# - DATABASE_URL: your PostgreSQL connection string
# - NEXT_PUBLIC_MAPBOX_TOKEN: get a free token from https://mapbox.com
```

### 3. Database Setup

```bash
# Create database
createdb grent

# The API uses TypeORM with synchronize=true in development,
# so tables are created automatically on first run.
```

### 4. Build Shared Packages

```bash
cd packages/types && npm run build && cd ../..
cd packages/utils && npm run build && cd ../..
```

### 5. Start Services

```bash
# Terminal 1 - API
cd apps/api && npm run start:dev

# Terminal 2 - Frontend
cd apps/web && npm run dev

# Terminal 3 - GPS Server
cd apps/gps-server && npm run dev
```

### 6. Seed Demo Data

```bash
curl -X POST http://localhost:4000/vehicles/seed
curl -X POST http://localhost:4000/gps/seed-devices
```

### 7. Simulate GPS Data

```bash
cd apps/gps-server && npm run simulate
# or for TCP mode:
cd apps/gps-server && npm run simulate -- tcp
```

## API Endpoints

| Method | Endpoint          | Description                |
|--------|-------------------|----------------------------|
| GET    | /vehicles         | List all vehicles          |
| GET    | /vehicles/:id     | Get vehicle by ID          |
| POST   | /vehicles/seed    | Seed demo vehicles         |
| POST   | /rentals          | Create a rental            |
| GET    | /rentals          | List all rentals           |
| GET    | /rentals/price    | Calculate rental price     |
| POST   | /gps/ingest       | Ingest GPS position data   |
| POST   | /gps/seed-devices | Seed GPS devices           |
| POST   | /auth/login       | Admin login (demo)         |

## Pricing Engine

| Duration     | Price/Day |
|-------------|-----------|
| 1 day       | €50       |
| 2–3 days    | €45       |
| 4–7 days    | €40       |
| 8–30 days   | €30       |
| 31+ days    | €25       |

Prices are calculated server-side and cannot be tampered with by the client.

## GPS Protocol

The GPS TCP server (port 5000) implements the Teltonika Codec8 binary protocol:

1. Device connects via TCP
2. Sends IMEI (2-byte length prefix + ASCII IMEI)
3. Server validates IMEI and responds with accept (0x01) or reject (0x00)
4. Device sends Codec8 AVL data packets
5. Server parses positions, sends ACK with record count
6. Positions are forwarded to the API and broadcast via WebSocket

## WebSocket Events

| Event          | Payload        | Description              |
|----------------|---------------|--------------------------|
| position       | GPSPosition   | New GPS position update  |
| vehicleUpdate  | Vehicle       | Vehicle state change     |

## Testing

```bash
# Unit tests (pricing engine)
cd packages/utils && npm test

# GPS Codec8 parser tests
cd apps/gps-server && npm test

# API tests
cd apps/api && npm test

# GPS simulation
cd apps/gps-server && npm run simulate
```

## Deployment

### Frontend → Vercel
```bash
cd apps/web
npx vercel
```

### Backend → Railway
Use the `apps/api/Dockerfile` to deploy to Railway.

### GPS Server → Railway
Use the `apps/gps-server/Dockerfile` to deploy to Railway.
Expose TCP port 5000.

### Database → Supabase
Create a PostgreSQL database on Supabase and use the connection string.

## Demo Credentials

- **Admin Login**: admin@grent.com / admin123

## Security

- All inputs validated with class-validator
- IMEI whitelist for GPS devices
- Server-side price calculation (no client tampering)
- Rate limiting on GPS endpoint (60 req/min)
- JWT authentication for admin routes
- CORS configured for frontend origin only
