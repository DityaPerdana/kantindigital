This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Kantin Digital

Kantin Digital is a modern web application for managing digital canteen operations, including menu management, user authentication, order processing, and real-time updates. Built with Next.js, TypeScript, and a modular component architecture.

## Features
- User authentication (login, signup)
- Admin dashboard for menu and user management
- Product catalog with search and filters
- Real-time order updates
- Push notifications
- Responsive UI with reusable components

## Tech Stack
- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [React](https://react.dev/)
- [Supabase](https://supabase.com/) (for authentication and database)
- [Tailwind CSS](https://tailwindcss.com/) (for styling)

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Bun (for dependency management)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/DityaPerdana/kantindigital.git
   cd kantindigital
   ```
2. Install dependencies:
   ```bash
   bun install
   ```
3. Copy and configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase and other credentials
   ```
4. Run the development server:
   ```bash
   bun run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure
- `src/app/` - Application routes and pages
- `src/components/` - UI and feature components
- `src/hooks/` - Custom React hooks
- `src/lib/` - Data and utility functions
- `src/utils/` - Helper utilities and types
- `public/` - Static assets

## Scripts
- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run lint` - Lint codebase

## License
MIT

---

Feel free to contribute or open issues for suggestions and bug reports!
