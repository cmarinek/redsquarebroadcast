# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/fa57035e-3e6a-41a8-925f-189bf7d71e9b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/fa57035e-3e6a-41a8-925f-189bf7d71e9b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/fa57035e-3e6a-41a8-925f-189bf7d71e9b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

---

## Android TV (Capacitor) — Build APK

Follow these one-time steps to produce an installable Android TV APK of the Smart TV app (/tv route):

1) Export & clone
- Export this project to your GitHub, then clone locally.

2) Install and build web assets
- npm install
- npm run build

3) Add Android platform (Capacitor)
- npx cap add android

4) Update AndroidManifest for TV
Edit android/app/src/main/AndroidManifest.xml and ensure:

```xml
<manifest ...>
  <uses-feature android:name="android.software.leanback" android:required="true" />
  <uses-feature android:name="android.hardware.touchscreen" android:required="false" />
  <uses-feature android:name="android.hardware.telephony" android:required="false" />
  <!-- Optional if you want strict D-Pad control -->
  <uses-feature android:name="android.hardware.gamepad" android:required="false" />

  <application
      android:banner="@mipmap/ic_launcher"
      android:icon="@mipmap/ic_launcher"
      ...>

    <activity
        android:name="com.getcapacitor.BridgeActivity"
        android:exported="true"
        android:launchMode="singleTask"
        android:screenOrientation="landscape">
      <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
      </intent-filter>
      <!-- Keep the standard launcher too if you want it visible on non-TV launchers -->
      <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
      </intent-filter>
    </activity>
  </application>
</manifest>
```

5) Sync native project
- npx cap sync android

6) Run on device/emulator
- npx cap run android

7) Build APK in Android Studio
- Open android/ in Android Studio
- Build > Generate Signed Bundle/APK… (or Build APKs for debug)

Optional: start directly on the TV UI (/tv)
If you want the app to open on the TV screen by default, add this tiny redirect near the top of src/main.tsx (before createRoot):

```ts
const isAndroidTV = /Android TV|BRAVIA|AFTT|AFTM|AFTS|AFTB|SMART-TV/i.test(navigator.userAgent);
if (isAndroidTV && !location.pathname.startsWith('/tv')) {
  history.replaceState(null, '', '/tv');
}
```

Notes
- Our Capacitor config already allows remote hot-reload (server.url) and cleartext traffic is enabled for dev.
- tvOS/Apple TV: Capacitor doesn’t target tvOS; ship a native tvOS shell or focus Android TV first.

After pulling changes, always run: npx cap sync
For a detailed mobile guide, read: https://lovable.dev/blogs/TODO

