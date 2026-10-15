# Build and integration status

- Repository was empty at the start of implementation; this is a fresh Expo mobile project on `main`.
- TSX source passed TypeScript parsing/transpilation syntax checks in the authoring environment.
- Dependency installation repeatedly timed out, so `expo-doctor`, Android build, and device/runtime checks have not been completed.
- The default API base URL is `https://sm-associate-dealer-backend-sand.vercel.app/api/v1`; it can be overridden with `EXPO_PUBLIC_API_BASE_URL`.
- The mobile app now connects to backend auth/session endpoints, the public car marketplace, customer favourites, dealer inventory and image uploads, sell-car requests, customer enquiries and test-drive requests.
- Dealer enquiries and test drives load from the backend, and their statuses can be updated from the dealer workspace.
- Dealer vehicle expenses and sales/profit are persisted in MongoDB through the backend rather than only in local app state.
- Listing reports are submitted to the backend for admin review.
- Password recovery is not implemented server-side yet. Google/Facebook sign-in remains a demo-only flow until OAuth credentials and callbacks are configured.
- Subscription plan amounts remain informational; payment processing and subscription activation need a payment provider and server-side verification.
- GitHub CI verifies TypeScript/configuration only; a real Vercel runtime check, MongoDB connectivity, Android build, and device testing are still required before claiming end-to-end production verification.


## Expo SDK 57 status (2026-10-14)

- `package.json` targets Expo `~57.0.28`, React `19.2.3`, and React Native `0.86.3`, matching the SDK 57 compatibility table.
- `app.json` does not pin `sdkVersion`; Expo resolves SDK from the installed `expo` package.
- The Expo SDK core versions have been updated on `main`. The previously configured `~57.0.38` does not exist on npm; it has been corrected to the published SDK 57 release `~57.0.28`. Existing Expo modules still carry older SDK versions and must be aligned using `npx expo install --fix` after `npm install`.
- No lockfile is currently tracked in the repository. Commit the generated lockfile after dependency resolution so installs are reproducible.
- Dependency installation, Expo Doctor, Android build, and device/runtime verification have not been completed in this environment.


## Follow-up fixes (2026-10-14)

- Fixed TypeScript errors in `App.tsx`: added enquiry message state, included `enquiry` in the modal state union, added the missing back-button style, removed the module-scope `width` reference, and replaced the unsupported `StyleSheet.absoluteFillObject` with `StyleSheet.absoluteFill`.
- Removed the `newArchEnabled` and `splash` keys that Expo Doctor reported as invalid for this SDK's app config schema.
- Aligned Expo module and tooling versions to the SDK 57 versions reported by `expo install --fix`, and added the required `expo-font` peer dependency for `@expo/vector-icons`.
- These source/config fixes are committed to `main`. The user's local install reported 22 npm audit vulnerabilities; those require a fresh `npm audit` report and dependency-by-dependency review. No claim is made that the app build has passed until the commands are rerun locally.
