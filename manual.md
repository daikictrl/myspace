# MySpace Platform - User & Administrator Manual

Welcome to **MySpace**, the premier directory and booking marketplace connecting clients with top event service professionals. This manual details every capability of the application for both clients and vendors.

---

## 1. Client Experience & Functionality

The public-facing side of the app is designed for clients who want to discover, evaluate, and book event professionals.

### Discovering Vendors
*   **Search**: Clients can search for vendors by business name or service locations directly from the header search bar on the [Explore page](/explore-vendors).
*   **Category Filters**: A dropdown filter allows clients to narrow down results to specific categories (e.g. *DJs, Caterers, Decorators, Photographers, Traditional Wear*, etc.).
*   **Multi-Category Support**: Vendors offering multiple services (e.g., photography and videography) will automatically display under all corresponding category filters.

### Vendor Profiles
Each vendor has a dedicated, premium profile page displaying:
*   **Business Details**: Brand name, primary category, location, starting price, and an "About" description.
*   **Portfolio Gallery**: High-resolution showcase of past work.
*   **Pricing Packages**: Tabulated summaries of packages containing features, pricing, and services included.
*   **Client Reviews**: Verified feedback comments and star ratings from previous clients.

### Booking & Inquiries
*   **WhatsApp Contact**: A direct WhatsApp chat button opens a pre-composed message directly to the vendor's WhatsApp number.
*   **In-App Bookings**: Clients can select their event category (e.g. *Wedding, Birthday Party*) and input their WhatsApp number.
    *   *Automatic Sync*: Submitting a booking request automatically updates the client's profile with their WhatsApp number, saving it for future use.
    *   *Real-Time Request*: A `pending` booking row is immediately sent to the vendor's dashboard.

### Client Reviews & Ratings
*   **Verification Gate**: To prevent spam, reviews are locked behind bookings. Clients **must** submit at least one booking request to a vendor before they are allowed to leave a review.
*   **Review Submission**: Once unlocked, clients can leave a star rating (1 to 5) and written feedback.
*   **Dynamic Updating**: Submitting a review recalculates the vendor's average rating score and review count instantly on the database.

---

## 2. Vendor Portal & Dashboard

Vendors manage their profiles, services, packages, and client leads via the **Vendor Dashboard** accessible at [/vendors](/vendors).

### Registration & Authentication
*   **Sign Up**: New vendors can sign up with their name, business name, WhatsApp number, primary category, email, and password.
*   **Email Auto-Confirmation**: To streamline testing and registration, email confirmation checks are bypassed. New accounts are confirmed instantly upon creation.
*   **Password Visibility**: An eye-icon toggle button allows vendors to safely reveal or hide their password on signup and login forms.

### Dashboard Tabs
1.  **Overview**: Displays card widgets for total booking requests, pending inquiries, average rating, and total reviews.
2.  **Business Profile**: Allows vendors to edit their business name, description, location areas, and starting price.
3.  **Portfolio Gallery**: Supports uploading new showcase images to their profile.
4.  **Services & Packages**: Supports editing pricing packages, features, and individual service items.
5.  **Bookings & Chat**:
    *   Lists all client inquiries sorted chronologically (newest first).
    *   **Accept / Decline Actions**: Vendors can accept or decline bookings, updating the request status in real-time.
    *   **Chat on WhatsApp**: A green action button allows vendors to initiate a chat with the client on WhatsApp with a pre-filled template: `"Hi, this is [Vendor Name] responding to your request for [Event Title]!"`

---

## 3. Deployment & Environment Settings

### Environment Variables
For the project to build and connect to the live database properly, a `.env` file must exist in the root folder with the following variables:
*   `VITE_SUPABASE_URL`: The Supabase project URL endpoint.
*   `VITE_SUPABASE_ANON_KEY`: The Supabase anonymous API key.

### Vercel Integration
*   The project contains a `vercel.json` rewrite configuration. This redirects all deep paths (like `/vendors` or `/explore-vendors`) to the main entry point (`index.html`) so that React Client-Side Routing operates perfectly on refreshes and direct link navigation.

---
*Manual compiled for MySpace App.*
