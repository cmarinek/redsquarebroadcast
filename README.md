# Red Square - Digital Broadcasting Platform

Red Square is a platform that democratizes access to screen-based advertising. It allows the public to upload media content to nearby digital screens via a hardware dongle or smart TV app. Users can find, schedule, and pay for time slots to broadcast their content. Screen owners earn income from renting out their screen space.

## Features

- **Screen Discovery**: Find screens nearby or via search methods
- **Content Scheduling**: Upload and schedule images, videos, and GIFs for broadcast
- **Monetization**: Revenue split system for screen owners and platform
- **Multi-platform Support**: Web, mobile, and smart TV applications

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Development Setup

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Tech Stack

This project is built with:

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Database, Auth, Storage, Edge Functions)
- **Mobile**: Capacitor (iOS/Android)
- **Maps**: Mapbox for screen discovery
- **Payments**: Stripe integration

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── contexts/           # React contexts
├── utils/              # Utility functions
├── integrations/       # External service integrations
└── types/              # TypeScript type definitions
```

## Key Components

- **User Features**: Content upload, scheduling, payment processing
- **Screen Owner Features**: Screen registration, availability management, revenue tracking
- **Admin Features**: Platform management, analytics, user management
- **Mobile Apps**: Native iOS/Android applications via Capacitor

## Database

The platform uses Supabase as the backend with:
- User authentication and profiles
- Screen registration and management
- Content storage and scheduling
- Payment processing and revenue tracking
- Real-time updates for live content delivery

## Deployment

### Web Application

1. Build the project:
   ```sh
   npm run build
   ```

2. Deploy the `dist` folder to your hosting provider

### Mobile Applications

#### Android

1. Add Android platform:
   ```sh
   npx cap add android
   ```

2. Build and sync:
   ```sh
   npm run build
   npx cap sync android
   ```

3. Open in Android Studio:
   ```sh
   npx cap open android
   ```

#### iOS

1. Add iOS platform:
   ```sh
   npx cap add ios
   ```

2. Build and sync:
   ```sh
   npm run build
   npx cap sync ios
   ```

3. Open in Xcode:
   ```sh
   npx cap open ios
   ```

## Environment Variables

Create a `.env` file with:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.