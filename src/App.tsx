import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  DollarSign,
  Compass,
  Heart,
  Share2,
  Download,
  LogOut,
} from 'lucide-react';
import { Map } from './components/Map';
import { Auth } from './components/Auth';
import { supabase } from './lib/supabase';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { Itinerary } from './types/itinerary';

interface TravelPreferences {
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  travelStyle: string;
  interests: string[];
}

const travelStyles = [
  'Adventurous',
  'Relaxing',
  'Cultural',
  'Family-friendly',
  'Luxury',
  'Budget-friendly'
];

const interestOptions = [
  'History',
  'Nature',
  'Food',
  'Nightlife',
  'Art',
  'Shopping',
  'Photography',
  'Sports',
  'Music',
  'Architecture'
];

function App() {
  const [session, setSession] = useState(null);
  const [preferences, setPreferences] = useState<TravelPreferences>({
    destination: '',
    startDate: '',
    endDate: '',
    budget: 'mid-range',
    travelStyle: '',
    interests: [],
  });
  const [generatedItinerary, setGeneratedItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleInterestToggle = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const generateItinerary = async () => {
    setLoading(true);
    try {
      // This would be replaced with actual AI service integration
      const mockItinerary: Itinerary = {
        id: crypto.randomUUID(),
        user_id: session?.user?.id,
        destination: preferences.destination,
        start_date: preferences.startDate,
        end_date: preferences.endDate,
        budget: preferences.budget,
        travel_style: preferences.travelStyle,
        interests: preferences.interests,
        created_at: new Date().toISOString(),
        itinerary_data: {
          days: [
            {
              date: preferences.startDate,
              activities: [
                {
                  time: '09:00',
                  title: 'City Tour',
                  description: 'Explore the city center',
                  location: {
                    name: 'City Center',
                    coordinates: [51.505, -0.09],
                  },
                },
              ],
            },
          ],
        },
      };

      const { error } = await supabase
        .from('itineraries')
        .insert(mockItinerary);

      if (error) throw error;

      setGeneratedItinerary(mockItinerary);
    } catch (error) {
      console.error('Error generating itinerary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateItinerary();
  };

  const handleShare = async () => {
    if (!generatedItinerary) return;

    try {
      await navigator.share({
        title: `Trip Weaver Itinerary - ${generatedItinerary.destination}`,
        text: `Check out my travel itinerary for ${generatedItinerary.destination}!`,
        url: window.location.href,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDownload = async () => {
    if (!generatedItinerary) return;

    const element = document.getElementById('itinerary-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const pdf = new jsPDF();
      
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      pdf.save(`tripweaver-${generatedItinerary.destination}.pdf`);
    } catch (error) {
      console.error('Error downloading:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Auth onAuth={() => {}} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Compass className="h-8 w-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Trip Weaver</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 text-gray-600 hover:text-purple-600"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create Your Perfect Journey</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Destination Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-purple-500" />
                  <span>Where do you want to go?</span>
                </div>
              </label>
              <input
                type="text"
                value={preferences.destination}
                onChange={(e) => setPreferences(prev => ({ ...prev, destination: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter destination"
              />
            </div>

            {/* Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span>Start Date</span>
                  </div>
                </label>
                <input
                  type="date"
                  value={preferences.startDate}
                  onChange={(e) => setPreferences(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span>End Date</span>
                  </div>
                </label>
                <input
                  type="date"
                  value={preferences.endDate}
                  onChange={(e) => setPreferences(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Budget Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-purple-500" />
                  <span>Budget Level</span>
                </div>
              </label>
              <select
                value={preferences.budget}
                onChange={(e) => setPreferences(prev => ({ ...prev, budget: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="budget">Budget-friendly</option>
                <option value="mid-range">Mid-range</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>

            {/* Travel Style */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center space-x-2">
                  <Compass className="h-4 w-4 text-purple-500" />
                  <span>Travel Style</span>
                </div>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {travelStyles.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setPreferences(prev => ({ ...prev, travelStyle: style }))}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                      ${preferences.travelStyle === style
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-purple-500" />
                  <span>Interests</span>
                </div>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {interestOptions.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                      ${preferences.interests.includes(interest)
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-md font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate My Itinerary'}
            </button>
          </form>
        </div>

        {/* Itinerary Preview */}
        {generatedItinerary && (
          <div id="itinerary-content" className="mt-8 bg-white rounded-xl shadow-lg p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Your Itinerary</h2>
              <div className="flex space-x-4">
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 text-gray-600 hover:text-purple-600"
                >
                  <Share2 className="h-5 w-5" />
                  <span>Share</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 text-gray-600 hover:text-purple-600"
                >
                  <Download className="h-5 w-5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
            
            <div className="h-96 rounded-lg overflow-hidden mb-6">
              <Map
                center={[51.505, -0.09]}
                markers={generatedItinerary.itinerary_data.days.flatMap(day =>
                  day.activities.map(activity => ({
                    position: activity.location.coordinates,
                    title: activity.title,
                    description: activity.description,
                  }))
                )}
              />
            </div>

            <div className="space-y-6">
              {generatedItinerary.itinerary_data.days.map((day, index) => (
                <div key={index} className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Day {index + 1} - {new Date(day.date).toLocaleDateString()}
                  </h3>
                  <div className="space-y-4">
                    {day.activities.map((activity, actIndex) => (
                      <div key={actIndex} className="flex space-x-4">
                        <div className="w-20 text-gray-600">{activity.time}</div>
                        <div>
                          <h4 className="font-medium text-gray-800">{activity.title}</h4>
                          <p className="text-gray-600">{activity.description}</p>
                          <p className="text-sm text-gray-500">{activity.location.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;