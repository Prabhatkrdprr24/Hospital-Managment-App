# Prescripto — Hospital Management App

This document contains a brief project introduction and an extensive set of interview questions and model answers tailored to the `Prescripto` Hospital Management App repository (frontend, admin, backend). Use this as a study guide or printable handout.

---

## Project introduction
It's a Hospital Management App that lets patients find doctors, book and manage appointments, and lets admin manage doctors and appointments. 
Main users: Patients, Doctors, Admins.

It consists of three folders:
- `frontend/`: It is a user interface with pages of Home, Doctors listing, Appointment booking, Login, My Appointments, and Profile.
- `admin/`: It is a admin interface with pages of adding doctors, viewing all appointments, doctor dashboards, and doctor profiles.
- `backend/`: It contains module for route such as (`userRoute.js`, `doctorRoute.js`, `adminRoute.js`), controllers, Mongoose models (`userModel.js`, `doctorModel.js`, `appointmentModel.js`), Cloudinary integration (`config/cloudinary.js`), file upload via Multer (`middlewares/multer.js`), and role-specific auth middlewares (`authUser.js`, `authDoctor.js`, `authAdmin.js`).

Key technologies: React, Vite, Tailwind CSS, Node, Express, MongoDB + Mongoose, Cloudinary, Multer, JWT-based auth and deployment on vercel.

High-level flow:
- Frontend apps call the backend API for authentication, fetching doctors, and booking appointments.
- Backend validates requests, interacts with MongoDB, stores doctor images on Cloudinary, and returns JSON responses.

---

## Interview questions & model answers

Grouped by topic. Use the follow-ups to dig deeper in an interview.

### General / Project-level
<!-- 
1. Q: What is the purpose of this project and who are its main users?
   A: It's a Hospital Management App that lets patients find doctors, book and manage appointments, and lets admin manage doctors and appointments. 
   Main users: Patients, Doctors, Admins. -->

2. Q: Describe the architecture of the application (high-level).
   A: Three-tier: React frontends (`frontend`, `admin`) built with Vite; Node/Express backend (`backend`) exposes APIs; MongoDB for storing data; Cloudinary for media; authentication/authorization middlewares enforce role-based access.

3. Q: How would you run the app locally?
   A: Install dependencies in each folder (`npm install`), set .env variables (MongoDB URI, Cloudinary creds, JWT secret), run backend (e.g., `npm run dev` or `node server.js`), and run frontends with Vite (`npm run dev`) per `package.json` scripts.


### Frontend (React, Vite, Tailwind)

4. Q: How does the frontend manage global state?
   A: Using React Contexts such as admin, doctor and app context.

5. Q: Why choose Vite over CRA?
   A: Vite offers faster development server startup, faster HMR, and faster for modern React/Tailwind workflows.

   HMR(Hot Module Replacement) is a development feature that updates modules in a running application without doing a full page reload so that application state is preserved.

6. Q: Where we add client-side validation for booking?
   A: In the appointment form component (likely `Appointment.jsx`): validate required fields, show inline errors, and disable submit while sending.


### Admin & Doctor Panel

8. Q: Responsibilities of the `admin` app?
   A: Admins add doctors, view and manage appointments, view doctors list; 
   Doctors have dashboards and appointment management pages.

9. Q: How to add role-based navigation?
   A: Use `AdminContext`/auth state to render menu items conditionally and create protected route wrappers that check role and redirect if unauthorized.


### Backend — Express, controllers, middlewares

10. Q: How is routing organized?
    A: Routes grouped by resource: `userRoute.js`, `doctorRoute.js`, `adminRoute.js`

11. Q: Purpose of `authUser.js`, `authDoctor.js`, `authAdmin.js`?
    A: Middleware to verify JWT token and enforce role-based access.

12. Q: How to implement JWT+role-check middleware?
    A: Read token from header/cookie, verify with JWT secret, attach user object to `req`, check `user.role` and call `next()` or return 401/403.

13. Q: Controller responsibilities?
    A: Validate input, call model methods, handle Cloudinary uploads, format responses, and return proper status codes.


### Database / Mongoose

14. Q: Likely schemas for models?
    A: `userModel`: name, email, passwordHash, role, profile. 
    `doctorModel`: name, specialization, contact, image URL + public_id, availability metadata.
    `appointmentModel`: patient ref, doctor ref, date/time, status, notes.

15. Q: Modeling doctor availability?
    A: Options: explicit time-slot array, working-hours + rules computed into slots, or combination. For robust approach, store working rules and derive slots while excluding existing appointments.


