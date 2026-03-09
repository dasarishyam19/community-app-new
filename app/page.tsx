'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Phone, Lock, User, Home as HomeIcon, Mail, CheckCircle, Loader2, MapPin, ChevronRight, AlertCircle, Lightbulb, MessageSquare, Users, LayoutDashboard } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import CountrySelector from '@/components/CountrySelector';
import Logo from '@/components/Logo';
import { auth } from '@/lib/firebase';

// Dynamic import of CommunityMap component to avoid SSR issues with Leaflet
const CommunityMap = dynamic(() => import('@/components/CommunityMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
      <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
    </div>
  ),
});

// Community data - Areas within 5KM radius
const communities = [
  { id: 1, name: 'Downtown Area', city: 'Mumbai', lat: 19.0760, lng: 72.8777, radiusKm: 5 },
  { id: 2, name: 'Connaught Place', city: 'Delhi', lat: 28.6139, lng: 77.2090, radiusKm: 5 },
  { id: 3, name: 'Koramangala', city: 'Bangalore', lat: 12.9716, lng: 77.5946, radiusKm: 5 },
  { id: 4, name: 'T Nagar', city: 'Chennai', lat: 13.0827, lng: 80.2707, radiusKm: 5 },
  { id: 5, name: 'HITEC City', city: 'Hyderabad', lat: 17.3850, lng: 78.4867, radiusKm: 5 },
];

// Custom community type for user-marked locations
interface CustomCommunity {
  id: number;
  name: string;
  city: string;
  lat: number;
  lng: number;
  radiusKm: number;
  isCustom?: boolean;
}

// Country interface
interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

// Validation schemas
const loginSchema = z.object({
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long')
    .regex(/^\d+$/, 'Phone number must contain only digits'),
  otp: z.string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only digits'),
});

