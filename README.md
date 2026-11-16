# CarePoint — Clinic Appointment Booking System
<img width="1905" height="2556" alt="carepoint-booking-api vercel app_" src="https://github.com/user-attachments/assets/92ec6eb8-935b-43b4-8e59-ba70ac4d4119" />

CarePoint is a full-stack clinic appointment booking application that allows patients to browse available appointment slots, book appointments, retrieve their booking history and cancel existing appointments.

The project was developed as part of the Koya Academy AI Automation Developer Cohort 4 technical assessment.

**Live Application:** https://carepoint-booking-api.vercel.app/

**API Base URL:** https://carepoint-booking-api.vercel.app

**GitHub Repository:** https://github.com/Meetkamal256/carepoint-booking-api

---

## Features

### Patient-facing application

- **Browse appointments:** View available appointment slots and filter them by healthcare provider.
- **Book appointments:** Select an available slot and submit patient details.
- **Booking confirmation:** Receive confirmation and booking information after a successful reservation.
- **Appointment history:** Retrieve existing bookings using a patient's email address.
- **Load More pagination:** Retrieve appointment history in smaller batches using cursor-based pagination.
- **Appointment cancellation:** Cancel confirmed appointments through a confirmation dialog.
- **Availability management:** Cancelled appointments automatically become available for other patients.

### Backend API

The backend implements the five levels of the assessment requirements.

| Level | Capabilities |
|---|---|
| Level 1 | Retrieve available slots, create bookings and retrieve individual bookings |
| Level 2 | API key authentication and booking input validation |
| Level 3 | Protection against duplicate bookings, concurrency-safe booking creation and cancellation |
| Level 4 | Idempotent booking requests and cursor-based booking history pagination |
| Level 5 | Rate limiting of booking attempts |

Additional backend capabilities include:

- Consistent JSON error responses.
- Email normalization and validation.
- Exact provider filtering.
- Appointment availability tracking.
- Database-backed booking persistence.

---

## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js | Full-stack application framework |
| React | Frontend user interface |
| TypeScript | Type safety and application development |
| Tailwind CSS | Utility-based styling |
| CSS | Additional interface styling |
| Neon PostgreSQL | Persistent relational database |
| `@neondatabase/serverless` | PostgreSQL database connectivity |
| Vercel | Application hosting and deployment |
| Postman | API testing |

---

## Application Architecture

CarePoint uses Next.js for both the frontend and backend, with Neon PostgreSQL providing persistent data storage.

The frontend communicates with the backend through server-side proxy routes. The proxy attaches the API key stored in environment variables before forwarding requests to the backend API.

This keeps the API key out of browser-side code.

### Request flow

1. A patient interacts with the frontend.
2. Frontend API functions send requests through the application's proxy routes.
3. The server-side proxy forwards requests with the required API key.
4. Backend API routes authenticate and validate requests.
5. The backend performs the required database operations.
6. The API returns a JSON response to the frontend.

### Architecture components

- **Frontend:** Patient-facing pages and reusable React components.
- **Proxy layer:** Forwards frontend requests and securely handles API key injection.
- **Backend:** Handles authentication, validation, booking operations and business logic.
- **Database:** Stores appointment slots and booking records.

---

## Project Structure

```text
clinic-booking-api/
│
├── app/
│   ├── api/
│   │   ├── bookings/
│   │   │   ├── [id]/
│   │   │   └── route.ts
│   │   └── slots/
│   │       └── route.ts
│   │
│   ├── appointments/
│   │   └── page.tsx
│   │
│   ├── book/
│   │   └── page.tsx
│   │
│   ├── bookings/
│   │   ├── [id]/
│   │   │   └── route.ts
│   │   └── route.ts
│   │
│   ├── reset/
│   │   └── route.ts
│   │
│   ├── slots/
│   │   └── route.ts
│   │
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/
│   ├── appointments/
│   ├── booking/
│   ├── home/
│   ├── Logo.tsx
│   └── Navbar.tsx
│
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   ├── backend-proxy.ts
│   └── db.ts
│
├── types/
│   └── booking.ts
│
├── public/
├── data/
├── README.md
├── package.json
├── tsconfig.json
└── next.config.ts
```

### Important directories

- `app/`: Contains application pages and backend API routes.
- `app/api/`: Contains server-side proxy routes used by the frontend.
- `components/`: Contains reusable homepage, booking and appointment components.
- `lib/`: Contains shared application logic, including database connectivity, authentication and API communication.
- `types/`: Contains TypeScript definitions for booking and appointment data.
- `public/`: Contains static assets.

---

## API Documentation

All API requests require the following header:

```http
X-API-Key: YOUR_API_KEY
```

The API returns JSON responses, including error responses in the following format:

```json
{
  "error": "Error message"
}
```

### 1. Retrieve appointment slots

**Endpoint:** `GET /slots`

Returns appointment slots ordered by their start time.

Optional query parameter:

| Parameter | Description |
|---|---|
| `provider` | Filters slots by exact provider name |

Example:

```http
GET /slots?provider=Jamila%20Muhammad
```

Example response:

```json
{
  "slots": [
    {
      "id": "slot-001",
      "provider": "Jamila Muhammad",
      "start": "2026-12-10T09:00:00.000Z",
      "end": "2026-12-10T09:30:00.000Z",
      "available": true
    }
  ]
}
```

