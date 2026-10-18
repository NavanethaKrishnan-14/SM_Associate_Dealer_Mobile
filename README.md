# SM Associate Cars — Mobile App

> **Build status:** This app targets Expo SDK 57, React 19.2.3, and React Native 0.86.3. TypeScript and Expo configuration checks run in GitHub Actions. Always check the latest [Mobile quality checks](https://github.com/NavanethaKrishnan-14/SM_Associate_Dealer_Mobile/actions) before treating a commit as build-ready. A physical Android-device test is still required.


Premium dark/glass car buying and selling marketplace built with React Native and Expo.

## Included flows

- Welcome splash → role selection (Customer / Dealer) → sign in or account creation.
- Customer/dealer authentication uses the shared backend and securely stored session tokens. Dealer inventory, favourites, customer enquiries, test-drive requests, sell-car leads, vehicle expenses, and sales/profit records use the shared backend endpoints.
- Customer marketplace: search, category filters, car detail/specifications, saved cars, up to three comparison selections, seller enquiries, test-drive requests, listing creation and moderation status.
- Dealer workspace: backend-backed inventory, enquiry/test-drive status, vehicle expenses, sales records, and backend-calculated profit. Subscription plans are informational until server-side plan enforcement and payment integration are completed.
- Admin access is deliberately not offered as public registration. Admin moderation and plan control require a protected backend/admin interface, as described in the product flow.
- Dealer listing photos upload through the authenticated backend multipart endpoint; failed photo uploads are reported without discarding the created draft.
- Loading and error feedback, empty states, vehicle safety disclaimer, and sign-out confirmation.

## Run locally

Use Node.js 22.13.x or newer, as required by Expo SDK 57.

```bash
npm install
npx expo start
```

For Android: `npx expo start --android`

## Live backend connection

The app has a shared API client matching the backend contract for customer/dealer registration, sign-in, secure session storage, token refresh, session restore and public car browsing. Home/Search inventory is fetched from `GET /api/v1/cars`; if the API returns no vehicles or cannot be reached, the app does not show bundled sample inventory.

Set `EXPO_PUBLIC_API_BASE_URL` in your local `.env` file if your deployed API domain differs from the configured default. Include the `/api/v1` suffix. For a physical Android phone using a local backend, use your PC's LAN IP (for example `http://192.168.1.10:5000/api/v1`), not `localhost`.

Install and start with:

```powershell
npm install
npx expo start --clear
```

See `docs/BACKEND_CONNECTION.md` for setup notes and current implementation boundaries.

## Remaining production requirements

- Confirm live Vercel health, marketplace, authentication, image-upload, expenses and sales endpoints using a test account.
- Complete physical Android testing (login, session restore, listing creation, photos, expenses, sales, and logout).
- Implement password recovery and configure/test Google/Facebook OAuth; these flows must not claim success unless the backend verifies them.
- Add server-side subscription enforcement and payment processing before displaying a plan as active. Current plan cards are informational only.
- The app does not seed fake marketplace cars when the API is empty or unavailable; it should show an empty/error state instead.

## Subscription policy

- Customer Free: up to 5 listings.
- Dealer: up to 10 listings before a paid plan is required.
- Dealer Pro: ₹1,999/month, with 200 included listings plus unlimited additional listings.
- Only Admin may create plans or change plan prices and limits.

The policy above describes the intended business rules; they are not enforced by the mobile client alone. Do not mark a plan paid or active until the backend verifies payment and entitlement.
