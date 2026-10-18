# Mobile Google and Facebook sign-in setup

The mobile app starts provider authorization, sends the resulting provider token to the shared backend, and stores only the backend-issued SM Associate access/refresh tokens in Expo SecureStore. Provider sign-in cannot succeed until provider applications and production environment variables are configured.

## 1. Mobile environment

Copy `.env.example` to `.env` and set:

- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- `EXPO_PUBLIC_FACEBOOK_APP_ID`
- `EXPO_PUBLIC_API_BASE_URL`

Use the OAuth client IDs from the same Google Cloud project. Register Android package `com.smassociate.cars` and its signing certificate fingerprints in Google Cloud Console. Configure the iOS bundle identifier `com.smassociate.cars` if shipping iOS. Include the Web OAuth client ID because the backend validates the Google ID token audience against `GOOGLE_CLIENT_IDS`.

## 2. Backend environment

Set these variables in the deployed backend's environment settings and redeploy:

- `GOOGLE_CLIENT_IDS`: comma-separated list containing the Web, Android and iOS Google client IDs used by the mobile app.
- `FACEBOOK_APP_ID`: the same Facebook App ID used by the mobile app.
- `FACEBOOK_APP_SECRET`: Facebook App Secret; backend only. Never add it to the mobile repo or an `EXPO_PUBLIC_*` variable.
- Keep `MONGODB_URI` and `JWT_ACCESS_SECRET` correctly configured.

The backend verifies Google ID tokens with Google's token information endpoint and verifies Facebook access tokens with Meta before issuing its own session. A provider token is never accepted as an SM Associate API bearer token.

## 3. Provider console configuration

**Google:** Configure the OAuth consent screen and client IDs, Android package and SHA certificate fingerprints. Test with an installed development/production build and an account permitted by the consent-screen publishing mode.

**Facebook:** Configure the Meta app, Facebook Login product, allowed OAuth redirect URI(s) matching the app redirect, package/bundle identifiers and app mode/test users. Complete any required app review before public launch.

## 4. Rebuild and test

After changing public Expo variables, restart Metro with cache cleared and rebuild the native app; public environment variables are bundled into the app. Verify both Customer and Dealer roles. For Dealer first sign-in, provide business name and city; the resulting dealer profile is pending verification.

Expected checks:
- Successful provider authorization creates or loads the provider-linked account and stores backend-issued tokens.
- Choosing a different role for an existing provider-linked account returns a clear role mismatch.
- An email already linked to a password account is not silently linked to a social identity.
- Invalid, expired, wrong-audience or unverified provider tokens are rejected by the backend.
- Missing provider configuration returns a clear setup error, not a fake/demo login.

Do not use dummy tokens or demo sessions in production.
