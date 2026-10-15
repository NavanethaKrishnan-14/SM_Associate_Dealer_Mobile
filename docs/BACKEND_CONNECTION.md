# Backend connection notes

Mobile app: https://github.com/NavanethaKrishnan-14/SM_Associate_Dealer_Mobile
Backend: https://github.com/NavanethaKrishnan-14/SM_Associate_Dealer_backend

The mobile application uses the shared REST API with the `/api/v1` prefix. The backend GitHub repository homepage is configured as `https://sm-associate-dealer-backend-sand.vercel.app`; this is the default used by the mobile client, but the production health endpoint has not yet been confirmed reachable from this environment. Configure `EXPO_PUBLIC_API_BASE_URL` in an ignored local `.env` file; do not store passwords, JWT secrets, or MongoDB credentials in the mobile repo.

## Wired API contract

- `POST /auth/login`: `{ identifier, password, role }`
- `POST /auth/register/customer`: `{ name, phone, email?, password, confirmPassword? }`
- `POST /auth/register/dealer`: same fields plus `businessName, city`
- `GET /auth/me`: restores the signed-in user with a Bearer access token
- `POST /auth/refresh`: rotates the refresh token and returns both tokens
- `POST /auth/logout`: revokes the refresh token
- `GET /cars`: public vehicle browse/search helper
- `GET /favorites`, `POST /favorites`, `DELETE /favorites/:carId`: customer favourites
- `POST /enquiries`, `GET /enquiries/me`: customer enquiries
- `POST /test-drives`: customer test-drive requests
- `POST /sell-car-requests`: seller intake lead
- `GET /dealer/cars`, `POST /dealer/cars`, `PATCH /dealer/cars/:id/status`: dealer inventory
- `POST /dealer/cars/:carId/images`: authenticated dealer photo upload

Access and refresh tokens use Expo SecureStore, not AsyncStorage. Authenticated API requests attach a Bearer token and attempt one refresh after a 401 response.

## Run locally

1. Verify the URL in `.env`. A physical phone cannot reach a PC's API using `localhost`; use the PC LAN IP.
2. Run `npm install`.
3. Run `npx expo start --clear`.
4. Register/sign in with a test account and confirm the account role matches the selected Customer or Dealer card.

## Remaining integration boundary

Marketplace screen state, favourite toggles, dealer inventory, enquiries, test drives, photos and financial/expense dashboards are not all fully API-backed yet; do not treat their local demo state as production data. The backend's mobile endpoint map is documented in its `docs/MOBILE_API_IMPLEMENTATION_MAP.md`. The backend does not currently provide full dealer purchase/acquisition accounting or a dedicated expenses/profit ledger. Forgot-password and Google/Facebook OAuth are not supported by this backend, so those controls explain that they are not configured instead of faking a successful login.
