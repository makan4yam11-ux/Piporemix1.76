# Overview

Pipo is a mobile-first productivity companion application featuring an interactive penguin mascot. It helps users manage tasks, reminders, calendar events, and journal entries through text and voice interactions. The application emphasizes an engaging, child-safe user experience with an interactive Main Menu, streak tracking, and a comprehensive suite of productivity tools, aiming to be a friendly and efficient personal assistant.

# User Preferences

- **Communication Style**: Simple, everyday language.
- **Language Matching Behavior**: Always respond in the same language the user uses in each message.
  - Automatically detect the user's language for each message
  - Reply in the exact same language (Indonesian → Indonesian, English → English, etc.)
  - If user mixes languages, match the tone and language naturally
  - Seamlessly switch response language when the user changes language mid-conversation
  - Maintain conversational continuity and context across messages like ChatGPT
  - Never translate unless explicitly asked
  - Tone: Friendly, helpful, and adaptive to user's communication style

# System Architecture

## Frontend
- **Framework**: React 18 with TypeScript and Vite.
- **UI Components**: Shadcn/UI built with Radix UI, styled with Tailwind CSS.
- **Design**: Mobile-first responsive, child-first philosophy with bright colors, rounded corners, and soft gradients.
- **Typography**: Inter font family.
- **Navigation**: Glass-effect bottom navigation with micro-interactions.
- **Responsiveness**: All UI elements use `clamp()`, `vh`, `vw`, and percentage-based sizing for proportional scaling.
- **Loading Screen**: Journey-themed loading experience with Pipo running from a road to a house. Features smooth linear progress, pastel road/house illustrations, and a running Pipo animation that follows the loading progress. The screen conveys "I'm on my way home" feeling.

## Backend
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript.
- **API**: RESTful API with JSON responses.

## Data Storage
- **ORM**: Drizzle ORM.
- **Database**: PostgreSQL (Neon Database).
- **Schema**: Shared definitions using Drizzle Zod, managed with Drizzle Kit migrations.

## Authentication & Session Management
- **Session**: PostgreSQL session store using `connect-pg-simple`.
- **User Management**: Simple user system with streak tracking and demo mode.

## Key Features
- **Interactive Main Menu**: Visual room-based navigation with clickable hotspots linking to app sections.
- **Chat System**: Rule-based conversational engine with warm, child-safe responses. Features mood-based reply selection (happy, sad, calm, unsure, tired, angry, neutral), natural typing delays (900ms), and reassurance messages. No AI API required - works on Replit Free tier.
- **Voice Recognition**: Browser-based speech recognition supporting 10 languages.
- **Centralized Language Control**: Separate global UI language (10 languages) and independent speech-to-text language settings for flexibility.
- **Productivity Tools**: Integrated reminders, todos, calendar events, and journal entries with 24-hour time format.
- **Photo Journal**: Calm, emotionally safe journaling with warm color scheme (#FDF8F3 background, #B8E0D2 mint accents, #5D4E37 text), mood tracking, and rounded card design.
- **Calendar Views**: List, Daily Timeline, and Monthly Grid views with full internationalization and optional Fixed Time Mode for timezone consistency.
- **Streak System**: Gamification for daily journaling.
- **Mobile Navigation**: Tab-based bottom navigation with badge notifications.
- **Auto-Creation Patterns**: Enhanced pattern recognition for creating tasks from chat, supporting Indonesian language and time expressions.
- **History Sub-Page**: Child-safe, anti-manipulation history view showing completed activities in a calm, scrapbook-style timeline. Features grouped by day/week, read-only pastel activity cards, and emotionally supportive messaging. Accessible from To-Do Space and Account settings.

# External Dependencies

- **Database**: Neon Database (PostgreSQL).
- **UI Primitives**: Radix UI.
- **Icons**: Lucide React.
- **Date Handling**: date-fns.
- **Voice Input**: Browser Web Speech API.
- **File Upload**: Multer.
- **Session Management**: connect-pg-simple.
- **Payment Processing**: Stripe integration with `stripe-replit-sync`.