### 2. Create a booking

**Endpoint:** `POST /bookings`

Creates a new appointment booking.

Request body:

```json
{
  "slot_id": "slot-001",
  "name": "Ada Obi",
  "email": "ada@example.com"
}
```

Optional header:

```http
Idempotency-Key: unique-request-key
```

Successful response: `201 Created`

The API validates the booking details, checks slot availability and prevents duplicate confirmed bookings.

### 3. Retrieve an individual booking

**Endpoint:** `GET /bookings/{id}`

Retrieves an existing booking using its booking ID.

### 4. Cancel a booking

**Endpoint:** `DELETE /bookings/{id}`

Cancels an existing confirmed booking.

A successfully cancelled booking releases its appointment slot.

### 5. Retrieve patient booking history

**Endpoint:** `GET /bookings`

Required query parameter:

| Parameter | Description |
|---|---|
| `email` | Patient's email address |

Optional query parameters:

| Parameter | Description |
|---|---|
| `limit` | Number of bookings to retrieve; defaults to 10 and accepts values from 1 to 50 |
| `cursor` | Cursor used to retrieve the next page |

Example:

```http
GET /bookings?email=ada@example.com&limit=10
```

Example response:

```json
{
  "bookings": [],
  "next_cursor": null
}
```

The endpoint uses cursor-based pagination to retrieve booking history in batches.

### 6. Reset appointment slots

**Endpoint:** `POST /reset`

Replaces the existing appointment slots and deletes existing bookings.

Example request:

```json
{
  "slots": [
    {
      "id": "slot-001",
      "provider": "Dr Ade",
      "start": "2026-12-10T09:00:00Z",
      "end": "2026-12-10T09:30:00Z"
    }
  ]
}
```

**Important:** This is a destructive administrative/testing endpoint. It deletes existing bookings and replaces the slot records. It should only be used by authorised callers when a reset is intended.

---

## Database

CarePoint uses Neon PostgreSQL for persistent storage.

The database contains the following main tables:

| Table | Purpose |
|---|---|
| `slots` | Stores appointment slots and provider information |
| `bookings` | Stores patient booking details and booking status |
| `idempotency_keys` | Stores idempotency keys and previous request responses |
| `booking_attempts` | Tracks booking attempts for rate limiting |

The database uses relational constraints and indexes to support booking integrity, including protection against multiple confirmed bookings for the same slot.

---

## Security and Reliability

Several measures were implemented to make the booking API more reliable:

- **API key authentication:** Requests must provide a valid API key.
- **Server-side secret management:** API credentials are stored in environment variables and are not exposed to browser-side code.
- **Input validation:** Required fields and email addresses are validated before processing bookings.
- **Concurrency protection:** Database transactions and a unique partial index prevent multiple confirmed bookings for the same slot.
- **Idempotency:** Repeated requests using the same key and request body return the original booking response.
- **Idempotency conflict detection:** Reusing a key with a different request body returns an error.
- **Rate limiting:** Booking attempts are limited to five per email address per minute.
- **Persistent storage:** Booking records are stored in PostgreSQL rather than temporary application memory.

---

## Local Development Setup

### Prerequisites

- Node.js
- npm
- A Neon PostgreSQL database
- An API key

### 1. Clone the repository

```bash
git clone https://github.com/Meetkamal256/carepoint-booking-api.git
```

### 2. Navigate into the project

```bash
cd carepoint-booking-api
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env.local` file in the project root:

```env
DATABASE_URL="YOUR_NEON_DATABASE_CONNECTION_STRING"
API_KEY="YOUR_SECRET_API_KEY"
```

Replace the placeholder values with your actual database connection string and API key.

Never commit `.env.local` or expose your credentials publicly.

### 5. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Other useful commands

```bash
npm run build
```

Builds the application for production.

```bash
npm run start
```

Starts the production server after building.

```bash
npm run lint
```

Runs the project's linting checks.

---

## Deployment

CarePoint is deployed on Vercel, with Neon PostgreSQL providing persistent database storage.

The production environment requires the following environment variables:

- `DATABASE_URL`
- `API_KEY`

The application is configured to use these environment variables during deployment.

**Live application:** https://carepoint-booking-api.vercel.app/

---

## Testing

The API was tested using Postman, while the frontend booking and appointment management workflows were tested through the deployed application.

Testing covered:

- API key authentication.
- Required booking field validation.
- Invalid email handling.
- Nonexistent appointment slots.
- Duplicate booking prevention.
- Successful booking creation.
- Idempotent request handling.
- Idempotency key conflicts.
- Individual booking retrieval.
- Patient booking history.
- Cursor-based pagination.
- Appointment cancellation.
- Slot availability after cancellation.

---

## Future Improvements

Potential improvements for a production clinic environment include:

- Patient accounts and stronger identity verification.
- Role-based access for clinic administrators.
- Provider management and appointment scheduling interfaces.
- Automated booking notifications.
- Additional audit and monitoring capabilities.
- Stronger patient data privacy and access controls.

---

## Author

**Kamaluddeen Muhammad**

Software Developer | Automation Developer | API Integration Specialist

GitHub: https://github.com/Meetkamal256

---