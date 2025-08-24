# PawHub Dashboard

A comprehensive map-first web dashboard for community-driven animal welfare operations.

## 🐾 What is PawHub?

PawHub is a platform that helps organizations run targeted "Community Drives" (sterilization, vaccination, tagging) by providing:

- **Map-first interface** for creating and managing drives
- **Real-time tracking** of sightings and sterilizations
- **Emergency response system** with live alerts
- **Volunteer coordination** and point-based system
- **Adoption platform** for finding homes for animals
- **Live KPIs and reporting** for measuring impact

## 🎯 Key Features

### Map-First Drive Creation
- Draw operation areas directly on the map using polygon tools
- Select city/area with automatic map centering
- Three-step wizard: Details → Area Selection → Review

### Live Drive Dashboard
- Real-time KPIs (Animals Covered, Sterilized, Area Coverage)
- Interactive map with sighting markers
- Activity feed with photo uploads
- Volunteer shortlisting and invitation system

### Emergency Response
- Live emergency alerts with severity levels
- Pulsing markers for critical situations
- Quick action buttons (Create Sighting, Assign Response)

### Adoption Center
- Organization-based adoption posts
- Photo galleries and animal descriptions
- Status tracking (Available/Adopted)

### Authentication & Organizations
- Organization registration with verification codes
- Role-based access control
- Token-based authentication

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, React 19
- **UI**: Material-UI (MUI), Tailwind CSS
- **Maps**: Leaflet, React-Leaflet with drawing capabilities
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios with interceptors
- **Backend API**: Django DRF + PostGIS (separate repository)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Homepage with map
│   ├── drives/[id]/       # Drive dashboard
│   └── adoptions/         # Adoption center
├── components/
│   ├── drives/            # Drive creation & management
│   ├── map/               # Map components & overlays
│   ├── auth/              # Login/registration forms
│   ├── emergency/         # Emergency modals
│   └── adoption/          # Adoption cards & forms
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts         # Authentication logic
│   ├── useDriveAPI.ts     # Drive API operations
│   └── useDriveForm.ts    # Form state management
├── types/                 # TypeScript type definitions
├── lib/
│   ├── api.ts             # Axios configuration
│   └── mockData.ts        # Development mock data
```

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Homepage: http://localhost:3001
   - Adoptions: http://localhost:3001/adoptions

## 📋 Core Workflows

### Creating a Drive
1. Click the floating "+" button on the map
2. Fill in drive details (title, description, date, city, area)
3. Draw operation area on the map using polygon tools
4. Review and confirm to create the drive
5. Redirected to live drive dashboard

### Managing a Drive
- View real-time KPIs and map markers
- Add sightings with photo upload
- Mark animals as sterilized
- Invite volunteers
- Export activity reports

### Emergency Response
- Emergency alerts appear as colored markers on map
- Click for details and action buttons
- Create sightings or assign response teams

### Adoption Management
- Create adoption posts with animal details
- View organization's adoption listings
- Update adoption status (Available/Adopted)

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_API_BASE=http://localhost:8000  # Django backend URL
```

### Mock Data Mode
Set `USE_MOCK_DATA = true` in hook files to use mock data during development.

## 📡 API Integration

The frontend is designed to work with a Django DRF + PostGIS backend. Key endpoints:

- `POST /api/auth/login/` - Authentication
- `POST /api/drives/` - Create drives
- `GET /api/drives/{id}/dashboard/` - Drive dashboard data
- `GET /api/emergencies/` - Emergency alerts
- `POST /api/sightings/` - Report sightings
- `GET /api/adoptions/` - Adoption listings

## 🎨 UI/UX Principles

- **Map-first**: All spatial operations are visual and immediate
- **Progressive disclosure**: Complex workflows broken into simple steps
- **Mobile-ready**: Responsive design with touch-friendly interactions
- **Immediate feedback**: Visual confirmations and loading states
- **Accessible**: Proper labels, keyboard navigation, high contrast

## 🧪 Testing & Development

### Mock Data Available
- Sample emergencies with different severity levels
- Drive dashboard with KPIs and activity feed
- Mock authentication for testing workflows

### Browser Compatibility
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📈 Performance

- Dynamic imports for map components (avoid SSR issues)
- React Query for efficient data fetching and caching
- Optimistic updates for better user experience
- 10-second polling for live data updates

## 🔮 Future Enhancements

- WebSocket integration for real-time updates
- Mobile app (Flutter) using the same API
- Advanced map layers (heatmaps, clustering)
- Push notifications for emergencies
- Volunteer mobile check-in system
- Advanced reporting and analytics

## 📝 License

This project is part of the PawHub platform for animal welfare organizations.