### File upload & Cloudinary

16. Q: How are images handled when adding a doctor?
    A: Multer parse multipart form-data; backend uploads to Cloudinary (`config/cloudinary.js`) then saves `secure_url` on doctor model; optionally cleans temporary file.

17. Q: Safe deletion of images?
    A: Use Cloudinary `destroy(public_id)` when deleting or updating a doctor.


### Authentication & Security

18. Q: Where store tokens and what is recommended?
    A: Not explicit. Recommended: httpOnly secure cookies or short-lived access tokens.

19. Q: Security improvements?
    A: HTTPS, secure/httpOnly cookies, Helmet, rate-limiting, input sanitization, restrict CORS, validate file size/type, use env vars for secrets.


### Deployment & DevOps

20. Q: How deploy to production?
    A: i deploy backend and frontend  to Vercel, MongoDB Atlas for DB, Cloudinary for media.

21. Q: Why `vercel.json` in backend?
    A: Suggests deployment as serverless functions on Vercel; consider serverless constraints when deploying.


### Testing & Debugging

22. Q: Tests to add?
    A: Backend unit and integration tests (Jest + Supertest), frontend unit tests (React Testing Library), and E2E tests (Cypress).

23. Q: Debug failing API call from frontend?
    A: Check browser devtools network tab, verify URL/headers/body, reproduce with Postman, inspect server logs, check CORS and env config.


### Performance & Scaling

24. Q: Scale appointment lookups under load?
    A: Index appointment collection (doctor + date), paginate, cache doctor lists in Redis, and offload heavy computations to background jobs.

25. Q: Where to add caching?
    A: Cache doctor lists, specialties, and read-heavy endpoints; use CDN for static assets.


---

## Sample coding / design questions (with answers)

<!-- 1. Q: Implement Express middleware verifying JWT from `Authorization` header and providing `req.user`.
   A: Contract: Input: header `Authorization: Bearer <token>`; Output: `req.user` populated or 401. Steps: read header, split token, `jwt.verify(token, process.env.JWT_SECRET)`, find user in DB if necessary, attach to `req.user`, `next()`; handle errors with 401/403. -->

<!-- 2. Q: Add `isTeleconsultation` to `appointmentModel` and ensure compatibility.
   A: Schema change: `isTeleconsultation: { type: Boolean, default: false }`. Update creation controller to accept and validate. Update frontend booking form to allow choosing teleconsultation. Migration not required due to default.

3. Q: Prevent double-booking a doctor.
   A: Normalize times, use DB-level approach: a compound unique index on `{ doctor, date, timeSlot }` where timeSlot is a normalized slot identifier. Or transactionally check for overlaps and insert within a MongoDB transaction; or use Redis-based lock.

4. Q: Upload image to Cloudinary from Express controller using Multer.
   A: Use multer to get file path or buffer, call Cloudinary `uploader.upload(filePath, options)`, save `secure_url` and `public_id` to doctor model, remove temp file.

5. Q: Design API endpoint to fetch available time slots for a doctor between two dates.
   A: `GET /doctors/:id/available?from=YYYY-MM-DD&to=YYYY-MM-DD`. Steps: fetch doctor's schedule; query appointments in range; compute daily slots from working hours; subtract booked slots; return available slots. Handle timezones and slot duration. -->


---

## Behaviour / soft-skill questions & tips

- Be ready to explain a bug fix: e.g., race condition in booking — solution: DB uniqueness & transactions.
Ans -> A. Recommended: Enforce a DB-level constraint (compound unique index) + handle      duplicate-key errors.
    Why: Database guarantees correctness even under concurrency; simplest, reliable, low-latency.
    B. Use MongoDB transactions so that multiple documents must be updated atomically.
    Why: Use when booking requires updates to multiple documents (e.g., decrementing slot count and writing appointment).
    C. Use an atomic findOneAndUpdate upsert pattern (conditional insert).
    Why: Works for single-document atomic operations if you can represent the slot as a document to upsert.
    D. Distributed lock (Redis) — pessimistic locking.
    Why: Useful when you must serialize access across multiple services; higher complexity.
    Concrete implementation — recommended approach (A): unique index + error handling
- Prioritize technical debt using impact analysis; fix security issues when they block features.


## Candidate tips & likely follow-ups
<!-- 
- Be able to open `backend/server.js`, any `routes/*Route.js` and `controllers/*Controller.js` during the interview.
- Explain the full login flow and security trade-offs (jwt vs session cookie).
- Discuss edge cases: timezone normalization, concurrent bookings, file validation, and deployment secrets. -->


