# Video generator 

A complete React Native mobile app for creating social media content packages using Wiro AI APIs. Generate styled product photoshoots, promotional videos, and engaging captions - all from a single product image!

## Features

- **Product Photoshoots**: Generate multiple styled product photos with different backgrounds
- **Video Generation**: Create promotional videos using Sora 2 Pro
- **Caption Generation**: Generate engaging social media captions with hashtags
- **Real-time Polling**: Automatic status updates for all generation tasks
- **Beautiful UI**: Modern design with NativeWind/TailwindCSS
- **State Management**: Zustand for efficient state handling
- **Smart Caching**: React Query for optimized API calls

## Tech Stack

- **Framework**: Expo React Native with TypeScript
- **Routing**: Expo Router (file-based)
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query v5
- **Styling**: NativeWind v4 + TailwindCSS
- **Animations**: Reanimated v4
- **UI Components**: Custom components with Ionicons
- **Image Handling**: Expo Image Picker + Image Manipulator
- **Video Playback**: Expo AV
- **API Authentication**: HMAC SHA256 with crypto-js

## Project Structure

```
Video generator/
├── app/                    # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx      # Home - Upload & Generate
│   │   ├── gallery.tsx    # View Generated Content
│   │   └── _layout.tsx    # Tab Navigator
│   └── _layout.tsx        # Root Layout with Providers
├── components/
│   ├── ImageUploader.tsx   # Image selection component
│   ├── GenerationCard.tsx  # Status card for each generation type
│   ├── VideoPlayer.tsx     # Custom video player
│   └── CaptionDisplay.tsx  # Caption display with copy/share
├── services/
│   ├── wiro-api.ts         # Wiro API client
│   └── signature.ts        # HMAC signature generation
├── stores/
│   └── content-store.ts    # Zustand state management
├── types/
│   └── index.ts            # TypeScript type definitions
└── utils/
    ├── constants.ts        # API config and constants
    ├── image-utils.ts      # Image handling utilities
    ├── query-client.ts     # React Query configuration
    └── use-generation.ts   # Generation and polling hooks
```

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. Clone the repository:
```bash
cd Video generator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## How It Works

### 1. Upload Image
- Users can upload a product image from their library or take a photo with the camera
- Images are automatically optimized and compressed

### 2. Generate Content
Users can generate three types of content:
- **Photoshoots**: Multiple styled product photos (1-3 minutes)
- **Videos**: Promotional video showcase (2-4 minutes)
- **Captions**: Engaging social media copy with hashtags (30 seconds)

### 3. Real-time Updates
- App polls the Wiro API every 3 seconds to check task status
- Progress is shown with loading indicators
- Toast notifications alert when content is ready

### 4. View Results
- All generated content appears in the Gallery tab
- Images in a responsive grid
- Videos with custom playback controls
- Captions with copy and share functionality

## API Integration

### Wiro AI Endpoints

1. **Product Photoshoot** - `/Run/wiro/product-photoshoot`
2. **Video Generation** - `/Run/openai/sora-2-pro`
3. **Caption Generation** - `/Run/wiro/chat`
4. **Task Status** - `/Task/Detail`

### Authentication

Every API request includes HMAC SHA256 signature headers:
```typescript
{
  "x-api-key": "YOUR_API_KEY",
  "x-nonce": "TIMESTAMP",
  "x-signature": "HMAC_SHA256_SIGNATURE"
}
```

The signature is regenerated for each request using:
```typescript
HMAC-SHA256(API_SECRET + nonce, API_KEY)
```

## Key Features Implementation

### Task Polling
The app uses React Query's `refetchInterval` to poll task status every 3 seconds:
- Maximum 60 attempts (3 minutes)
- Automatic updates when tasks complete
- Error handling for timeouts and failures

### State Management
Zustand store manages:
- Current uploaded image
- All content items (photoshoots, videos, captions)
- Status tracking (pending, processing, completed, failed)

### Image Optimization
Images are automatically:
- Resized to max 1920x1920
- Compressed to 80% quality
- Converted to JPEG format

## Configuration

API credentials are stored in `utils/constants.ts`:

```typescript
export const WIRO_CONFIG = {
  API_KEY: "your-api-key",
  API_SECRET: "your-api-secret",
  BASE_URL: "https://api.wiro.ai/v1",
};
```

## Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npm run lint` - Run ESLint

## Contributing

This project was built as a tutorial demonstration. Feel free to fork and customize for your own use!

## License

MIT License - feel free to use this code for your own projects.

## Acknowledgments

- Wiro AI for the API services
- Expo team for the amazing framework
- React Native community for all the great libraries

---

Built with ❤️ using Expo and React Native