const registerSchema = z.object({
  communityId: z.number().min(1, 'Please select your community area'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long')
    .regex(/^\d+$/, 'Phone number must contain only digits'),
  otp: z.string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only digits'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function Home() {
  const router = useRouter();
  const { firebaseUser, userData, loading: authLoading, sendOTP: apiSendOTP, verifyOTP } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [otpSent, setOtpSent] = useState(false);
  const [registerOtpSent, setRegisterOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registerStep, setRegisterStep] = useState<'community' | 'form'>('community');
  const [selectedCommunity, setSelectedCommunity] = useState<(typeof communities[0] | CustomCommunity) | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginCountry, setLoginCountry] = useState<Country>({ code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' });
  const [registerCountry, setRegisterCountry] = useState<Country>({ code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' });

  // Redirect if user is already logged in
  useEffect(() => {
    if (userData && !authLoading) {
      router.push('/dashboard');
    }
  }, [userData, authLoading, router]);

  // Login form
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    watch: watchLogin,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Register form
  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    watch: watchRegister,
    setValue: setRegisterValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const fullPhoneNumber = `${loginCountry.dialCode}${data.phone}`;

      // Verify OTP via WhatsApp/Redis
      const result = await verifyOTP(fullPhoneNumber, data.otp);

      if (!result.success) {
        setAuthError(result.message || 'Failed to verify OTP');
        return;
      }

      setIsSuccess(true);
      // Router will redirect to dashboard via the useEffect
    } catch (error: any) {
      console.error('Login error:', error);
      setAuthError(error.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const fullPhoneNumber = `${registerCountry.dialCode}${data.phone}`;

      // Verify OTP via WhatsApp/Redis
      const result = await verifyOTP(fullPhoneNumber, data.otp);

      if (!result.success) {
        setAuthError(result.message || 'Failed to verify OTP');
        return;
      }

      // Get community location (default to Visakhapatnam if not selected)
      const communityId = 'qyyOF1jDVQ0igYSiNiXg'; // Your community ID
      const location = {
        latitude: selectedCommunity?.lat || 17.7246,
        longitude: selectedCommunity?.lng || 83.2850,
        address: selectedCommunity ?
          `${selectedCommunity.name}, ${selectedCommunity.city}` :
          'Visakhapatnam, Andhra Pradesh',
      };

      // Call registration API to save user to Firestore
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: fullPhoneNumber,
          fullName: data.name,
          communityId,
          location,
        }),
      });

      const registerData = await registerResponse.json();

      if (!registerData.success) {
        setAuthError(registerData.message || 'Registration failed');
        return;
      }

      console.log('User registered successfully:', registerData.user);
      setIsSuccess(true);
      // Router will redirect to dashboard via the useEffect
    } catch (error: any) {
      console.error('Registration error:', error);
      setAuthError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabSwitch = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    if (tab === 'register') {
      setRegisterStep('community');
      setSelectedCommunity(null);
    }
  };

  const sendOTP = async () => {
    const phone = watchLogin('phone');
    if (phone && phone.length >= 10) {
      setIsLoading(true);
      setAuthError(null);
      try {
        const fullPhoneNumber = `${loginCountry.dialCode}${phone}`;
        const result = await apiSendOTP(fullPhoneNumber);

        if (result.success) {
          setOtpSent(true);
        } else {
          setAuthError(result.message || 'Failed to send OTP via WhatsApp');
        }
      } catch (error: any) {
        console.error('Send OTP error:', error);
        setAuthError(error.message || 'Failed to send OTP. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const sendOTPForRegister = async () => {
    const phone = watchRegister('phone');
    if (phone && phone.length >= 10) {
      setIsLoading(true);
      setAuthError(null);
      try {
        const fullPhoneNumber = `${registerCountry.dialCode}${phone}`;
        const result = await apiSendOTP(fullPhoneNumber);

        if (result.success) {
          setRegisterOtpSent(true);
        } else {
          setAuthError(result.message || 'Failed to send OTP via WhatsApp');
        }
      } catch (error: any) {
        console.error('Send OTP error:', error);
        setAuthError(error.message || 'Failed to send OTP. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCommunitySelect = (community: typeof communities[0] | CustomCommunity) => {
    setSelectedCommunity(community);
    setRegisterValue('communityId', community.id);
  };

  const handleContinueToForm = () => {
    if (selectedCommunity) {
      setRegisterStep('form');
    }
  };

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        // Using Nominatim API for geocoding (free, no API key required)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'en',
            },
          }
        );
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearchResultClick = async (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    setMapCenter([lat, lng]);
    setMapZoom(15);
    setSearchResults([]);
    setSearchQuery(result.display_name.split(',')[0]);

    // Create a custom community marker at the searched location
    const customCommunity: CustomCommunity = {
      id: Date.now(),
      name: result.display_name.split(',')[0],
      city: result.address?.city || result.address?.town || result.address?.village || 'Unknown',
      lat,
      lng,
      radiusKm: 0,
      isCustom: true,
    };

    setSelectedCommunity(customCommunity);
    setRegisterValue('communityId', customCommunity.id);
  };

  const handleMapClick = async (e: any) => {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    // Reverse geocode to get location name
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      const data = await response.json();

      const customCommunity: CustomCommunity = {
        id: Date.now(),
        name: data.display_name?.split(',')[0] || 'Custom Location',
        city: data.address?.city || data.address?.town || data.address?.village || 'Unknown',
        lat,
        lng,
        radiusKm: 0,
        isCustom: true,
      };

      setSelectedCommunity(customCommunity);
      setRegisterValue('communityId', customCommunity.id);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md"
        >
          <div className="w-24 h-24 mx-auto mb-6">
            <Logo />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </motion.div>
          <h2 className="text-3xl font-display font-bold text-gray-800 mb-3">
            Welcome to #Connect!
          </h2>
          <p className="text-gray-600">
            {activeTab === 'login' ? 'You have successfully logged in.' : 'Your account has been created.'}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 relative overflow-hidden">
      {/* Animated background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/5 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Image Section */}
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/95 via-indigo-600/90 to-cyan-600/85 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1523051295298-c9581cec0505?w=1920&q=80"
          alt="Community Connection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white px-4 pb-12">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center max-w-4xl"
          >
            <div className="mb-8 flex justify-center">
              <div className="w-32 h-32 md:w-40 md:h-40">
                <Logo />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 drop-shadow-lg leading-tight">
              #Connect
            </h1>
            <p className="text-xl md:text-3xl font-light opacity-100 drop-shadow-md font-medium mb-4">
              Connect With Your Neighborhood
            </p>
            <p className="text-base md:text-lg opacity-90 max-w-2xl mx-auto">
              Join your local community within 5KM radius. Connect, communicate, and collaborate with neighbors in your area.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-4 pb-12 -mt-8">
        {/* Stats Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="grid grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg">
            <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-1">500+</div>
            <div className="text-xs md:text-sm text-gray-600">Happy Residents</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg">
            <div className="text-3xl md:text-4xl font-bold text-indigo-600 mb-1">24/7</div>
            <div className="text-xs md:text-sm text-gray-600">Support</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg">
            <div className="text-3xl md:text-4xl font-bold text-cyan-600 mb-1">50+</div>
            <div className="text-xs md:text-sm text-gray-600">Amenities</div>
          </div>
        </motion.div>

        {/* Community Image Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8 rounded-3xl overflow-hidden shadow-2xl max-w-4xl mx-auto"
        >
          <img
            src="https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1200&q=80"
            alt="Community Connection"
            className="w-full h-64 md:h-80 object-cover"
          />
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 px-6 py-4">
            <p className="text-white text-center font-semibold text-base md:text-lg">
              🤝 Connect with neighbors in your local area (5KM radius)
            </p>
          </div>
        </motion.div>

        {/* Main card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-blue-100 relative z-10 max-w-4xl mx-auto"
        >
          {/* Tab navigation */}
          <div className="flex border-b border-gray-200/50">
            <button
              onClick={() => handleTabSwitch('login')}
              className={`flex-1 py-4 px-6 font-semibold text-sm tracking-wide transition-all duration-300 relative ${
                activeTab === 'login'
                  ? 'text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {activeTab === 'login' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500"
                />
              )}
              Login
            </button>
            <button
              onClick={() => handleTabSwitch('register')}
              className={`flex-1 py-4 px-6 font-semibold text-sm tracking-wide transition-all duration-300 relative ${
                activeTab === 'register'
                  ? 'text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {activeTab === 'register' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500"
                />
              )}
              Register
            </button>
          </div>

          {/* Forms container */}
          <div className="p-8 relative z-0">
            {/* Error Message */}
            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2"
              >
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-rose-700">{authError}</p>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-5">
                    {/* Phone input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex">
                        <CountrySelector value={loginCountry} onChange={setLoginCountry} />
                        <div className="relative flex-1">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            {...registerLogin('phone')}
                            placeholder="9876543210"
                            required
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-l-0 border-gray-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>
                      {loginErrors.phone && (
                        <p className="mt-1 text-sm text-rose-600">{loginErrors.phone.message}</p>
                      )}
                    </div>

                    {/* OTP input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        OTP <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          {...registerLogin('otp')}
                          placeholder="Enter 6-digit OTP"
                          disabled={!otpSent}
                          required
                          maxLength={6}
                          className="w-full pl-12 pr-32 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
                        />
                        {!otpSent && (
                          <button
                            type="button"
                            onClick={sendOTP}
                            disabled={isLoading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Send OTP'
                            )}
                          </button>
                        )}
                        {otpSent && (
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 text-sm font-medium flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Sent!
                          </span>
                        )}
                      </div>
                      {loginErrors.otp && (
                        <p className="mt-1 text-sm text-rose-600">{loginErrors.otp.message}</p>
                      )}
                    </div>

                    {/* Submit button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading || !otpSent}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Verifying...
                        </span>
                      ) : (
                        'Login'
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {registerStep === 'community' ? (
                    // Community Selection Step
                    <div className="space-y-4">
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Select Your Area</h3>
                        <p className="text-sm text-gray-600">Find your neighborhood or click anywhere on the map (5KM radius)</p>
                      </div>

                      {/* Search Bar - Fixed positioning like Google Maps */}
                      <div className="relative z-[150]">
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for your area or location..."
                            className="w-full pl-12 pr-12 py-3 bg-white border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            autoComplete="off"
                          />
                          {searchQuery && (
                            <button
                              type="button"
                              onClick={() => {
                                setSearchQuery('');
                                setSearchResults([]);
                              }}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10 bg-white rounded-full w-6 h-6 flex items-center justify-center"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Search Results Dropdown - Google Maps style */}
                        {(searchResults.length > 0 || isSearching || (searchQuery.length >= 2 && searchResults.length === 0)) && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto z-[200]"
                          >
                              {isSearching ? (
                                <div className="px-4 py-8 text-center">
                                  <Loader2 className="w-6 h-6 text-amber-500 animate-spin mx-auto mb-2" />
                                  <p className="text-sm text-gray-600">Searching locations...</p>
                                </div>
                              ) : searchResults.length > 0 ? (
                                searchResults.map((result, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleSearchResultClick(result)}
                                    className="w-full px-4 py-3 text-left hover:bg-amber-50 border-b border-gray-100 last:border-b-0 transition-colors group"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                                        <MapPin className="w-5 h-5 text-amber-600" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">
                                          {result.display_name.split(',')[0]}
                                        </p>
                                        <p className="text-xs text-gray-500 line-clamp-2">
                                          {result.display_name}
                                        </p>
                                        {result.address?.state && (
                                          <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {result.address.state}, {result.address.country || ''}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </button>
                                ))
                              ) : searchQuery.length >= 2 ? (
                                <div className="px-4 py-6 text-center">
                                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <MapPin className="w-6 h-6 text-gray-400" />
                                  </div>
                                  <p className="text-sm text-gray-700 font-medium mb-1">No locations found</p>
                                  <p className="text-xs text-gray-500">Try a different search term or click on the map</p>
                                </div>
                              ) : null}
                            </motion.div>
                          )}
                        </div>

                      {/* Map Container */}
                      <div className="relative w-full h-80 rounded-xl overflow-hidden border-2 border-blue-200 z-0">
                        <CommunityMap
                          center={mapCenter}
                          zoom={mapZoom}
                          communities={communities}
                          selectedCommunity={selectedCommunity}
                          onCommunitySelect={handleCommunitySelect}
                          onMapClick={handleMapClick}
                        />

                        {/* Map Overlay Instructions */}
                        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                          <p className="text-xs text-gray-700 text-center">
                            <Lightbulb className="w-4 h-4 inline mr-1" />
                            <span className="font-semibold">Tip:</span> Search above or click anywhere on the map to select your area (5KM radius)
                          </p>
                        </div>
                      </div>

                      {/* Selected Community Display */}
                      {selectedCommunity ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800">{selectedCommunity.name}</h4>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {selectedCommunity.city}
                              </p>
                              <p className="text-xs text-gray-500">
                                {selectedCommunity.radiusKm ? `${selectedCommunity.radiusKm}KM radius area` : 'Custom location'}
                              </p>
                            </div>
                            <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                          </div>
                        </motion.div>
                      ) : (
                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 font-medium">No area selected yet</p>
                          <p className="text-sm text-gray-500">Search in the bar above or click on the map</p>
                        </div>
                      )}

                      {/* Continue Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleContinueToForm}
                        disabled={!selectedCommunity}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        Continue to Registration
                        <ChevronRight className="w-5 h-5" />
                      </motion.button>
                    </div>
                  ) : (
                    // Registration Form Step
                    <div>
                      {/* Selected Community Header */}
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="text-xs text-gray-600">Joining community</p>
                              <p className="font-semibold text-gray-800">{selectedCommunity?.name}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setRegisterStep('community')}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Change
                          </button>
                        </div>
                      </motion.div>

                      <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-4">
                        {/* Name input */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              {...registerRegister('name')}
                              placeholder="Enter your full name"
                              required
                              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                          </div>
                          {registerErrors.name && (
                            <p className="mt-1 text-sm text-rose-600">{registerErrors.name.message}</p>
                          )}
                        </div>

                        {/* Phone input */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number <span className="text-rose-500">*</span>
                          </label>
                          <div className="flex">
                            <CountrySelector value={registerCountry} onChange={setRegisterCountry} />
                            <div className="relative flex-1">
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                type="tel"
                                {...registerRegister('phone')}
                                placeholder="9876543210"
                                required
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-l-0 border-gray-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                              />
                            </div>
                          </div>
                          {registerErrors.phone && (
                            <p className="mt-1 text-sm text-rose-600">{registerErrors.phone.message}</p>
                          )}
                        </div>

                        {/* OTP input */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Verify Phone (OTP) <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              {...registerRegister('otp')}
                              placeholder="Enter 6-digit OTP"
                              disabled={!registerOtpSent}
                              required
                              maxLength={6}
                              className="w-full pl-12 pr-32 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
                            />
                            {!registerOtpSent && (
                              <button
                                type="button"
                                onClick={sendOTPForRegister}
                                disabled={isLoading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isLoading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  'Send OTP'
                                )}
                              </button>
                            )}
                            {registerOtpSent && (
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 text-sm font-medium flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                Verified!
                              </span>
                            )}
                          </div>
                          {registerErrors.otp && (
                            <p className="mt-1 text-sm text-rose-600">{registerErrors.otp.message}</p>
                          )}
                        </div>

                        {/* Submit button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={isLoading || !registerOtpSent}
                          className="w-full py-3.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                          {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Creating Account...
                            </span>
                          ) : (
                            'Create Account'
                          )}
                        </motion.button>
                      </form>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer text */}
          <div className="px-8 pb-6 text-center">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </motion.div>

        {/* Community Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-3 gap-4 max-w-4xl mx-auto"
        >
          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-blue-600" />
            <p className="text-sm font-bold text-gray-800">Local Chat</p>
            <p className="text-xs text-gray-500 mt-1">5KM radius</p>
          </div>
          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-amber-600" />
            <p className="text-sm font-bold text-gray-800">Announcements</p>
            <p className="text-xs text-gray-500 mt-1">Stay updated</p>
          </div>
          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <Users className="w-12 h-12 mx-auto mb-3 text-green-600" />
            <p className="text-sm font-bold text-gray-800">Connect</p>
            <p className="text-xs text-gray-500 mt-1">With neighbors</p>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {[
            { icon: '📍', label: '5KM Radius' },
            { icon: '🏠', label: 'Area Groups' },
            { icon: '📱', label: 'Easy Access' },
            { icon: '🔒', label: 'Privacy First' },
          ].map((feature, idx) => (
            <div key={idx} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/80 transition-all">
              <div className="text-3xl mb-2">{feature.icon}</div>
              <p className="text-xs font-medium text-gray-700">{feature.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Community Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 max-w-4xl mx-auto"
        >
          <h3 className="text-2xl font-display font-bold text-gray-800 mb-4 text-center">Life at #Connect</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative group">
              <img
                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80"
                alt="Luxury apartment living room"
                className="w-full h-40 object-cover rounded-2xl shadow-lg transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="absolute bottom-3 left-3 text-white text-sm font-medium">Luxury Interiors</p>
              </div>
            </div>
            <div className="relative group">
              <img
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80"
                alt="Modern apartment building"
                className="w-full h-40 object-cover rounded-2xl shadow-lg transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="absolute bottom-3 left-3 text-white text-sm font-medium">Modern Architecture</p>
              </div>
            </div>
            <div className="relative group">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80"
                alt="Beautiful apartment exterior"
                className="w-full h-40 object-cover rounded-2xl shadow-lg transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="absolute bottom-3 left-3 text-white text-sm font-medium">Prime Location</p>
              </div>
            </div>
            <div className="relative group">
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80"
                alt="Contemporary apartment design"
                className="w-full h-40 object-cover rounded-2xl shadow-lg transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="absolute bottom-3 left-3 text-white text-sm font-medium">Contemporary Design</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 rounded-3xl p-8 text-center text-white shadow-xl">
            <p className="text-xl md:text-2xl font-light italic mb-4">
              "Finally a platform to connect with my neighbors! We organized a community cleanup drive in just 2 days."
            </p>
            <p className="font-medium">— Rahul Verma, Delhi</p>
            <div className="flex justify-center gap-1 mt-4">
              <span className="text-yellow-300">★★★★★</span>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center max-w-4xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-800 mb-4">
            Ready to Connect With Your Neighborhood?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join your local community today. Start conversations, organize events, and build lasting connections with neighbors in your area.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setActiveTab('register')}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              Join Your Community
            </button>
            <button
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-blue-500 hover:-translate-y-1"
            >
              Learn More
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center max-w-4xl mx-auto"
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
            <div className="mb-4">
              <div className="w-20 h-20 mx-auto mb-3">
                <Logo />
              </div>
              <h3 className="text-xl font-bold text-gray-800">#Connect</h3>
              <p className="text-sm text-gray-600 mt-1">Connecting neighborhoods, one area at a time</p>
            </div>
            <div className="border-t border-gray-200 pt-6 mt-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">Created by Shyam Dasari</p>
              <p className="text-sm text-gray-600 mb-4">
                <a href="tel:+919182227194" className="flex items-center justify-center gap-2 hover:text-blue-600 transition-colors">
                  <Phone className="w-4 h-4" />
                  +91 9182227194
                </a>
              </p>
              <p className="text-xs text-gray-500">
                Made with ❤️ for local communities | © 2026 #Connect
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
