# 🏃‍♂️ TrailMates: Tactical Social Proximity Fitness Companion

**TrailMates** is a full-featured, real-time social proximity fitness companion designed for runners, cyclists, hikers, skateboarders, and outdoor athletes who co-train, compete, and share outdoor adventures. 

Styled with a high-contrast, premium **Cosmic Slate Theme** and built on a high-fidelity reactive architecture, the application integrates browser geolocation hardware, custom SVG vector avatars, physical camera overlays, concentric sonar radar matrices, and granular safety layers to deliver a modern, secure co-training space.

---

## 🗺️ System Modules & Key Capabilities

```
                  ┌──────────────────────────────────────────────┐
                  │          TRAILMATES CORE RUNTIME             │
                  └──────────────────────┬───────────────────────┘
                                         │
        ┌───────────────────┬────────────┴───────────┬───────────────────┐
        ▼                   ▼                        ▼                   ▼
┌──────────────┐    ┌──────────────┐         ┌──────────────┐    ┌──────────────┐
│  Social Feed │    │ Trail Matrix │         │ AR HUD Engine│    │ Safety Layer │
│  & Private   │    │  & GPX Core  │         │ & Sonar Grid │    │ & Challenger │
│  Messenger   │    │  (Map View)  │         │ (Live Portal)│    │ Relationship │
└──────────────┘    └──────────────┘         └──────────────┘    └──────────────┘
```

### 1. 🗣️ Social & Private Messenger Suite
* **Active Trail Lobby**: Live, high-visibility radar panel indexing all local athletes currently out on nearby trails tracking their GPS coordinates in real-time.
* **Sports Activity Composer**: A rich composer for posts with support for attaching sports categories (Running, Hiking, Biking, Mountain Biking, Skateboarding, Water Sports), importing custom maps, and adding local file attachments via browser `FileReader` pipelines.
* **Community Interactions**: Micro-animations for liking posts, typing interactive comment threads, and a quick-express emoji reaction bar to support friends' workouts.
* **Direct Private Chat**: A real-time direct message console built between connected users to coordinate runs, chat, and trigger direct training invites.

### 2. 🗺️ Trail Mapping & GPX Utility
* **Interactive Plotter Canvas**: Click-to-draw waypoint plotter built directly on top of the interactive maps canvas. Waypoints automatically calculate segments, total route distances, and difficulty levels (Easy, Moderate, Hard, Expert).
* **Live Elevation Profiler**: Smooth, interactive SVG route profile charts that map altitude curves and calculate cumulative elevation gain.
* **Checkpoint Photo Binding**: Select any specific coordinate point on a route's elevation bar to upload a local photograph of the terrain (e.g., trail blockage, beautiful viewpoint) and pin it to the map for other users.
* **GPX Import / Export Engine**: Full-fidelity parser that imports external Garmin/Strava standard `.gpx` tracks. You can also download any custom hand-plotted route as a formatted GPX XML file.
* **Live GPS Track Recorder**: High-accuracy mobile positioning recorder using browser geolocation hardware. For sandboxed and desktop development environments, the system features a high-fidelity GPS Track Simulator that mimics actual athletic movement along the path.

### 3. 🕶️ Augmented Reality HUD & Sonar Radar
* **AR Camera Overlays**: Leverages the client browser's video stream hardware to construct an augmented reality workspace. Custom athlete avatars are rendered directly on the viewport at real-world distance calculations and height elevations.
* **360° Swivel Compass Slider**: A custom compass dial bypasses browser sandbox orientation locks, allowing you to manually pan 360 degrees to find nearby partners.
* **Tactical Proximity Radar**: Concentric sonar tracker showing active partners within 25m, 50m, 75m, and 100m concentric rings. If they run closer, their avatar floats toward the sweep center in real-time.
* **Sprint Push! (Boost Modifier)**: Dynamic workout modifier simulating high-intensity sprints, which boosts distance rate, calories burned, and coordinates tracking.

### 4. 🛡️ Safety & Challenger Protection Layers
* **The Challenger Relationship System**: Replaces basic "follow" mechanics with distinct tiers:
  * **Mates/Friends**: Full access to private workouts, precise live proximity tracking, private direct messages, and co-training invitations.
  * **Challengers**: Purely competitive, high-score-only tier. Challengers can only see public posts and anonymous scores, and cannot message, see live locations, or send co-training requests.
* **Instant Blocker Portal**: Users can block any account, instantly isolating profiles, removing trace records from views, and restricting all communications.
* **Audiences Control**: Granular dropdown filters inside the composer allow users to tag individual posts as either **Public** or **Friends-Only**.

