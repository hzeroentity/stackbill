# StackBill Pre-Production Testing Checklist

**Version:** 1.0  
**Date:** 2025-09-08  
**Status:** Ready for Testing Phase

## 🎯 Overview

This document provides a comprehensive testing plan for StackBill before production launch. The app is feature-complete with Pro/Free plans, Stripe integration, multi-project management, email notifications, and admin panel.

---

## ✅ Automated Test Results

### **Build & Code Quality (PASSED)**
- [x] **Production Build:** ✅ Compiles successfully without errors
- [x] **TypeScript:** ✅ All types valid, no compilation errors
- [x] **Linting:** ✅ Passes with minor fix applied (tailwind.config.ts)
- [x] **Bundle Size:** ✅ Optimized (largest page: 223 kB dashboard)

### **Code Quality Analysis**
- [x] **Technical Debt:** ✅ Some remaining `as any` casts but documented and justified
- [x] **Console Logs:** ⚠️ Found 41 files with console logs (production debugging)
- [x] **TODO Items:** ✅ Only 2 minor TODOs for currency preferences
- [x] **TypeScript:** ✅ Minimal necessary type assertions with eslint comments

## 🚨 Stripe Integration Status

### **Stripe Webhook Configuration (RESOLVED)**
- [x] ~~**Fix production webhook endpoint in Stripe Dashboard**~~ ✅ **RESOLVED**
- [x] ~~**Verify production environment variables**~~ ✅ **RESOLVED**  
- [x] ~~**Test live payment flow end-to-end**~~ ✅ **RESOLVED**

---

## 🔐 Authentication & User Management

### **Registration & Login**
- [ ] **Email/Password Signup**
  - Test with valid email format
  - Test password requirements (8+ chars, uppercase, number, symbol)
  - Verify email confirmation field validation
  - Check password strength indicator functionality
  - Test "confirm email" UI state after successful signup
- [ ] **GitHub OAuth Login**
  - Test GitHub authentication flow
  - Verify user profile creation from GitHub data
  - Test account linking with existing email accounts
- [ ] **Email Confirmation**
  - Test email delivery (check spam folder)
  - Verify confirmation link functionality
  - Test resend confirmation email
- [ ] **Password Reset** (if implemented)
  - Test forgot password flow
  - Verify reset email delivery and links

### **Account Management**
- [ ] **Account Deletion**
  - Test GitHub-style account deletion confirmation
  - Verify "delete my account" text entry requirement
  - Check automatic Stripe subscription cancellation
  - Confirm farewell email delivery
  - Verify complete data removal from database
- [ ] **Profile Management**
  - Test profile updates and persistence
  - Verify data validation and error handling

---

## 💳 Payment & Subscription System

### **Stripe Integration**
- [ ] **Free to Pro Upgrade**
  - Test monthly plan upgrade ($4/month)
  - Verify immediate plan limit increases (5→30 subs, 2→10 projects)
  - Check Pro badge display in dashboard
  - Test email notification preferences unlock
- [ ] **Pro to Free Downgrade**
  - Test standard downgrade (within limits)
  - Test force downgrade system when exceeding limits
  - Verify excess data deletion (subscriptions + projects)
  - Check automatic Stripe cancellation
  - Verify downgrade confirmation emails
- [ ] **Payment Edge Cases**
  - Test declined card scenarios
  - Test expired card handling
  - Verify payment retry mechanisms
  - Test international payments if supported

### **Billing Management**
- [ ] **Billing History**
  - Verify complete transaction history display
  - Test timeline view with all plan changes
  - Check payment details and timestamps
- [ ] **Plan Limits Enforcement**
  - Test subscription limits (Free: 5, Pro: 30)
  - Test project limits (Free: 2, Pro: 10)
  - Verify upgrade prompts when limits reached
  - Test force downgrade data deletion

---

## 📊 Core Application Features

### **Project Management**
- [ ] **Project Creation & Organization**
  - Create new projects with color selection
  - Test project name validation and uniqueness
  - Verify color uniqueness system (colors unavailable when assigned)
  - Test project deletion with subscription handling
- [ ] **General Project System**
  - Test virtual "General" project functionality
  - Verify General subscriptions appear in all project views
  - Test automatic General project database creation
  - Check cross-project visibility for General items
