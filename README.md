<div align="center">
  <img src="https://i.imgur.com/uVax93w.jpg" alt="Link Up Hub Logo" width="150px">
  <h1>Link Up Hub</h1>
  <p>
    <strong>A modern, secure, and vibrant community-driven platform for event management, networking, and real-time engagement.</strong>
  </p>
  <p>
    <a href="#live-demo-soon"><strong>View Live Demo (Coming Soon)</strong></a>
  </p>
  <br>
  <p>
    <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js">
    <img src="https://img.shields.io/badge/Node.js-20.x-green?logo=node.js" alt="Node.js">
    <img src="https://img.shields.io/badge/Supabase-v2-green?logo=supabase" alt="Supabase">
    <img src="https://img.shields.io/badge/License-MIT-blue" alt="License">
    <img src="https://img.shields.io/badge/Status-In%20Development-orange" alt="Status">
  </p>
</div>

---

## 🌟 About The Project

**Link Up Hub** is a full-stack web application designed to bring communities together. It provides a seamless experience for members to discover, join, and pay for events, while also offering powerful tools for organizers to manage their communities, finances, and communications. Built with a security-first mindset and a focus on user experience, Link Up Hub is the ultimate platform for building and growing vibrant communities.

This project was built from the ground up using a modern tech stack designed for scalability, performance, and an excellent developer experience.

## 🚀 Core Features

Link Up Hub is packed with features to provide a complete event and community management solution.

- 🔐 **Secure Authentication & RBAC:**

  - JWT-based authentication with credentials stored in secure `HttpOnly` cookies.
  - Full Role-Based Access Control (RBAC) with pre-defined roles: `Super Admin`, `Admin`, `Accountant`, `Member`, and `Guest`.
  - Social logins and passwordless authentication can be easily integrated via Supabase.

- 🎉 **Dynamic Event Management:**

  - Admins can create, update, and manage events with details like title, description, date, location, and a poster image.
  - Toggle between **Free** and **Paid** events. Paid events seamlessly integrate with M-PESA payments.
  - Public-facing event pages are automatically generated and SEO-optimized.

- 💳 **M-PESA Payment Integration:**

  - Seamless payment experience for paid events using the **Safaricom Daraja API**.
  - Implemented M-PESA Express (STK Push) for a fast and familiar checkout process for users in Kenya.
  - Secure backend validation of all transactions with a dedicated payments table to track financial records.

- 💬 **Real-Time Community Chat:**

  - Live chat rooms for community members to engage and network.
  - Built with **Supabase Realtime**, providing instant message delivery without the need for a separate WebSocket server.
  - Secure RLS policies ensure users can only access chat rooms they are part of.

- 🎟️ **Digital Ticketing & QR Codes:**

  - Automatic generation of a unique digital ticket with a QR code upon successful RSVP or payment.
  - QR codes contain verifiable event and user data for secure check-ins.
  - User-friendly ticket view within the member dashboard.

- 📊 **Admin & User Dashboards:**

  - **Member Dashboard:** View RSVP'd events, access digital tickets, and manage profile settings.
  - **Admin Dashboard:** A comprehensive interface to manage users, events, view financial analytics, and push announcements.
  - **Moderation Tools:** Admins can shadow-ban users to handle moderation discreetly.

- 📢 **Announcements & Notifications:**

  - Admins can push real-time announcements to all members.
  - Scalable architecture ready for email & SMS notifications (via SendGrid, Twilio, or Africa's Talking).

- 🔍 **SEO & Performance Optimized:**
  - Server-Side Rendering (SSR) with Next.js for fast page loads and excellent SEO.
  - Automatic generation of dynamic `sitemap.xml` and `robots.txt`.
  - Rich metadata (`og:tags`, `JSON-LD schema`) for beautiful social media shares and rich search engine results.
  - Targeting a Lighthouse performance score of 90+.

## 🛠️ Tech Stack

This project uses a modern and powerful set of technologies to deliver a first-class experience.

| Category          | Technology                                                                                         |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| **Frontend**      | 🔵 **TypeScript**, ⚫ **Next.js** (App Router), ⚛️ **React**, 💨 **TailwindCSS**, 🎨 **Shadcn/UI** |
| **Backend**       | 🟢 **Node.js**, 🚀 **Express.js**                                                                  |
| **Database/Auth** | 🐘 **Supabase** (PostgreSQL, Authentication, Realtime, Storage)                                    |
| **Payments**      | 🇰🇪 **Safaricom Daraja API** (M-PESA Express / STK Push)                                            |
| **Deployment**    | ▲ **Vercel** (Frontend), 🛤️ **Render / Fly.io** (Backend)                                          |

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have the following installed on your machine:

- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/your-username/linkup-hub.git](https://github.com/your-username/linkup-hub.git)
    cd linkup-hub
    ```

2.  **Set Up Environment Variables:**

    - This project requires API keys and secrets. You'll need to create `.env` files.
    - In the `frontend` directory, create a `.env.local` file.
    - In the `backend` directory, create a `.env` file.
    - See the [Environment Variables](#-environment-variables) section below for the required keys.

3.  **Install Backend Dependencies:**

    ```bash
    cd backend
    npm install
    ```

4.  **Install Frontend Dependencies:**

    ```bash
    cd ../frontend
    npm install
    ```

5.  **Set up the Supabase Database:**

    - Go to your Supabase project dashboard.
    - Navigate to the `SQL Editor` and run the scripts from the `supabase/migrations/` directory to create the tables and RLS policies.

6.  **Run the Development Servers:**
    - **Backend:** In one terminal, from the `backend` directory, run:
      ```bash
      npm run dev # (Assuming a dev script with nodemon)
      ```
    - **Frontend:** In another terminal, from the `frontend` directory, run:
      ```bash
      npm run dev
      ```

Your application should now be running!

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`

## 🔑 Environment Variables

Create the following `.env` files and populate them with your own keys.

#### `frontend/.env.local`

```env
# Supabase keys (publicly accessible, secured by RLS)
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# Backend API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```