### 🎨 Modular Visual Avatar Builder
* **Vector SVG Composite Engine**: Dynamic, modular rendering engine that lets athletes build distinct digital representations of themselves:
  * **Body Type Selection**: Slim, Athletic, Muscular, or Average proportions.
  * **Organic Skin Tones & Hairstyles**: Customized pigments paired with sports hairstyles (Short, Long, Curly, or None).
  * **Performance Equipment**: Toggle helmets, polarizing shades, performance caps, headbands, or wireless airbuds to represent the athlete's style.

---

## 💻 Technical Stack

* **Frontend Framework**: React 18+ (TypeScript, Vite compiler)
* **Styling**: Tailwind CSS
* **Map & Location Platform**: Google Maps JavaScript API via `@vis.gl/react-google-maps`
* **Icon Framework**: `lucide-react`
* **Physical Hardware APIs**:
  * Browser Geolocation API (`navigator.geolocation`)
  * Media Capture Stream API (`navigator.mediaDevices.getUserMedia`)
  * Device Orientation API (`window.DeviceOrientationEvent`)
* **State Management**: Reactive in-memory state engine persisting to browser `localStorage` for responsive state reloading during sandbox testing.

---

## 🛠️ Verification & API Key Validation Guide

To ensure high-fidelity rendering, you can configure your **Google Maps Platform** credentials. If a key is missing or invalid, the application launches a beautiful, high-contrast **Interactive Compass Canvas Map Fallback** that maintains all features (such as manual plotting, GPS recording, waypoint clicks, and GPX parser exports) so testing is never blocked.

### Step 1: Confirm Google Maps Platform APIs
For optimal mapping, route calculations, and coordinates searching, make sure the following APIs are enabled in your [Google Cloud Console](https://console.cloud.google.com/):
1. **Maps JavaScript API** (For interactive rendering and vector maps)
2. **Places API (New)** (For geographic trailhead searching and coordinates querying)
3. **Directions API** (For optional routing pathways)

### Step 2: Set the Key in the Workspace Environment
Declare your API key in the `.env` file at the project root:
```env
# .env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyYourGoogleMapsPlatformKeyHere
```
*(Alternatively, the system checks for `GOOGLE_MAPS_PLATFORM_KEY` in environment variables).*

### Step 3: Validate API Keys
To verify if your key has the correct permissions:
* Check that **no HTTP restrictions** on your API key are blocking the development domain URL: `https://ais-dev-*.run.app` or `localhost:3000`.
* If you see map loading errors in the browser console, you may need to add the development and production domains to your Google Cloud Console API restrictions under **"HTTP Referrers"**.

---

## 🏃‍♂️ Developer Quick-Start

To run the application locally or run the build verification checks, use the following commands:

### Install Dependencies
```bash
npm install
```

### Run the Development Server
```bash
npm run dev
```
The server will boot on port `3000`. Open `http://localhost:3000` in your browser.

### Execute TypeScript Validation (Linter)
```bash
npm run lint
```

### Compile Production Build
```bash
npm run build
```
This compiles the fully optimized static assets inside the `/dist` directory.

---

## 📂 Codebase Anatomy

The codebase is highly modularized, separating layout routers, interactive state screens, and vector rendering modules:

```
├── /src
│   ├── /components
│   │   ├── AvatarBuilder.tsx      # Vector composite interface & sportswear customizer
│   │   ├── AvatarViewer.tsx       # Dynamic SVG generator outputting custom athletic proportions
│   │   ├── ChatView.tsx           # Real-time message threads and coordinate panels
│   │   ├── CreateRoute.tsx        # Drawing utility, GPS recorder, & GPX parser handler
│   │   ├── LandingScreen.tsx      # Landing page, secure credential matching, & guest signup
│   │   ├── LiveWorkout.tsx        # AR Camera viewport, tactical sonar concentric grid, & stats HUD
│   │   ├── MapView.tsx            # Discover Map dashboard with route filters & checkpoint media uploads
│   │   ├── PeopleConnections.tsx  # Interactive friend directories, demotion controls, and blocker portal
│   │   ├── ProfileScreen.tsx      # Core telemetry charts, account privacy configurations, & OAuth simulators
│   │   ├── SocialFeed.tsx         # Structured posts composer, likes, custom emoji reacts, and comments
│   │   └── SummaryScreen.tsx      # Post-session telemetry recap cards and feed publisher
│   ├── App.tsx                    # Shell layout and bottom navigation router
│   ├── index.css                  # Tailored Tailwind styling directives
│   ├── main.tsx                   # Main mount point
│   ├── mockData.ts                # Default dataset (Tovi, Leo, Trails, posts, relationships)
│   └── types.ts                   # Centralized TypeScript model schemas
├── package.json                   # Build configs, dependencies, and scripts
└── metadata.json                  # Sandbox permissions (camera, location)
```

---
*Created for the TrailMates community. Built for safety, performance, and companion-led co-training.*
