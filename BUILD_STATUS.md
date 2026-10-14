# Build and integration status

- Repository was empty at the start of implementation; this is a fresh Expo mobile project on `main`.
- TSX source passed TypeScript parsing/transpilation syntax checks in the authoring environment.
- Dependency installation repeatedly timed out, so `expo-doctor`, Android build, and device/runtime checks have not been completed.
- Live authentication is optional via `EXPO_PUBLIC_API_BASE_URL`; check backend paths and token shape before connecting production.
- Demo-mode listings, enquiries, photos, leads, expenses, and sales are locally held; they are not synced to a backend until API integrations are implemented.
- Image selection is provided, but uploaded media must go through server-authorized ImageKit upload. No private media key belongs in the mobile app.
- Subscription plan amounts are informational proposals only. Payment verification and protected admin functions require a backend.


## Expo SDK 58 status (2026-10-14)

- `package.json` now opts into the Expo `next` distribution for SDK 58 beta; React is set to `19.3.0` and React Native to `0.88.0`, matching the published SDK 58 reference.
- `app.json` does not pin `sdkVersion`; Expo resolves SDK from the installed `expo` package.
- SDK 58 is still listed as beta in Expo's changelog. This repository update is therefore a beta opt-in.
- Expo SDK package versions and the npm lockfile still need to be resolved with `npx expo install --fix` after installing dependencies; Android build/runtime verification has not been completed in this environment.
