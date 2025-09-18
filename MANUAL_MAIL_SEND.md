curl -X POST http://localhost:3001/api/test-renewal-email \
    -H "Content-Type: application/json" \
    -d '{"userId": "test123"}'

  This sends:
  - Supabase Pro renewal alert ($25/month, renewing in 3 days)
  - To: filippoaggio@gmail.com

  Monthly Summary Email (Dev subscriptions)

  curl -X POST http://localhost:3001/api/test-summary-email \
    -H "Content-Type: application/json" \
    -d '{"userId": "test123"}'

  This sends:
  - Monthly summary with $155.94/month total across 9 dev subscriptions
  - Includes: Vercel Pro, Supabase Pro, ChatGPT Plus, PostHog, Resend, Figma, GitHub Copilot, LinearB
  - To: filippoaggio@gmail.com