# SM Associate Cars — Mobile App

> **Expo SDK 57:** `package.json` targets Expo `~57.0.28`, React `19.2.3`, and React Native `0.86.3`. Expo SDK 57 is stable. Expo module versions still need alignment and verification: run `npm install`, `npx expo install --fix`, and `npx expo-doctor`, then commit the resulting dependency changes and lockfile. An Android build has not yet been verified.


Premium dark/glass car buying and selling marketplace built with React Native and Expo.

## Included flows

- Welcome splash → role selection (Customer / Dealer) → sign in or account creation.
- Local demo mode when no API URL is configured; a small persistent profile/listing state is stored on-device.
- Customer marketplace: search, category filters, car detail/specifications, saved cars, up to three comparison selections, seller enquiries, test-drive requests, listing creation and moderation status.
- Dealer workspace: inventory, enquiry/lead status, vehicle expenses, sales records, profit arithmetic, and proposed subscription plans.
- Admin access is deliberately not offered as public registration. Admin moderation and plan control require a protected backend/admin interface, as described in the product flow.
- ImagePicker photo selection for listing drafts. Listing photos remain local until a backend-authorized ImageKit upload is configured.
- Loading and error feedback, empty states, vehicle safety disclaimer, and sign-out confirmation.

## Run locally

Use Node.js 22.13.x or newer, as required by Expo SDK 57.

```bash
npm install
npx expo start
```

For Android: `npx expo start --android`

## Live backend connection

Set `EXPO_PUBLIC_API_BASE_URL` in a local `.env` file to the API base URL. The mobile client expects `POST /auth/login` and `POST /auth/register` at that base URL (for example, if the base URL ends in `/api/v1`, the final URLs are `/api/v1/auth/login` and `/api/v1/auth/register`). It expects JSON responses containing a user and access token (`accessToken` or `token`). Verify these paths and response shapes against the actual backend before using production credentials. No backend URL is assumed by default.

## Production work still required

This repository was empty when initialized, so the app is a fresh project. The app has not been built on an Android device here. Before production: connect and test the live API, add authenticated API calls for listings/favourites/enquiries/leads/expenses/sales/admin permissions, implement secured ImageKit authorization/upload on the server, integrate server-verified subscriptions and payments, and run `npx expo-doctor` plus Android/iOS device tests. The product-flow document treats plan amounts/quotas as proposals, not finalized policy.

## Initial plan copy (from product-flow draft)

- Customer Free: up to 5 active personal listings (proposed).
- Dealer Starter: up to 10 active listings at ₹499/month (proposed).
- Dealer Pro: 200 included active listings at ₹1,999/month (proposed).

These are displayed as informational examples only. This app does not process payments or activate a plan from a client-side success screen.
