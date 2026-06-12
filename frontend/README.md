# StartUpForge Frontend

A modern React application for StartUpForge, built with Vite, React Router, and Axios.

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images, icons, and other media
│   ├── components/     # Reusable components
│   │   ├── common/     # Common/shared components
│   │   └── features/   # Feature-specific components
│   ├── pages/          # Page components (routes)
│   ├── services/       # API services
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── styles/         # Global and component styles
│   ├── types/          # TypeScript types (if using TS)
│   ├── context/        # React Context providers
│   ├── config/         # Configuration files
│   ├── App.jsx         # Root component
│   └── main.jsx        # Entry point
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Environment Variables

Create a `.env.local` file in the root of the frontend directory:

```
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=StartUpForge
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Architecture

### Components
- **Common Components** (`src/components/common/`): Reusable UI components like buttons, modals, etc.
- **Feature Components** (`src/components/features/`): Feature-specific components

### Services
API calls are handled through `src/services/api.js` which provides an Axios instance with interceptors for:
- Authentication token injection
- Error handling
- Request/response transformation

### Hooks
Custom hooks in `src/hooks/` provide reusable stateful logic:
- `useApi` - API request handling with loading and error states

### Context
Global application state managed through React Context in `src/context/`

## API Integration

The frontend is configured to proxy API requests to the backend running on `http://localhost:8000`.

Example API call:
```javascript
import apiClient from '@/services/api'

const fetchData = async () => {
  try {
    const response = await apiClient.get('/endpoint')
    console.log(response.data)
  } catch (error) {
    console.error(error)
  }
}
```

## Contributing

Please follow these guidelines:
1. Create feature branches from `main`
2. Use meaningful commit messages
3. Keep components small and focused
4. Write clear comments and documentation

## License

MIT