- [ ] **Project Switching**
  - Test project switcher dropdown functionality
  - Verify subscription counters ("X subs") accuracy
  - Test responsive design (mobile vs desktop)
  - Check "All Projects" view aggregation

### **Subscription Management**
- [ ] **CRUD Operations**
  - **Create:** Test all 15 subscription categories
  - **Read:** Verify dashboard display and filtering
  - **Update:** Test editing all fields (name, cost, renewal, projects)
  - **Delete:** Test deletion with proper confirmations
- [ ] **Subscription Details**
  - Test all billing periods (monthly, yearly, weekly, daily)
  - Test all currencies (10 supported currencies)
  - Verify currency conversion accuracy
  - Test cost validation (positive numbers only)
- [ ] **Project Assignment**
  - Test multi-project assignment to subscriptions
  - Verify project badge display in subscription cards
  - Test project pre-selection when adding from specific project view
  - Check subscription-project relationship integrity

### **Dashboard & Analytics**
- [ ] **Spending Analytics**
  - Verify total monthly/annual calculations
  - Test currency conversion display
  - Check spending breakdown by category
  - Test project-specific analytics
- [ ] **Renewal Tracking**
  - Test renewal status calculations (due dates)
  - Verify renewal badge colors and timing
  - Test renewal alerts for Pro users
- [ ] **Data Visualization**
  - Test animated counters functionality
  - Verify responsive design on all screen sizes
  - Check dark/light theme consistency

---

## 📧 Email System (Pro Feature)

### **Email Infrastructure**
- [ ] **Resend Integration**
  - Test email delivery (hello@stackbill.dev)
  - Verify custom domain authentication
  - Check spam folder delivery rates
- [ ] **Email Templates**
  - Test renewal alert email formatting
  - Test monthly summary email layout
  - Verify professional HTML rendering across email clients
  - Test mobile email responsiveness

### **Email Notifications**
- [ ] **Renewal Alerts (Pro Only)**
  - Test 7-day advance renewal warnings
  - Test 3-day advance notifications
  - Test 1-day urgent alerts
  - Verify Pro-only filtering
- [ ] **Monthly Summary (Pro Only)**
  - Test monthly spending reports
  - Verify category breakdown accuracy
  - Check currency conversion in emails
  - Test analytics insights delivery
- [ ] **Account Action Emails**
  - Test subscription cancellation confirmations
  - Test account deletion farewell emails
  - Verify professional formatting and branding

### **Email Testing**
- [ ] **Manual Test Endpoints**
  - Test `/api/test-renewal-email` with your user ID
  - Test `/api/test-summary-email` with your user ID
  - Verify mock data generation for users with no subscriptions
- [ ] **Email Deliverability**
  - Check primary inbox delivery
  - Test spam folder rates
  - Verify unsubscribe functionality (if implemented)

---

## 🔒 Admin Panel & Security

### **Admin Authentication**
- [ ] **2FA Setup**
  - Test Google Authenticator QR code generation
  - Verify TOTP token validation
  - Test backup code generation and storage
  - Test 2FA recovery process
- [ ] **Admin Security**
  - Test admin login with 2FA
  - Verify session management (24-hour expiry)
  - Test failed login lockouts (5 attempts = 30min lock)
  - Check security audit logging
- [ ] **Admin Dashboard**
  - Test user overview and statistics
  - Test Pro subscription duration tracking
  - Verify user account expansion/details
  - Test admin action logging

### **Security Features**
- [ ] **Data Protection**
  - Test RLS (Row Level Security) policies
  - Verify users can only access their own data
  - Test API endpoint authorization
  - Check admin-only route protection
- [ ] **Session Management**
  - Test automatic session extension
  - Verify proper logout functionality
  - Test session timeout handling

---

## 🌍 Internationalization & Accessibility

### **Multi-Language Support**
- [ ] **Language Switching**
  - Test English, Spanish, Italian translations
  - Verify localStorage persistence
  - Check translation completeness
  - Test RTL language handling (if applicable)
- [ ] **Theme System**
  - Test dark/light theme switching
  - Verify theme persistence across sessions
  - Check component consistency in both themes
  - Test theme system on landing page

