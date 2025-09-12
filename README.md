# Red Square Platform

Red Square is a unified digital broadcasting platform that democratizes access to screen-based advertising. It connects screen owners with advertisers through a comprehensive ecosystem of applications.

## 🏗️ Architecture Overview

This codebase serves as the foundation for multiple Red Square applications:

### **Main Platform** (Web & Mobile)
- **Web App**: Full-featured platform accessible at `/` 
- **Mobile App**: Native iOS/Android apps using Capacitor
- **User Types**: Advertisers, Broadcasters, Screen Owners, Admins

### **Screen Applications** 
- Android TV, iOS, Windows, macOS, Linux
- Amazon Fire TV, Roku, Samsung Tizen, LG webOS
- Smart TV apps and desktop screen applications

## 🎯 Key Features

### For Advertisers & Broadcasters
- **Screen Discovery**: Interactive map-based screen finding
- **Content Upload**: Support for video, images, GIFs
- **Campaign Management**: Scheduling and analytics
- **Payment Integration**: Stripe-powered transactions

### For Screen Owners
- **Screen Registration**: Easy QR code-based setup
- **Revenue Management**: Earnings tracking and payouts
- **Availability Control**: Time slots and pricing management
- **Content Approval**: Moderation workflows

### For Administrators
- **Platform Analytics**: Real-time system monitoring
- **Build Management**: Multi-platform app deployment
- **User Management**: Role-based access control
- **Security Center**: Compliance and monitoring

## 🚀 Multi-Target Build System

The platform supports multiple build targets from a single codebase:

### Build Targets
```bash
# Web platform (default)
npm run build

# Mobile apps
VITE_BUILD_TARGET=mobile npm run build

# Screen applications  
VITE_BUILD_TARGET=screen npm run build

# All targets
node scripts/build-targets.js all
```

### Supported Platforms
- **Web**: Progressive Web App with offline support
- **Mobile**: iOS and Android native apps via Capacitor
- **Smart TVs**: Android TV, Fire TV, Tizen, webOS, Roku
- **Desktop**: Windows, macOS, Linux screen applications

## 📱 Development Setup

### Prerequisites
- Node.js 20+
- Git
- Supabase CLI (for database changes)

### Quick Start
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:8080
```

### Mobile Development
```bash
# Add mobile platforms
npx cap add ios
npx cap add android

# Build and sync
npm run build
npx cap sync

# Run on device/emulator
npx cap run ios
npx cap run android
```

## 🏢 Environment Configuration

The platform automatically adapts based on build target and environment:

### Environment Detection
- **Mobile Apps**: Capacitor detection + native features
- **Web Apps**: Full browser features + PWA capabilities
- **Screen Apps**: Optimized UI for large displays

### Configuration Files
- `src/config/environment.ts` - Environment detection and feature flags
- `capacitor.config.ts` - Mobile app configuration
- `vite.config.ts` - Build system configuration

## 🗄️ Database Architecture

### Core Tables
- `profiles` - User accounts and basic info
- `user_roles` - Role-based access control
- `screens` - Screen registration and management
- `bookings` - Content scheduling and reservations
- `payments` - Transaction records

### Real-time Features
- Live booking updates
- Screen availability changes
- Admin notifications
- Build status monitoring

## 🔒 Security & Compliance

### Row Level Security (RLS)
- All tables protected with RLS policies
- User isolation and admin access controls
- API rate limiting and abuse prevention

### Authentication
- Supabase Auth with email/social login
- JWT-based session management
- Role-based route protection

## 🚀 Deployment

### Automated Builds
GitHub Actions automatically build and deploy:
- **Web Platform**: Lovable hosting + CDN
- **Mobile Apps**: App Store & Play Store releases
- **Screen Apps**: Multi-platform distribution

### Build Artifacts
- **APK/IPA files**: Mobile app packages
- **TV Apps**: Platform-specific packages
- **Desktop Apps**: Cross-platform installers

## 📊 Monitoring & Analytics

### Performance Monitoring
- Web vitals tracking
- Error reporting and alerting
- Build system health checks
- Real-time usage analytics

### Admin Dashboard
- Platform-wide metrics
- User activity monitoring
- Revenue and transaction tracking
- Security alert management

## 🤝 Contributing

### Development Workflow
1. Create feature branches from `main`
2. Use conventional commit messages
3. Test across web and mobile targets
4. Submit PR with comprehensive description

### Code Standards
- TypeScript for type safety
- Tailwind CSS with design tokens
- Component-based architecture
- Comprehensive error handling

## 📚 Documentation

- **API Documentation**: Available in admin panel
- **User Guides**: Built-in help system
- **Developer Docs**: See `/docs` directory
- **Build Guides**: Platform-specific setup instructions

## 📞 Support

For technical support or questions:
- **Platform Issues**: Admin dashboard support system
- **Build Problems**: Check GitHub Actions logs
- **General Help**: Built-in help system

---

**Red Square Platform** - Democratizing digital advertising, one screen at a time.

---

## Legacy Build Instructions (Android TV)

### Android TV (Capacitor) — Build APK

Follow these one-time steps to produce an installable Android TV APK:

1) **Export & clone**
   - Export this project to your GitHub, then clone locally.

2) **Install and build web assets**
   ```bash
   npm install
   npm run build
   ```

3) **Add Android platform (Capacitor)**
   ```bash
   npx cap add android
   ```

4) **Update AndroidManifest for TV**
   Edit `android/app/src/main/AndroidManifest.xml` and ensure:

   ```xml
   <manifest ...>
     <uses-feature android:name="android.software.leanback" android:required="true" />
     <uses-feature android:name="android.hardware.touchscreen" android:required="false" />
     <uses-feature android:name="android.hardware.telephony" android:required="false" />
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
         <intent-filter>
           <action android:name="android.intent.action.MAIN" />
           <category android:name="android.intent.category.LAUNCHER" />
         </intent-filter>
       </activity>
     </application>
   </manifest>
   ```

5) **Sync native project**
   ```bash
   npx cap sync android
   ```

6) **Run on device/emulator**
   ```bash
   npx cap run android
   ```

7) **Build APK in Android Studio**
   - Open `android/` in Android Studio
   - Build > Generate Signed Bundle/APK… (or Build APKs for debug)

**Notes:**
- Always run `npx cap sync` after pulling changes
- For detailed mobile guide, read: https://lovable.dev/blogs/TODO