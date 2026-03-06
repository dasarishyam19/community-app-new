# #Connect

A modern, welcoming community management application built with Next.js and Firebase, featuring a beautiful single-page login and registration interface with interactive map-based community selection.

## 🎨 Design Features

- **Aesthetic**: Warm, neighborhood-friendly design with terracotta and rose gradient accents
- **Typography**: Outfit (display) + DM Sans (body) for a refined, modern look
- **Animations**: Smooth tab transitions, micro-interactions, and success states using Framer Motion
- **Responsive**: Mobile-first design that works beautifully on all screen sizes
- **Interactive Map**: Leaflet-based community selection with search functionality

## 🚀 Features

### Login
- Phone number input with validation
- Firebase Phone Auth OTP-based authentication
- Loading states and success indicators
- Form validation with Zod
- Error handling with user-friendly messages

### Registration
- Interactive map-based community selection
- Search functionality with Nominatim geocoding API
- Click-to-mark custom locations on map
- Full name collection
- Phone number with OTP verification
- Apartment number input
- Gender selection dropdown (Male/Female/Other)
- Apartment owner name field
- Complete form validation
- Multi-step registration (community selection → form)

### User Dashboard
- Profile display with user information
- Community details
- Sign out functionality
- Coming soon features (announcements, events, chat)

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Form Management**: React Hook Form
- **Validation**: Zod
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Maps**: Leaflet & react-leaflet
- **Backend**: Firebase (Auth, Firestore)
- **Geocoding**: Nominatim (OpenStreetMap)

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Firebase configuration

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🔥 Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project

2. **Enable Authentication**
   - Navigate to Authentication > Sign-in method
   - Enable Phone provider

3. **Create Firestore Database**
   - Navigate to Firestore Database
   - Create a database in test mode
   - Set up security rules (see FIREBASE_SETUP.md)

4. **Configure Environment Variables**
   - Copy your Firebase config from Project Settings
   - Update `.env.local` with your credentials

5. **Set Up Test Phone Numbers (Optional)**
   - For development, add test phone numbers in Firebase Console
   - Authentication > Phone > Test phones

For detailed Firebase setup instructions, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

## 🌐 Access

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
community-app-new/
├── app/
│   ├── layout.tsx          # Root layout with fonts and AuthProvider
│   ├── page.tsx            # Main page with login/register forms
│   ├── dashboard/
│   │   └── page.tsx        # User dashboard page
│   └── globals.css         # Global styles and Tailwind config
├── components/
│   └── CommunityMap.tsx    # Interactive map component
├── contexts/
│   └── AuthContext.tsx     # Authentication context provider
├── lib/
│   └── firebase/
│       ├── index.ts        # Firebase initialization
│       ├── auth.ts         # Authentication functions
│       └── firestore.ts    # Firestore database operations
├── public/                 # Static assets
├── .env.local.example      # Environment variables template
├── FIREBASE_SETUP.md       # Detailed Firebase setup guide
└── package.json            # Dependencies
```

## 🎯 Key Implementation Details

### Firebase Authentication
- Phone authentication with invisible reCAPTCHA
- OTP sending and verification
- Auth state management with React Context
- Protected routes with authentication checks
- Automatic redirect to dashboard on successful login

### Firestore Database
- User profile data storage
- Community information
- Login activity tracking
- Security rules for data protection

### Form Validation
- Zod schemas for robust form validation
- Real-time error messages for user feedback
- Phone number validation (minimum 10 digits)
- OTP validation (6 digits required)

### Interactive Map
- Leaflet integration for community selection
- Search functionality with Nominatim API
- Click-to-mark custom locations
- Reverse geocoding for location names
- Responsive map container

### User Experience
- Tab switching with smooth slide animations
- Multi-step registration flow
- Disabled states for buttons during loading
- Visual feedback for OTP sent confirmation
- Success screen with animated checkmark
- Error messages with clear feedback
- Automatic redirect after successful authentication

### Styling Approach
- Custom font family setup (Outfit for headings, DM Sans for body)
- Glassmorphism card effect with backdrop blur
- Subtle background patterns with geometric shapes
- Gradient accents throughout the UI
- Consistent spacing and rounded corners
- Hero section with apartment images
- Community feature highlights

## 📝 Future Enhancements

- [ ] Community announcements board
- [ ] Event calendar
- [ ] Neighbor chat/messaging
- [ ] Facility booking system
- [ ] Payment portal for maintenance
- [ ] Complaint management system
- [ ] Admin dashboard
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Push notifications

## 🔧 Development Notes

- **Firebase Integration**: Fully integrated with Firebase Authentication and Firestore
- **OTP Authentication**: Real Firebase Phone Auth (not simulated)
- **Map Integration**: Interactive map with search and custom location marking
- **Security**: Firebase security rules configured for data protection
- **Error Handling**: Comprehensive error handling throughout the application
- **Loading States**: Proper loading indicators for better UX

## 📱 Screenshots

The application includes:
- Beautiful hero section with gradient overlays
- Interactive map with community markers
- Clean form interfaces with validation
- Success animations
- User dashboard with profile information

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ using [Next.js](https://nextjs.org) and [Firebase](https://firebase.google.com)
