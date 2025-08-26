# StackBill - Saas and indie hackers Subscription Tracker

## Project Overview

StackBill is a subscription tracker designed for freelancers and indie developers to manually track their recurring expenses. The MVP focuses on simplicity and core functionality without automated integrations.

**Key Features:**
- Manual subscription entry (name, amount, renewal date, billing period)
- Dashboard showing total monthly/annual spend
- Clean subscription list with renewal tracking
- Basic renewal alerts/reminders
- User authentication and data persistence

**Tech Stack:**
- **Frontend:** Next.js + ShadCN/UI
- **Backend:** Supabase (auth + database)
- **Payments:** Stripe (for app monetization)
- **Deployment:** TBD

## Master MVP Roadmap

### Phase 1 — Project Setup
- [x] Setup Supabase (authentication + database)
- [x] Setup Stripe basic integration (account connection)
- [x] Install & configure ShadCN UI components
- [x] Basic project structure and routing

### Phase 2 — Core Features
- [x] Implement user authentication (Supabase Auth)
- [x] Create dashboard layout and navigation
- [x] Build subscription CRUD functionality (add/edit/delete)
- [x] Design and implement Supabase database schema
- [x] Connect frontend to Supabase for data persistence

### Phase 3 — Dashboard & UX
- [x] Calculate and display total monthly spend
- [x] Calculate and display total annual spend
- [x] Create subscription list/table component
- [x] Enhance color-coded renewal status indicators
- [x] Improve responsive design for mobile/desktop
- [x] Add data visualization charts/graphs
- [x] Enhance dashboard layout and spacing

### Phase 4 — Payments & Monetization
- [ ] Integrate Stripe for app subscriptions
- [ ] Implement free plan (up to 3 subscriptions)
- [ ] Implement paid plan (unlimited subscriptions)
- [ ] Add subscription limit enforcement
- [ ] Payment flow and subscription management

### Phase 5 — Final MVP Polish
- [ ] Responsive styling refinements
- [ ] End-to-end testing of all flows
- [ ] Performance optimizations
- [ ] Final UX/UI polish
- [ ] MVP completion and documentation

## Collaboration Rules & Workflow

### Development Principles
1. **Keep it simple** — Focus on MVP functionality, avoid overengineering
2. **Modular code** — Write clean, maintainable components
3. **Progressive enhancement** — Build core features first, then enhance
4. **User-first approach** — Prioritize usability and clarity

### Claude Code Responsibilities
- Follow the established roadmap phases in order
- Update this Development Log after every major task completion
- Explain important architectural decisions
- Suggest improvements while respecting MVP scope
- Ask for clarification when requirements are unclear

### Progress Tracking Protocol
After every code execution or major milestone:
1. Open `claude.md`
2. Update Development Log with:
   - ✅ What was completed
   - 📌 What's next
3. Mark roadmap items as complete when finished

### Code Standards
- Use TypeScript for type safety
- Follow Next.js 13+ app directory structure
- Use ShadCN/UI components consistently
- Implement proper error handling
- Write descriptive commit messages

## Development Log

### Phase 1 Complete - Project Setup ✅
**Date:** 2025-08-25

✅ **What was completed:**
- Installed and configured Supabase client with TypeScript types
- Set up Stripe integration with client/server instances  
- Installed and configured ShadCN/UI with Tailwind CSS v4
- Created basic project structure with proper routing:
  - Landing page with hero section and feature cards
  - Dashboard layout with navigation
  - Login page placeholder (auth route group)
  - Subscriptions management page
- Updated Tailwind config and global CSS for ShadCN theme support
- Added essential UI components: Button, Card, Input

📌 **What's next:** Begin Phase 2 - Core Features
- Implement Supabase authentication
- Create subscription CRUD functionality
- Set up database schema

---

### Phase 2 Complete - Core Features ✅
**Date:** 2025-08-26

