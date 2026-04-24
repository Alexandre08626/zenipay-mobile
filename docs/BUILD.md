# ZeniPay mobile — build + submit

The Expo app for ZeniPay. Consumes the same `/api/v1/*` surface as the
web dashboard (`https://zenipay.ca`) and authenticates via Supabase
Auth.

## 0. Prereqs

```bash
npm i -g eas-cli
eas login
# First time per project:
eas init
```

You'll also need:

- Apple Developer program membership + App Store Connect app record (set `ascAppId` + `appleTeamId` in `eas.json → submit.production.ios`).
- Google Play console account + a service-account JSON key with *Release Manager* role (save as `./google-play-key.json`, already git-ignored).

## 1. Env

Copy `.env.example` → `.env` and fill in the Supabase values.

```bash
cp .env.example .env
# then edit .env
```

EAS reads `EXPO_PUBLIC_*` at build time — no secrets go into the binary
beyond the Supabase **anon** key (which is public by design).

## 2. Local development

```bash
npx expo start --clear
```

Open Expo Go on your iOS or Android device and scan the QR code. The
app will log in against prod `zenipay.ca` by default; override with
`EXPO_PUBLIC_API_BASE_URL` in `.env` if you want to point at a
preview deploy.

## 3. Preview build (TestFlight + Android internal track)

```bash
eas build --platform all --profile preview
```

iOS → uploads an `.ipa` that EAS will register as a TestFlight build
if you've run `eas submit` once before. Android → downloadable `.apk`
installable on any device.

## 4. Production build

```bash
eas build --platform all --profile production
```

Pairs with `"autoIncrement": true` — the build number is bumped
automatically per submission. Retain the previous production binary
until the new one passes review.

## 5. Submit to stores

```bash
eas submit --platform all --profile production
```

- iOS: uploads to App Store Connect, where you finish metadata +
  push to TestFlight / App Review manually.
- Android: uploads to the `internal` track on Google Play. Promote
  through `internal` → `closed` → `open` → `production` in the
  console once Alex signs off.

## 6. Submitting updates

```bash
npx expo prebuild --clean    # only if you changed native config
eas build --platform all --profile production
eas submit --platform all --profile production
```

Over-the-air JS updates (no new store submission):

```bash
eas update --branch production
```

## Troubleshooting

- **Face ID won't prompt on simulator** — `Features → Face ID →
  Enrolled`, then re-run the app.
- **Supabase "Invalid JWT"** after a password change → clear the
  session from within the app (Settings → Sign out) or delete the
  Keychain entries for `zp_access_token` / `zp_refresh_token`.
- **401 on `/api/v1/agents/*`** — the agents-scoped org id isn't set
  yet. Log in once from the web dashboard to seed it, or add an
  `x-zp-agents-org` header in the mobile app's session.

## Versioning

- `app.json → expo.version` is user-visible (App Store "Version").
- `expo.ios.buildNumber` / `expo.android.versionCode` are the build
  numbers; bumped automatically by the `production` profile.
- Bump `expo.version` manually on every feature release.