### **Responsive Design**
- [ ] **Mobile Experience**
  - Test mobile burger menu functionality
  - Verify touch interactions and gestures
  - Check form usability on mobile devices
  - Test testimonial carousel on mobile
- [ ] **Desktop Experience**
  - Test all screen sizes (1024px+)
  - Verify hover states and interactions
  - Check keyboard navigation
  - Test accessibility features

---

## 🏠 Landing Page & Marketing

### **Landing Page Content**
- [ ] **Content Accuracy**
  - Verify feature descriptions match actual app functionality
  - Check pricing information accuracy (5 vs 30 subs, 2 vs 10 projects)
  - Test all CTA buttons and links
  - Verify testimonials and social proof
- [ ] **Visual Elements**
  - Test dark mode consistency
  - Verify testimonial carousel functionality (infinite scroll)
  - Check "How It Works" section flow
  - Test mobile responsiveness

### **Legal & Compliance**
- [ ] **Required Pages**
  - Create Privacy Policy page (currently missing)
  - Create Terms of Service page (currently missing)
  - Test footer link functionality
  - Add cookie consent banner (EU compliance)
- [ ] **SEO & Meta Tags**
  - Verify OpenGraph meta tags
  - Test Twitter Card functionality
  - Check search engine meta descriptions
  - Add structured data (JSON-LD)

---

## 🚀 Performance & Technical

### **Build & Deployment**
- [ ] **Production Build**
  - Test `npm run build` without errors
  - Verify TypeScript compilation success
  - Check bundle size optimization
  - Test production environment variables
- [ ] **Performance Testing**
  - Test page load speeds
  - Verify database query performance
  - Check API response times
  - Test concurrent user scenarios

### **Error Handling**
- [ ] **API Error Responses**
  - Test invalid request handling
  - Verify proper error messages
  - Check 404/500 error pages
  - Test network failure scenarios
- [ ] **User Experience Errors**
  - Test form validation errors
  - Verify user-friendly error messages
  - Check error state recovery
  - Test offline functionality (if applicable)

---

## 📋 Support & Documentation

### **Support System**
- [ ] **Support Page**
  - Test FAQ section completeness
  - Verify contact information accuracy
  - Test hello@stackbill.dev email response
  - Check 24h response time commitment
- [ ] **Help & Tooltips**
  - Test help tooltip system in forms
  - Verify contextual help information
  - Check user onboarding flow
  - Test feature discovery mechanisms

---

## ✅ Pre-Launch Final Checklist

### **Critical Production Requirements**
- [ ] **Fix Stripe webhook configuration** (BLOCKER)
- [ ] **Create Privacy Policy & Terms of Service**
- [ ] **Add EU cookie consent banner**
- [ ] **Verify all email deliverability**
- [ ] **Complete end-to-end payment testing**

### **Production Readiness Verification**
- [ ] **Environment Variables**
  - All production keys configured correctly
  - Database connection strings updated
  - Email service properly configured
- [ ] **Domain & DNS**
  - Custom domain properly configured
  - SSL certificates active
  - Email domain authentication complete
- [ ] **Monitoring & Analytics**
  - Error tracking system in place
  - Performance monitoring configured
  - User analytics tracking (if desired)

---

## 🎯 Testing Priority Order

### **Phase 1: Critical (Must Fix Before Launch)**
1. Stripe webhook configuration
2. End-to-end payment flow
3. Account deletion system
4. Email notification system
5. Admin panel security

### **Phase 2: Important (Should Fix Before Launch)**
1. Privacy Policy & Terms of Service
2. EU cookie compliance
3. Mobile responsiveness issues
4. Email deliverability optimization
5. Performance optimization

### **Phase 3: Nice to Have (Can Fix Post-Launch)**
1. Additional language support
2. Advanced analytics
3. User onboarding improvements
4. Performance monitoring enhancements
5. SEO optimization

---

## 📝 Testing Log Template

For each test item, document:
- **Status:** ✅ Pass | ❌ Fail | ⚠️ Partial
- **Issues Found:** Description of any problems
- **Screenshots:** Visual evidence if needed
- **Next Steps:** Required fixes or improvements

---

**Ready to begin testing!** Start with Phase 1 critical items, especially the Stripe webhook configuration.