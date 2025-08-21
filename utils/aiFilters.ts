import { Image } from 'expo-image';

// AI Filter Types
export interface AIFilter {
  id: string;
  name: string;
  style: any;
  confidence: number;
  category: 'mood' | 'scene' | 'portrait' | 'landscape' | 'night' | 'food' | 'party';
  description: string;
}

// Smart filter suggestions based on content analysis
export const smartFilters: AIFilter[] = [
  {
    id: 'vivid',
    name: 'Vivid',
    style: { backgroundColor: 'rgba(255, 100, 0, 0.25)', opacity: 0.8 },
    confidence: 0.9,
    category: 'scene',
    description: 'Enhances colors for vibrant scenes'
  },
  {
    id: 'dramatic',
    name: 'Dramatic',
    style: { backgroundColor: 'rgba(255, 0, 100, 0.3)', opacity: 0.85 },
    confidence: 0.8,
    category: 'mood',
    description: 'Adds dramatic contrast and mood'
  },
  {
    id: 'mono',
    name: 'Mono',
    style: { backgroundColor: 'rgba(128, 128, 128, 0.6)', opacity: 0.7 },
    confidence: 0.7,
    category: 'portrait',
    description: 'Classic black and white for portraits'
  },
  {
    id: 'silvertone',
    name: 'Silvertone',
    style: { backgroundColor: 'rgba(100, 150, 255, 0.35)', opacity: 0.75 },
    confidence: 0.6,
    category: 'landscape',
    description: 'Cool blue tones for landscapes'
  },
  {
    id: 'noir',
    name: 'Noir',
    style: { backgroundColor: 'rgba(0, 0, 0, 0.45)', opacity: 0.8 },
    confidence: 0.8,
    category: 'night',
    description: 'Dark and mysterious for night scenes'
  },
  {
    id: 'warm',
    name: 'Warm',
    style: { backgroundColor: 'rgba(255, 200, 100, 0.3)', opacity: 0.8 },
    confidence: 0.7,
    category: 'food',
    description: 'Warm tones perfect for food photos'
  },
  {
    id: 'party',
    name: 'Party',
    style: { backgroundColor: 'rgba(255, 0, 255, 0.25)', opacity: 0.8 },
    confidence: 0.9,
    category: 'party',
    description: 'Vibrant colors for party scenes'
  },
  {
    id: 'sunset',
    name: 'Sunset',
    style: { backgroundColor: 'rgba(255, 150, 50, 0.4)', opacity: 0.8 },
    confidence: 0.8,
    category: 'landscape',
    description: 'Golden hour warmth'
  },
  {
    id: 'cool',
    name: 'Cool',
    style: { backgroundColor: 'rgba(50, 150, 255, 0.3)', opacity: 0.8 },
    confidence: 0.7,
    category: 'scene',
    description: 'Cool blue tones for modern looks'
  }
];

// Mock AI analysis function (in real app, this would use ML model)
export const analyzeContent = async (imageUri: string): Promise<AIFilter[]> => {
  try {
    // Simulate AI analysis with random confidence scores
    const analysisTime = Math.random() * 1000 + 500; // 500-1500ms
    await new Promise(resolve => setTimeout(resolve, analysisTime));
    
    // Randomly select 2-4 filters with high confidence
    const numFilters = Math.floor(Math.random() * 3) + 2;
    const shuffled = [...smartFilters].sort(() => 0.5 - Math.random());
    const selectedFilters = shuffled.slice(0, numFilters);
    
    // Adjust confidence based on "AI analysis"
    return selectedFilters.map(filter => ({
      ...filter,
      confidence: Math.random() * 0.3 + 0.7 // 0.7-1.0 confidence
    }));
  } catch (error) {
    console.error('Error analyzing content:', error);
    return smartFilters.slice(0, 3); // Fallback to first 3 filters
  }
};

// Get filter suggestions based on time of day
export const getTimeBasedFilters = (): AIFilter[] => {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 12) {
    return smartFilters.filter(f => ['vivid', 'warm'].includes(f.id));
  } else if (hour >= 12 && hour < 18) {
    return smartFilters.filter(f => ['dramatic', 'cool'].includes(f.id));
  } else if (hour >= 18 && hour < 22) {
    return smartFilters.filter(f => ['sunset', 'warm'].includes(f.id));
  } else {
    return smartFilters.filter(f => ['noir', 'cool'].includes(f.id));
  }
};

// Get weather-aware filters (mock implementation)
export const getWeatherBasedFilters = (weather: string): AIFilter[] => {
  switch (weather.toLowerCase()) {
    case 'sunny':
      return smartFilters.filter(f => ['vivid', 'warm', 'sunset'].includes(f.id));
    case 'rainy':
      return smartFilters.filter(f => ['cool', 'noir'].includes(f.id));
    case 'cloudy':
      return smartFilters.filter(f => ['mono', 'silvertone'].includes(f.id));
    default:
      return smartFilters.slice(0, 3);
  }
};

// Auto-caption generation based on filter and content
export const generateCaption = (filter: AIFilter, contentType: 'photo' | 'video'): string => {
  const captions = {
    vivid: ['Living life in full color! 🌈', 'Vibes are immaculate ✨', 'Pure energy captured 📸'],
    dramatic: ['Dramatic entrance 💫', 'Mood: cinematic 🎬', 'Storytelling through lens 📖'],
    mono: ['Classic vibes only 🖤', 'Timeless beauty ✨', 'Black & white magic 📷'],
    silvertone: ['Cool as ice ❄️', 'Modern aesthetic 🔥', 'Clean and crisp ✨'],
    noir: ['Mysterious vibes 🔮', 'Dark and beautiful 🌙', 'Night mode activated 🌃'],
    warm: ['Warm and cozy vibes ☀️', 'Golden hour magic ✨', 'Feeling the warmth 🌅'],
    party: ['Party mode activated 🎉', 'Vibes are high 🔥', 'Celebration time 🎊'],
    sunset: ['Golden hour perfection 🌅', 'Sunset vibes ✨', 'Magic hour captured 🌟'],
    cool: ['Cool and collected 😎', 'Modern vibes 🔥', 'Clean aesthetic ✨']
  };
  
  const filterCaptions = captions[filter.id as keyof typeof captions] || captions.vivid;
  const randomCaption = filterCaptions[Math.floor(Math.random() * filterCaptions.length)];
  
  return randomCaption;
}; 