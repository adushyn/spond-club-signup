# Spond Club — Membership Signup

A full-stack membership registration form built as a coding task for Spond.
Users pick a membership type, fill in personal details, preview, and submit —
all protected by CAPTCHA and honeypot bot detection. After registering, users
can view, edit, or delete their registration via a personal profile link.

| Layer          | Technology                        | Hosting  |
|----------------|-----------------------------------|----------|
| Frontend       | React 18 + Vite + React Router v7 | Vercel   |
| Backend        | Java 17 + Spring Boot 3.3         | Render   |
| Database       | PostgreSQL + Flyway migrations    | Supabase |
| Bot protection | Cloudflare Turnstile + honeypot   | —        |

---

## How it works

### Request flow

```
Browser (React)
    │
    │  1. GET /api/form                     ← fetch form definition on page load
    │  2. POST /api/registrations           ← submit registration on final step
    │  3. GET /api/registrations/:id        ← load registration on profile page
    │  4. PUT /api/registrations/:id        ← save edits on profile page
    │  5. DELETE /api/registrations/:id     ← remove registration on profile page
    │
    ▼
Spring Boot (Java)
    │
    ├── Honeypot check           ← reject if hidden "website" field is filled
    ├── formId validation        ← must match the known form UUID
    ├── memberTypeId validation  ← must be one of the allowed member types
    ├── Turnstile CAPTCHA verify ← POST to Cloudflare to verify the token
    │        │
    │        ▼
    │   Cloudflare API
    │   POST https://challenges.cloudflare.com/turnstile/v0/siteverify
    │
    ├── Bean Validation          ← @NotBlank, @Email, @Past, @Pattern, @Size
    │
    └── JPA save to PostgreSQL   ← Supabase (via connection pooler)
```

### Frontend wizard (3 steps)

```
Step 1 — Member type
  └── User selects: Active Member / Social Member (card-style radio buttons)
        ↓
Step 2 — Personal info
  └── First name, last name, email, phone (with country code selector), date of birth
  └── Hidden honeypot field (invisible to real users, traps bots)
        ↓
Step 3 — Preview + submit
  └── Read-only summary of all entered data
  └── Cloudflare Turnstile widget renders here (invisible CAPTCHA)
  └── On "Submit" → Turnstile executes → returns token → POST /api/registrations
        ↓
Success banner
  └── "Welcome, [name]!" confirmation
  └── "Manage registration →" button navigates to /profile/:id
```

### Profile page (`/profile/:id`)

After a successful registration the user receives a direct link to their profile
page. The UUID acts as a capability token — no login needed.

```
/profile/:id
  └── View — shows all registration details
  └── Edit — member type cards + all personal fields; save calls PUT /api/registrations/:id
  └── Delete — modal "Are you sure?" dialog; confirm calls DELETE /api/registrations/:id
```

### Registration opens date

On page load, the frontend fetches `GET /api/form` which returns a
`registrationOpens` timestamp. If the current date is **before** that timestamp,
a banner is shown instead of the form.

---

## Project structure