✅ **What was completed:**
- Full user authentication system with Supabase Auth (login/signup/logout)
- Protected routes with loading states and auto-redirects
- Complete database schema for subscriptions with RLS policies
- Subscription CRUD functionality (Create, Read, Update, Delete)
- Subscription management service with helper methods for calculations
- Dashboard with real-time subscription summaries (monthly/yearly totals)
- Subscription list with renewal status indicators
- Subscription forms with validation (add/edit subscriptions)
- Dialog modals for seamless subscription management
- Upcoming renewal alerts and notifications

📌 **What's next:** Begin Phase 3 - Dashboard & UX Enhancements
- Fine-tune responsive design for mobile/desktop
- Optimize color-coded renewal status indicators
- Enhance dashboard UX with better data visualization

---

### Phase 3 Complete - Dashboard & UX ✅
**Date:** 2025-08-26

✅ **What was completed:**
- Enhanced color-coded renewal status indicators with icons and better visual design
- Improved responsive design across all components (mobile/desktop optimized)
- Added data visualization with category-based spending breakdowns
- Created visual progress bars for spending categories  
- Enhanced dashboard cards with gradients, icons, and better typography
- Added spending overview with min/max/average calculations
- Improved mobile navigation with collapsible layout
- Enhanced form layouts for better mobile experience

📌 **What's next:** Begin Phase 4 - Payments & Monetization
- Integrate Stripe for app subscriptions
- Implement free/paid plans with usage limits
- Add subscription management and payment flows

---

### Phase 3+ - Advanced UX Refinements ✅
**Date:** 2025-08-26

✅ **What was completed:**
- Consolidated subscription management into dashboard (removed separate subscriptions page)
- Implemented predefined category dropdown system with 11 curated categories (Cloud & Hosting, Analytics & Tracking, Database & Storage, Developer Tools, Communication, Design & Creative, Marketing & SEO, Security, Entertainment, Productivity, Other)
- Enhanced Active Subscriptions card with category display under service titles
- Moved renewal status inline with service names for better visual hierarchy
- Implemented intelligent renewal status display (only shows "Due in X days" for items due within 7 days or overdue)
- Added three-dots dropdown menu for subscription actions (edit/delete)
- Removed description field from subscriptions (simplified form and database)
- Replaced browser confirm dialogs with professional ShadCN AlertDialog components
- Implemented subscription sorting by most imminent due date
- Updated database schema to enforce category constraints and remove unused description column

✅ **Database migrations required:**
- Category field updates and constraints
- Description column removal
- Data cleanup for existing subscriptions

📌 **What's next:** Begin Phase 4 - Payments & Monetization
- Integrate Stripe for app subscriptions
- Implement free/paid plans with usage limits
- Add subscription management and payment flows

---

### Phase 4 Complete - Payments & Monetization ✅
**Date:** 2025-08-26

✅ **What was completed:**
- Complete Stripe integration for subscription payments
- User subscription database schema and service layer
- Subscription plans configuration (Free: 3 subscriptions, Pro: unlimited)
- Stripe Checkout API integration for Pro plan upgrades
- Webhook handling for payment processing and subscription status updates
- Subscription limit enforcement throughout the application
- Smart upgrade prompts when users approach/hit limits
- Professional billing/pricing page showcasing plans with current subscription status
- Dashboard integration with plan status indicators and upgrade buttons
- Navigation enhancement with billing page access

✅ **Core monetization features implemented:**
- Free plan: Up to 3 subscriptions with upgrade prompts (no credit card required)
- Pro plan: Up to 100 subscriptions for $4/month with email reminders
- Secure payment processing via Stripe
- Real-time subscription status tracking
- Automatic plan limit enforcement
- User-friendly upgrade flow
- Modern Supabase SSR integration (replaced deprecated auth helpers)

📌 **What's next:** Begin Phase 5 - Final MVP Polish
- Responsive styling refinements
- End-to-end testing of all flows
- Performance optimizations
- Final UX/UI polish

---

**Project Status:** 🚀 Phase 4 Complete - Full Payment Integration & Monetization System
**Next Step:** Final MVP polish and testing