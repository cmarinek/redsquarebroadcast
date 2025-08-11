import React from "react";
import {
  Shield,
  Zap,
  CreditCard,
  Monitor,
  Smartphone,
  Wifi,
  Database,
  Cloud,
  BarChart3,
  Globe,
  Bell,
  Lock,
} from "lucide-react";

export type PhaseItem = {
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  tasks: string[];
  estimated?: string;
};

export type Phase = {
  phase: string;
  duration: string;
  priority: string;
  status: string;
  progress: number; // 0-100
  items: PhaseItem[];
};

export const phases: Phase[] = [
  {
    phase: "Phase 1: Core Infrastructure",
    duration: "4-6 weeks",
    priority: "Critical",
    status: "Completed",
    progress: 100,
    items: [
      {
        category: "Authentication & Authorization",
        icon: Shield,
        tasks: [
          "Implement Supabase Auth with email/password",
          "Add OAuth providers (Google, Apple, Facebook)",
          "Create user roles (screen_owner, broadcaster, admin)",
          "Implement Row Level Security (RLS) policies",
          "Add email verification and password reset",
        ],
        estimated: "1-2 weeks",
      },
      {
        category: "Real-time Architecture",
        icon: Zap,
        tasks: [
          "Set up Supabase Realtime for live updates",
          "Implement screen status broadcasting",
          "Add live booking availability updates",
          "Create WebSocket connections for hardware",
          "Build event-driven content scheduling",
        ],
        estimated: "2-3 weeks",
      },
      {
        category: "Payment Processing",
        icon: CreditCard,
        tasks: [
          "Integrate Stripe for payment processing",
          "Implement subscription models for screen owners",
          "Add automated revenue splitting",
          "Create payout scheduling system",
          "Build invoice and receipt generation",
        ],
        estimated: "2-3 weeks",
      },
    ],
  },
  {
    phase: "Phase 2: Hardware Integration",
    duration: "6-8 weeks",
    priority: "High",
    status: "Planning",
    progress: 0,
    items: [
      {
        category: "Dongle Hardware",
        icon: Monitor,
        tasks: [
          "Develop custom Android TV OS for dongles",
          "Implement secure device provisioning",
          "Create automatic content sync and playback",
          "Add remote monitoring and health checks",
          "Build OTA (Over-The-Air) update system",
        ],
        estimated: "4-5 weeks",
      },
      {
        category: "TV Platform Readiness",
        icon: Smartphone,
        tasks: [
          "Shared Player SDK (TypeScript) for all TV platforms",
          "Pairing/device-code flow + QR deep link",
          "HLS/DASH manifest ingestion and playback",
          "Remote control protocol (play/pause/volume/swap)",
          "Web TV Player v1 (browser-based TV client)",
        ],
        estimated: "2-3 weeks",
      },
      {
        category: "Device Management",
        icon: Wifi,
        tasks: [
          "Create device registration flow",
          "Implement remote diagnostics",
          "Add bandwidth monitoring",
          "Build content caching system",
          "Create device grouping and management",
        ],
        estimated: "2-3 weeks",
      },
    ],
  },
  {
    phase: "Phase 3: Native TV Apps",
    duration: "4-6 weeks",
    priority: "High",
    status: "Planning",
    progress: 0,
    items: [
      {
        category: "Native Apps Delivery",
        icon: Smartphone,
        tasks: [
          "Samsung Tizen (.wgt) app",
          "LG webOS (.ipk) app",
          "Android TV app (Capacitor/Native)",
          "Apple tvOS app (Swift/TVMLKit)",
          "Shared settings & analytics",
        ],
        estimated: "3-4 weeks",
      },
      {
        category: "Store & Certification",
        icon: Globe, // Will be provided via type suppression below
        tasks: [
          "Samsung Seller Office listing & certification",
          "LG Seller Lounge packaging & QA",
          "Google Play (Android TV) requirements",
          "Apple App Store (tvOS) guidelines",
          "Device-specific QA and publishing",
        ],
        estimated: "2-3 weeks",
      },
      {
        category: "Remote Control & Updates",
        icon: Wifi,
        tasks: [
          "Bind remote commands to Player SDK",
          "In-app updates/OTA hooks where supported",
          "Crash reporting and telemetry",
          "A/B slot test hooks",
          "Playback health metrics",
        ],
        estimated: "2-3 weeks",
      },
    ],
  },
  {
    phase: "Phase 4: Scalability & Performance",
    duration: "4-6 weeks",
    priority: "High",
    status: "In Progress",
    progress: 90,
    items: [
      {
        category: "Database Optimization",
        icon: Database,
        tasks: [
          "Implement database indexing strategy",
          "Add read replicas for geographic distribution",
          "Create data archiving for old bookings",
          "Optimize queries with materialized views",
          "Add database connection pooling",
        ],
        estimated: "2-3 weeks",
      },
      {
        category: "CDN & Media Delivery",
        icon: Cloud,
        tasks: [
          "Set up global CDN for content delivery",
          "Implement adaptive streaming for videos",
          "Add image optimization and compression",
          "Create edge caching strategies",
          "Build progressive content loading",
        ],
        estimated: "2-3 weeks",
      },
      {
        category: "Load Balancing",
        icon: BarChart3,
        tasks: [
          "Implement horizontal scaling with load balancers",
          "Add auto-scaling based on traffic",
          "Create geographic traffic routing",
          "Set up health checks and failover",
          "Optimize API rate limiting",
        ],
        estimated: "1-2 weeks",
      },
      {
        category: "Status Update (App-side implemented)",
        icon: Bell,
        tasks: [
          "Cron jobs: perf-alerts hourly, system-health 10m, retention 02:00 UTC, MV refresh 15m",
          "Web Vitals telemetry sampling wired to Supabase",
          "Frontend error reporting with batching to Supabase",
          "RLS hardening and MV access restrictions",
        ],
        estimated: "Done",
      },
      {
        category: "Remaining (External Infra)",
        icon: Globe,
        tasks: [
          "Provision read replicas in Supabase and test failover",
          "Configure global CDN for Supabase Storage/media",
          "Set up load balancer and autoscaling for frontend hosting",
          "Enable geo routing and health checks at edge",
          "Tune connection pooling (PgBouncer) for high concurrency",
        ],
        estimated: "Ops window",
      },
    ],
  },
  {
    phase: "Phase 5: Monetization & Revenue",
    duration: "3-4 weeks",
    priority: "High",
    status: "Completed",
    progress: 100,
    items: [
      {
        category: "Payments & Checkout",
        icon: CreditCard,
        tasks: [
          "Stripe checkout for one-off bookings",
          "Payment verification without webhooks",
          "Subscription flow and customer portal",
        ],
        estimated: "1-2 weeks",
      },
      {
        category: "Pricing & Revenue Split",
        icon: BarChart3,
        tasks: [
          "Per-screen pricing and currency settings",
          "Configurable platform fee percentage",
          "Owner earnings calculation",
        ],
        estimated: "1 week",
      },
      {
        category: "Payouts & Notifications",
        icon: Bell,
        tasks: [
          "Payout requests and history dashboard",
          "Email receipts for successful payments",
          "Admin monetization controls",
        ],
        estimated: "1 week",
      },
    ],
  },
  {
    phase: "Phase 6: Monitoring & Operations",
    duration: "3-4 weeks",
    priority: "Medium",
    status: "Completed",
    progress: 100,
    items: [
      {
        category: "Observability",
        icon: Bell,
        tasks: [
          "Set up comprehensive logging with structured data",
          "Implement error tracking and alerting",
          "Add performance monitoring and APM",
          "Create business metrics dashboards",
          "Build automated incident response",
        ],
        estimated: "2-3 weeks",
      },
      {
        category: "Security & Compliance",
        icon: Lock,
        tasks: [
          "Implement security scanning and vulnerability assessment",
          "Add GDPR compliance features",
          "Create audit logging for all actions",
          "Set up penetration testing pipeline",
          "Build data encryption at rest and in transit",
        ],
        estimated: "2-3 weeks",
      },
    ],
  },
];

// Helper: pick the current phase (prefers status In Progress, otherwise first with progress > 0, else first)
export function getCurrentPhase(list: Phase[] = phases): Phase {
  return (
    list.find((p) => p.status.toLowerCase() === "in progress") ||
    list.find((p) => (p.progress || 0) > 0) ||
    list[0]
  );
}

// Helper: flatten tasks for a phase and return first N (default 6) for concise display
export function getRemainingTasks(phase: Phase, limit = 6): string[] {
  const tasks = phase.items.flatMap((i) => i.tasks);
  return tasks.slice(0, limit);
}