```
spond-club-signup/
│
├── backend/                                       # Spring Boot API
│   ├── pom.xml                                    # Maven build — Java 17, Spring Boot 3.3
│   └── src/main/
│       ├── java/com/spond/club/
│       │   ├── SpondClubApplication.java           # Entry point (@SpringBootApplication)
│       │   ├── config/
│       │   │   ├── AppConfig.java                  # RestTemplate Spring bean
│       │   │   └── CorsConfig.java                 # Allowed origins + methods (GET/POST/PUT/DELETE)
│       │   ├── controller/
│       │   │   ├── HealthController.java            # GET /health → { "status": "ok" }
│       │   │   ├── FormController.java              # GET /api/form → form definition
│       │   │   └── RegistrationController.java      # POST/GET/PUT/DELETE /api/registrations
│       │   ├── model/
│       │   │   ├── FormData.java                    # Static form data + MemberType record
│       │   │   ├── Registration.java                # JPA entity (@Entity, UUID PK)
│       │   │   ├── RegistrationRequest.java         # POST DTO with Bean Validation
│       │   │   └── RegistrationUpdateRequest.java   # PUT DTO with Bean Validation
│       │   ├── repository/
│       │   │   └── RegistrationRepository.java      # JpaRepository
│       │   └── service/
│       │       ├── FormService.java                 # Static form/member-type data
│       │       ├── RegistrationService.java         # Business logic: register/find/update/delete
│       │       └── TurnstileService.java            # Verifies CAPTCHA token with Cloudflare
│       └── resources/
│           ├── application.properties               # Main config (reads env vars)
│           ├── application-local.properties         # Local dev overrides (gitignored)
│           └── db/migration/
│               └── V1__init.sql                     # Flyway: creates registrations table
│
├── src/                                           # React frontend
│   ├── App.jsx                                    # Layout shell + Routes + form data fetch
│   ├── main.jsx                                   # ReactDOM entry — wraps in BrowserRouter
│   ├── index.css                                  # All styles (plain CSS, no UI library)
│   ├── hooks/
│   │   ├── useForm.js                             # Form state: values, errors, handlers
│   │   └── useLanguage.js                         # Language selector + translations hook
│   ├── i18n/
│   │   └── translations.js                        # EN + NO strings, detectLanguage()
│   ├── pages/
│   │   ├── SignupPage.jsx                          # 3-step wizard (step state + submit logic)
│   │   ├── ManagePage.jsx                         # /profile/:id shell — waits for form data
│   │   └── NotFoundPage.jsx                       # 404 page for unknown routes
│   └── components/
│       ├── Header.jsx                             # Sticky Spond logo header + language selector
│       ├── Footer.jsx                             # Slim Spond logo footer
│       ├── StepIndicator.jsx                      # Step 1 / 2 / 3 progress bar
│       ├── Step1MemberType.jsx                    # Radio cards for member type selection
│       ├── Step2PersonalInfo.jsx                  # Personal info fields + honeypot
│       ├── Step3Preview.jsx                       # Read-only preview + Turnstile + submit
│       ├── PhoneInput.jsx                         # Country code dropdown + local number input
│       ├── ManageRegistration.jsx                 # View / edit / delete registration UI
│       ├── FutureDateBanner.jsx                   # "Registration opens on…" banner
│       ├── LanguageSelector.jsx                   # EN / NO switcher in the header
│       └── SuccessBanner.jsx                      # "Welcome, [name]!" + manage link
│
├── index.html                                     # Vite HTML shell (Space Grotesk font)
├── Dockerfile                                     # Frontend: node build → nginx:alpine
├── nginx.conf                                     # nginx: SPA rewrite + /api proxy to backend
├── docker-compose.yml                             # One-command local stack: Postgres + backend + frontend
├── Makefile                                       # make start / stop / test / clean
├── vercel.json                                    # SPA rewrite: all paths → index.html
├── vite.config.js                                 # Dev server on :3000, /api proxy → :8080
├── render.yaml                                    # Render deployment config (Java)
├── package.json
└── .gitignore                                     # Excludes .env.local, application-local.properties, target/
```

---

## Bot protection

Two layers work together to reject bots before any DB write happens.

### 1. Honeypot field

A hidden `website` input is present in the form but invisible to real users
(hidden with CSS). Bots that auto-fill all fields will fill it; the backend
rejects any request where it is non-empty.

```java
// RegistrationService.java
if (req.getWebsite() != null && !req.getWebsite().isBlank()) {
    throw new SecurityException("bot detected");
}
```

### 2. Cloudflare Turnstile (invisible CAPTCHA)

Turnstile renders an invisible widget on Step 3. When the user clicks Submit,
`turnstile.execute()` runs a challenge in the background and returns a short-lived
token. The frontend sends this token in the POST body; the backend verifies it
with Cloudflare before saving anything.

**Local dev uses Cloudflare test keys** — always pass without any real challenge:
```
VITE_CF_TURNSTILE_SITE_KEY=1x00000000000000000000AA    # always passes
CF_TURNSTILE_SECRET=1x0000000000000000000000000000000AA
```

