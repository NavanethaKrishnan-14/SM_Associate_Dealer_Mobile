# Build and integration status

- Repository was empty at the start of implementation; this is a fresh Expo mobile project on `main`.
- TSX source passed TypeScript parsing/transpilation syntax checks in the authoring environment.
- Dependency installation repeatedly timed out, so `expo-doctor`, Android build, and device/runtime checks have not been completed.
- Live authentication is optional via `EXPO_PUBLIC_API_BASE_URL`; check backend paths and token shape before connecting production.
- Demo-mode listings, enquiries, photos, leads, expenses, and sales are locally held; they are not synced to a backend until API integrations are implemented.
- Image selection is provided, but uploaded media must go through server-authorized ImageKit upload. No private media key belongs in the mobile app.
- Subscription plan amounts are informational proposals only. Payment verification and protected admin functions require a backend.


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
