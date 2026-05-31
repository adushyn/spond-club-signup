# Testing Guide — Spond Club Signup

This document describes the test strategy, how to run the suite, and a full inventory of every test case with its current status.

> **Last verified:** 2026-05-31 · Frontend: **131 / 131 ✅** · Backend: **47 / 47 ✅** (requires Java 17)

---

## Test layers

```
┌─────────────────────┬─────────────────────┬────────────────────────────────┐
│  Layer              │  Tool               │  What it tests                 │
├─────────────────────┼─────────────────────┼────────────────────────────────┤
│  Frontend unit      │  Vitest             │  Pure logic (regex, validation)│
│  Frontend component │  Vitest + RTL       │  React component behaviour     │
│  Backend unit       │  JUnit 5 + Mockito  │  Service classes               │
│  Backend slice      │  Spring @WebMvcTest │  HTTP layer / REST API         │
└─────────────────────┴─────────────────────┴────────────────────────────────┘
```

No E2E tests yet — see [Future work](#future-work).

---

## How to run

### All tests at once (quickest)

```bash
make test
```

### Frontend only

```bash
# single run (CI)
npm test

# watch mode (development)
npm run test:watch

# with HTML coverage report → coverage/index.html
npm run test:coverage
```

### Backend only

```bash
cd backend

# all tests
./mvnw test

# single class
./mvnw test -Dtest=RegistrationControllerTest
```

The backend uses an H2 in-memory database for tests — no Postgres or Docker needed.

---

## Frontend test inventory

### `validation.test.js` — `src/validation.js`

Tests the `validateStep2` function and the raw `EMAIL_RE` / `PHONE_RE` regexes.

The `PHONE_RE` requires the format emitted by `PhoneInput`: `+countryCode space localNumber`
(e.g. `+47 123 45 678`). Plain numbers without a country code are rejected.

#### EMAIL_RE

| # | Test description | Status |
|---|-----------------|--------|
| 1 | accepts `user@example.com` | ✅ pass |
| 2 | accepts `user.name+tag@sub.domain.org` | ✅ pass |
| 3 | accepts `a@b.io` | ✅ pass |
| 4 | accepts `USER@EXAMPLE.COM` (case-insensitive) | ✅ pass |
| 5 | rejects empty string | ✅ pass |
| 6 | rejects `plainaddress` (no @) | ✅ pass |
| 7 | rejects `@missing.local` (no local part) | ✅ pass |
| 8 | rejects `missing@` (no domain) | ✅ pass |
| 9 | rejects `missing@domain` (no TLD) | ✅ pass |
| 10 | rejects `two@@domain.com` (double @) | ✅ pass |

#### PHONE_RE

| # | Test description | Status |
|---|-----------------|--------|
| 11 | accepts `+44 7911 123456` | ✅ pass |
| 12 | accepts `+47 123 45 678` | ✅ pass |
| 13 | accepts `+1 5551234567` | ✅ pass |
| 14 | accepts `+46 70-123 45 67` | ✅ pass |
| 15 | accepts `+358 40 123 4567` | ✅ pass |
| 16 | rejects empty string | ✅ pass |
| 17 | rejects `4712345678` (no + prefix) | ✅ pass |
| 18 | rejects `07911123456` (no country code) | ✅ pass |
| 19 | rejects `+4712345678` (no space after code) | ✅ pass |
| 20 | rejects `abc` | ✅ pass |
| 21 | rejects `+` (only prefix) | ✅ pass |

#### validateStep2

| # | Test description | Status |
|---|-----------------|--------|
| 22 | returns empty object for fully valid input | ✅ pass |
| 23 | requires firstName (empty string) | ✅ pass |
| 24 | requires non-blank firstName (whitespace only) | ✅ pass |
| 25 | rejects firstName longer than 100 characters | ✅ pass |
| 26 | accepts firstName exactly 100 characters | ✅ pass |
| 27 | requires lastName (empty string) | ✅ pass |
| 28 | rejects lastName longer than 100 characters | ✅ pass |
| 29 | rejects invalid email | ✅ pass |
| 30 | rejects empty email | ✅ pass |
| 31 | accepts valid email | ✅ pass |
| 32 | rejects invalid phone (`abc`) | ✅ pass |
| 33 | rejects too-short phone (`12345`) | ✅ pass |
| 34 | accepts valid phone | ✅ pass |
| 35 | requires birthDate (empty string) | ✅ pass |
| 36 | rejects future birthDate (next year) | ✅ pass |
| 37 | rejects birthDate set to tomorrow | ✅ pass |
| 38 | rejects birthDate before 1900-01-01 | ✅ pass |
| 39 | accepts valid past birthDate | ✅ pass |
| 40 | returns multiple field errors simultaneously | ✅ pass |
| 41 | uses Norwegian error messages when `t=no` | ✅ pass |

---

### `translations.test.js` — `src/i18n/translations.js`

| # | Test description | Status |
|---|-----------------|--------|
| 42 | has both `en` and `no` locales | ✅ pass |
| 43 | `en` and `no` have identical key sets | ✅ pass |
| 44 | `successTitle` is a function that interpolates name | ✅ pass |
| 45 | `registrationOpensDesc` is a function that interpolates date | ✅ pass |
| 46 | `LANGUAGES` contains `en` and `no` entries | ✅ pass |
| 47 | each `LANGUAGES` entry has `code`, `label`, and `flag` fields | ✅ pass |
| 48 | `detectLanguage` returns `"en"` for `en-US` | ✅ pass |
| 49 | `detectLanguage` returns `"en"` for `en-GB` | ✅ pass |
| 50 | `detectLanguage` returns `"no"` for `nb-NO` (Bokmål) | ✅ pass |
| 51 | `detectLanguage` returns `"no"` for `nb` | ✅ pass |
| 52 | `detectLanguage` returns `"no"` for `nn` (Nynorsk) | ✅ pass |
| 53 | `detectLanguage` falls back to `"en"` for unsupported locale | ✅ pass |
| 54 | `detectLanguage` falls back to `"en"` for unknown locale | ✅ pass |

---

### `useForm.test.js` — `src/hooks/useForm.js`

| # | Test description | Status |
|---|-----------------|--------|
| 55 | initialises with provided values | ✅ pass |
| 56 | `handleChange` updates a field | ✅ pass |
| 57 | `setValue` updates a field | ✅ pass |
| 58 | `setFieldErrors` sets multiple errors at once | ✅ pass |
| 59 | `setValue` clears the error for the changed field | ✅ pass |
| 60 | `handleBlur` records touched state | ✅ pass |
| 61 | `reset` restores initial values and clears errors | ✅ pass |
| 62 | persists values to sessionStorage (honeypot excluded) | ✅ pass |
| 63 | restores values from sessionStorage on mount | ✅ pass |
| 64 | `reset` clears data from sessionStorage | ✅ pass |
| 65 | `usePersistentStep` starts at provided initial step | ✅ pass |
| 66 | `setStep` increments step | ✅ pass |
| 67 | persists step to sessionStorage | ✅ pass |
| 68 | restores step from sessionStorage on mount | ✅ pass |

---

### `Step1MemberType.test.jsx` — `src/components/Step1MemberType.jsx`

| # | Test description | Status |
|---|-----------------|--------|
| 69 | renders the form title | ✅ pass |
| 70 | renders all member type options | ✅ pass |
| 71 | Next button is disabled when no member type selected | ✅ pass |
| 72 | Next button is enabled when a member type is selected | ✅ pass |
| 73 | calls `onChange` when a radio is clicked | ✅ pass |
| 74 | calls `onNext` when Next button is clicked | ✅ pass |
| 75 | shows error message alert when `error` prop is provided | ✅ pass |
| 76 | adds `selected` CSS class to the chosen card | ✅ pass |
| 77 | radio input is `checked` for the selected member type | ✅ pass |

---

### `Step2PersonalInfo.test.jsx` — `src/components/Step2PersonalInfo.jsx`

| # | Test description | Status |
|---|-----------------|--------|
| 78 | renders all form fields | ✅ pass |
| 79 | renders Back and Next buttons | ✅ pass |
| 80 | calls `onNext` when Next is clicked | ✅ pass |
| 81 | calls `onBack` when Back is clicked | ✅ pass |
| 82 | calls `onChange` when a field is edited | ✅ pass |
| 83 | shows firstName error alert when `errors.firstName` is set | ✅ pass |
| 84 | shows email error alert when `errors.email` is set | ✅ pass |
| 85 | marks firstName input as `aria-invalid="true"` on error | ✅ pass |
| 86 | adds `error` CSS class to invalid input | ✅ pass |
| 87 | shows phone hint when there is no phone error | ✅ pass |
| 88 | hides phone hint when there is a phone error | ✅ pass |
| 89 | renders Norwegian labels and buttons when `t=no` | ✅ pass |

---

### `PhoneInput.test.jsx` — `src/components/PhoneInput.jsx`

| # | Test description | Status |
|---|-----------------|--------|
| 90 | renders the label | ✅ pass |
| 91 | renders the local number extracted from the combined value | ✅ pass |
| 92 | shows the phone hint when no error | ✅ pass |
| 93 | hides hint and shows error alert when error prop is set | ✅ pass |
| 94 | calls `onChange` with `+code local` combined value | ✅ pass |
| 95 | marks local input as `aria-invalid` when error is set | ✅ pass |
| 96 | opens the country dropdown when flag button is clicked | ✅ pass |
| 97 | parses a `+44` value and shows the GB flag | ✅ pass |
| 98 | defaults to Norwegian (+47) when value is empty | ✅ pass |

---

### `NotFoundPage.test.jsx` — `src/pages/NotFoundPage.jsx`

| # | Test description | Status |
|---|-----------------|--------|
| 99  | renders the page-not-found heading | ✅ pass |
| 100 | renders the description text | ✅ pass |
| 101 | renders a back-to-registration link pointing to `/` | ✅ pass |
| 102 | renders Norwegian text when `t=no` | ✅ pass |
| 103 | falls back gracefully when `t` prop is undefined | ✅ pass |

---

### `ManageRegistration.test.jsx` — `src/components/ManageRegistration.jsx`

#### Loading & error states

| # | Test description | Status |
|---|-----------------|--------|
| 104 | shows skeleton while fetching | ✅ pass |
| 105 | shows not-found message on 404 | ✅ pass |
| 106 | shows retry button on network error | ✅ pass |
| 107 | does not show retry button when registration is not found | ✅ pass |

#### View mode

| # | Test description | Status |
|---|-----------------|--------|
| 108 | renders the manage page title | ✅ pass |
| 109 | shows the member type name | ✅ pass |
| 110 | shows first and last name | ✅ pass |
| 111 | shows email address | ✅ pass |
| 112 | shows the Edit button | ✅ pass |
| 113 | shows the Delete registration button | ✅ pass |

#### Delete modal

| # | Test description | Status |
|---|-----------------|--------|
| 114 | opens the confirmation modal when Delete is clicked | ✅ pass |
| 115 | closes the modal on Cancel | ✅ pass |
| 116 | calls `onDeleted` after successful delete | ✅ pass |

#### Edit mode

| # | Test description | Status |
|---|-----------------|--------|
| 117 | switches to edit mode when Edit is clicked | ✅ pass |
| 118 | shows member-type cards in edit mode | ✅ pass |
| 119 | pre-selects the current member type | ✅ pass |
| 120 | returns to view mode when Back is clicked | ✅ pass |
| 121 | shows duplicate-email error from server on save | ✅ pass |

---

## Backend test inventory

> Backend tests require Java 17. Run with `cd backend && ./mvnw test`.

### `FormServiceTest.java` — `FormService`

| # | Test description | Status |
|---|-----------------|--------|
| 1 | `getForm()` returns a non-null value | ✅ pass |
| 2 | `getForm()` has a non-blank `formId` | ✅ pass |
| 3 | `getForm()` has exactly two member types | ✅ pass |
| 4 | member type IDs are unique | ✅ pass |
| 5 | member type names are non-blank | ✅ pass |
| 6 | has non-blank `title` and `clubId` | ✅ pass |
| 7 | `registrationOpens` instant is set | ✅ pass |
| 8 | `isValidMemberTypeId` returns `true` for a known ID | ✅ pass |
| 9 | `isValidMemberTypeId` returns `false` for an unknown ID | ✅ pass |
| 10 | `isValidMemberTypeId` returns `false` for empty string | ✅ pass |
| 11 | `isValidMemberTypeId` returns `false` for `null` | ✅ pass |
| 12 | `isValidMemberTypeId` returns `true` for all defined types | ✅ pass |
| 13 | `getMemberTypeName` returns correct name for known ID | ✅ pass |
| 14 | `getMemberTypeName` returns empty string for unknown ID | ✅ pass |
| 15 | `getMemberTypeName` returns correct name for all defined types | ✅ pass |

---

### `TurnstileServiceTest.java` — `TurnstileService`

| # | Test description | Status |
|---|-----------------|--------|
| 16 | skips check and returns `true` when secret is blank (local dev) | ✅ pass |
| 17 | skips check and returns `true` when secret is `null` | ✅ pass |
| 18 | returns `true` when Cloudflare responds with `success: true` | ✅ pass |
| 19 | returns `false` when Cloudflare responds with `success: false` | ✅ pass |
| 20 | returns `false` when REST call throws an exception | ✅ pass |
| 21 | returns `false` when Cloudflare response is `null` | ✅ pass |
| 22 | tolerates `null` IP address without throwing | ✅ pass |

---

### `FormControllerTest.java` — `GET /api/form`

| # | Test description | Status |
|---|-----------------|--------|
| 23 | responds with HTTP 200 | ✅ pass |
| 24 | responds with `application/json` content type | ✅ pass |
| 25 | response body includes `formId` | ✅ pass |
| 26 | response body includes `title` | ✅ pass |
| 27 | response body includes `memberTypes` array with correct length and names | ✅ pass |
| 28 | response includes `Cache-Control` header | ✅ pass |

---

### `RegistrationControllerTest.java` — POST / GET / PUT / DELETE

`@WebMvcTest` slice — all dependencies mocked.

#### POST /api/registrations

| # | Test description | Status |
|---|-----------------|--------|
| 29 | happy path: returns HTTP 201 Created | ✅ pass |
| 30 | happy path: response body includes `id` and `message` | ✅ pass |
| 31 | honeypot field filled → 403 Forbidden with `"bot detected"` | ✅ pass |
| 32 | wrong `formId` → 422 Unprocessable Entity with `"validation failed"` | ✅ pass |
| 33 | invalid `memberTypeId` → 422 Unprocessable Entity | ✅ pass |
| 34 | Turnstile CAPTCHA fails → 403 Forbidden | ✅ pass |
| 35 | duplicate email → 409 Conflict with `"already registered"` message | ✅ pass |
| 36 | missing `firstName` → 422 with `fields.firstName` error | ✅ pass |
| 37 | invalid email format → 422 with `fields.email` error | ✅ pass |
| 38 | missing `birthDate` → 422 Unprocessable Entity | ✅ pass |
| 39 | future `birthDate` → 422 with `fields.birthDate` error | ✅ pass |
| 40 | invalid `phone` pattern → 422 with `fields.phone` error | ✅ pass |

#### GET /api/registrations/:id

| # | Test description | Status |
|---|-----------------|--------|
| 41 | returns 200 with registration body when found | ✅ pass |
| 42 | returns 404 when registration not found | ✅ pass |

#### PUT /api/registrations/:id

| # | Test description | Status |
|---|-----------------|--------|
| 43 | returns 200 with updated body on success | ✅ pass |
| 44 | returns 404 when registration not found | ✅ pass |
| 45 | returns 409 when updated email conflicts with another registration | ✅ pass |

#### DELETE /api/registrations/:id

| # | Test description | Status |
|---|-----------------|--------|
| 46 | returns 204 No Content on success | ✅ pass |
| 47 | returns 404 when registration not found | ✅ pass |

---

## Test summary

| Layer | File | Tests | Status |
|-------|------|------:|--------|
| Frontend | `validation.test.js` | 41 | ✅ all pass |
| Frontend | `translations.test.js` | 13 | ✅ all pass |
| Frontend | `useForm.test.js` | 14 | ✅ all pass |
| Frontend | `Step1MemberType.test.jsx` | 9 | ✅ all pass |
| Frontend | `Step2PersonalInfo.test.jsx` | 12 | ✅ all pass |
| Frontend | `PhoneInput.test.jsx` | 9 | ✅ all pass |
| Frontend | `NotFoundPage.test.jsx` | 5 | ✅ all pass |
| Frontend | `ManageRegistration.test.jsx` | 18 | ✅ all pass |
| Backend | `FormServiceTest.java` | 15 | ✅ all pass |
| Backend | `TurnstileServiceTest.java` | 7 | ✅ all pass |
| Backend | `FormControllerTest.java` | 6 | ✅ all pass |
| Backend | `RegistrationControllerTest.java` | 19 | ✅ all pass |
| **Total** | | **178** | **✅ 178 / 178** |

---

## Future work

| Priority | Item |
|----------|------|
| High | E2E tests with Playwright — full wizard flow + profile edit/delete |
| High | Integration test with real H2 DB (`@SpringBootTest`) to verify DB constraints |
| Medium | Frontend coverage gate in CI (fail build if < 80%) |
| Medium | Contract test — verify frontend payload matches `RegistrationRequest` schema |
| Low | Performance test for `POST /api/registrations` under load |
