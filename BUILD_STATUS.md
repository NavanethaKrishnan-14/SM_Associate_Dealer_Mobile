# Build and integration status

- Repository was empty at the start of implementation; this is a fresh Expo mobile project on `main`.
- TSX source passed TypeScript parsing/transpilation syntax checks in the authoring environment.
- Dependency installation repeatedly timed out, so `expo-doctor`, Android build, and device/runtime checks have not been completed.
- Live authentication is optional via `EXPO_PUBLIC_API_BASE_URL`; check backend paths and token shape before connecting production.
- Demo-mode listings, enquiries, photos, leads, expenses, and sales are locally held; they are not synced to a backend until API integrations are implemented.
- Image selection is provided, but uploaded media must go through server-authorized ImageKit upload. No private media key belongs in the mobile app.
- Subscription plan amounts are informational proposals only. Payment verification and protected admin functions require a backend.