---

## API reference

### `GET /health`
Returns `200 OK` with `{ "status": "ok" }` (JSON). Used by Render for uptime checks.

### `GET /api/form`
Returns the form definition. Cached 60 s.

```json
{
  "clubId": "britsport",
  "formId": "B171388180BC457D9887AD92B6CCFC86",
  "title": "Coding camp summer 2025",
  "registrationOpens": "2024-12-16T00:00:00Z",
  "memberTypes": [
    {
      "id": "8FE4113D4E4020E0DCF887803A886981",
      "name": "Active Member",
      "description": "Full participation rights — compete in matches, train with the squad, and vote at club meetings."
    },
    {
      "id": "4237C55C5CC3B4B082CBF2540612778E",
      "name": "Social Member",
      "description": "Support the club without competing — attend events, cheer on the team, and join club socials."
    }
  ]
}
```

### `POST /api/registrations`

**Request body:**
```json
{
  "formId":              "B171388180BC457D9887AD92B6CCFC86",
  "memberTypeId":        "8FE4113D4E4020E0DCF887803A886981",
  "firstName":           "Jane",
  "lastName":            "Doe",
  "email":               "jane@example.com",
  "phone":               "+47 123 45 678",
  "birthDate":           "1995-06-15",
  "cfTurnstileResponse": "<token>"
}
```

**Responses:**

| Status | Meaning                                           |
|--------|---------------------------------------------------|
| `201`  | Saved — returns `{ id, message }`                 |
| `403`  | Honeypot filled or CAPTCHA failed                 |
| `409`  | Email already registered for this form            |
| `422`  | Validation error — returns `{ error, fields }`    |

The returned `id` (UUID) is the profile link: `/profile/:id`.

### `GET /api/registrations/:id`

Returns the registration matching the UUID.

| Status | Meaning              |
|--------|----------------------|
| `200`  | Registration found   |
| `404`  | Not found            |

### `PUT /api/registrations/:id`

Updates an existing registration.

**Request body:** same shape as POST minus `formId`, `website`, `cfTurnstileResponse`.

| Status | Meaning                                           |
|--------|---------------------------------------------------|
| `200`  | Updated — returns full registration object        |
| `404`  | Not found                                         |
| `409`  | New email conflicts with another registration     |
| `422`  | Validation error                                  |

### `DELETE /api/registrations/:id`

Permanently removes a registration.

| Status | Meaning              |
|--------|----------------------|
| `204`  | Deleted              |
| `404`  | Not found            |

---

## Database schema

Managed by **Flyway** — runs automatically on application startup.

```sql
-- V1__init.sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE registrations (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id          VARCHAR(255) NOT NULL,
    member_type_id   VARCHAR(255) NOT NULL,
    member_type_name VARCHAR(255) NOT NULL,
    first_name       VARCHAR(100) NOT NULL,
    last_name        VARCHAR(100) NOT NULL,
    email            VARCHAR(255) NOT NULL,
    phone            VARCHAR(50)  NOT NULL,
    birth_date       DATE         NOT NULL,
    submitted_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_email_form UNIQUE (email, form_id)
);
```

The `UNIQUE (email, form_id)` constraint means one person can only register once
per form, but can register for different forms with the same email.

---

## Quick start (local)

### Option A — Docker (recommended, no accounts needed)

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
git clone https://github.com/adushyn/spond-club-signup.git
cd spond-club-signup
docker compose up --build
```

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:3000        |
| Backend  | http://localhost:8080        |
| Database | localhost:5432 (user: spond) |

Data persists between restarts in a named Docker volume. To wipe it:
```bash
docker compose down -v
```

---

### Option B — Manual (uses Supabase for the DB)

**Prerequisites:** [Node.js](https://nodejs.org) ≥ 18 · [Java 17](https://adoptium.net) · [Supabase](https://supabase.com) free account

#### 1. Clone & install

```bash
git clone https://github.com/adushyn/spond-club-signup.git
cd spond-club-signup
npm install
```

#### 2. Configure environment

`.env.local` (frontend, not committed):
```
VITE_API_BASE_URL=http://localhost:8080
VITE_CF_TURNSTILE_SITE_KEY=1x00000000000000000000AA
```

`backend/src/main/resources/application-local.properties` (not committed):
```properties
DB_HOST=aws-0-eu-west-1.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.<your-project-ref>
DB_PASSWORD=<your-supabase-password>
spring.jpa.show-sql=true
```

> **Note:** Supabase free tier blocks port 5432. Use the **connection pooler** on port **6543**.

#### 3. Start the backend

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
# API available at http://localhost:8080
```

#### 4. Start the frontend

```bash
# From project root (new terminal)
npm run dev
# Opens http://localhost:3000
```

---

## Deploy

### Supabase (database)

1. Create project at [supabase.com](https://supabase.com/dashboard)
2. Find connection pooler details: **Settings → Database → Connection pooling**
3. No manual SQL — Flyway runs migrations on backend startup

### Cloudflare Turnstile (CAPTCHA)

1. [dash.cloudflare.com](https://dash.cloudflare.com) → Turnstile → **Add site**
2. Widget type: **Invisible**
3. Copy **Site Key** (public) and **Secret Key** (private)

### Render (Java backend)

1. New → **Web Service** → connect GitHub repo
2. **Root Directory:** `backend`
3. **Build command:** `mvn package -DskipTests`
4. **Start command:** `java -jar target/spond-club-signup-0.0.1-SNAPSHOT.jar`
5. Environment variables:

| Variable              | Value                                 |
|-----------------------|---------------------------------------|
| `DB_HOST`             | `aws-0-eu-west-1.pooler.supabase.com` |
| `DB_PORT`             | `6543`                                |
| `DB_NAME`             | `postgres`                            |
| `DB_USER`             | `postgres.<your-project-ref>`         |
| `DB_PASSWORD`         | your Supabase password                |
| `CF_TURNSTILE_SECRET` | Cloudflare secret key                 |
| `ALLOWED_ORIGINS`     | your Vercel frontend URL              |

### Vercel (React frontend)

1. [vercel.com/new](https://vercel.com/new) → Import Git Repository
2. Framework: **Vite** (auto-detected)
3. Environment variables:

| Variable                     | Value                     |
|------------------------------|---------------------------|
| `VITE_API_BASE_URL`          | your Render backend URL   |
| `VITE_CF_TURNSTILE_SITE_KEY` | Cloudflare site key       |

`vercel.json` contains a catch-all SPA rewrite so direct links like
`/profile/:id` work correctly on Vercel.

---

## Tech stack rationale

| Choice | Why |
|--------|-----|
| **Java 17 + Spring Boot 3.3** | Strong typing, mature REST + validation + JPA ecosystem |
| **Bean Validation** | Declarative `@NotBlank`, `@Email`, `@Past` annotations on DTOs |
| **Flyway** | Schema migrations versioned in code, run automatically on startup |
| **React + Vite** | Fast HMR, minimal config, straightforward component model |
| **React Router v7** | Client-side routing for wizard + `/profile/:id` page |
| **Space Grotesk** | Open-source geometric font served by Google Fonts — no CORS issues |
| **Plain CSS** | Minimises third-party libraries; custom properties cover theming |
| **Supabase** | Managed PostgreSQL with generous free tier and connection pooler |
| **Render** | Detects `pom.xml` automatically, free tier supports Java |
| **Cloudflare Turnstile** | Free invisible CAPTCHA, GDPR-safe, test keys for local dev |

---

## Suggested improvements

- **Email double opt-in** — send a confirmation link before activating the registration
- **Rate limiting** — `bucket4j` for per-IP request limits on `POST /api/registrations`
- **Admin view** — protected page to list and export registrations as CSV
- **Integration tests** — `@SpringBootTest` + Testcontainers for a real PostgreSQL instance
- **OpenAPI docs** — `springdoc-openapi` generates a Swagger UI automatically
- **E2E tests** — Playwright full wizard flow + profile edit/delete
