// Keyword maps for amenity detection
const AMENITY_KEYWORDS = {
  hasSwimmingPool: ['pool', 'swimming', 'swim'],
  hasFreeWifi: ['wifi', 'wi-fi', 'internet', 'wireless'],
  hasFitnessCenter: ['gym', 'fitness', 'workout', 'exercise'],
  hasDining: ['dining', 'restaurant', 'food', 'breakfast', 'lunch', 'dinner'],
  hasParking: ['parking', 'garage', 'car park'],
  hasRoomService: ['room service', 'roomservice'],
};

// Known Indian cities and locations
const KNOWN_LOCATIONS = [
  'chennai', 'mumbai', 'bangalore', 'bengaluru', 'delhi',
  'hyderabad', 'kolkata', 'pune', 'ahmedabad', 'jaipur',
  'surat', 'lucknow', 'kanpur', 'nagpur', 'indore',
  'thane', 'bhopal', 'visakhapatnam', 'patna', 'vadodara',
  'goa', 'kochi', 'coimbatore', 'agra', 'varanasi',
  'madurai', 'mysore', 'mysuru', 'chandigarh', 'amritsar',
];

// Words that indicate natural language search
const NATURAL_LANGUAGE_INDICATORS = [
  'with', 'having', 'hotel', 'room', 'facility', 'facilities',
  'and', 'for', 'cheap', 'budget', 'luxury', 'family',
  'friendly', 'good', 'best', 'near', 'in', 'pool', 'wifi',
  'parking', 'gym', 'dining', 'service', 'ac', 'air',
  'swimming', 'fitness', 'workout', 'restaurant',
];

export const isSimpleSearch = (query) => {
  const words = query.trim().split(/\s+/);
  const lower = query.toLowerCase();

  // Single word — always simple
  if (words.length === 1) return true;

  // Two words — check if it's just a city name with no indicators
  if (words.length === 2) {
    const hasIndicator = NATURAL_LANGUAGE_INDICATORS.some(
      keyword => lower.includes(keyword)
    );
    return !hasIndicator;
  }

  // More than 2 words — natural language
  return false;
};

export const parseSearchQuery = (query) => {
  const lower = query.toLowerCase();

  // Extract location
  let location = null;

  // Check known cities first
  const foundCity = KNOWN_LOCATIONS.find(city => lower.includes(city));
  if (foundCity) {
    // Capitalize first letter
    location = foundCity.charAt(0).toUpperCase() + foundCity.slice(1);
    // Special case
    if (foundCity === 'bengaluru') location = 'Bangalore';
    if (foundCity === 'mysuru') location = 'Mysore';
  }

  // Extract amenities
  const amenities = {};
  Object.entries(AMENITY_KEYWORDS).forEach(([amenityKey, keywords]) => {
    const found = keywords.some(keyword => lower.includes(keyword));
    if (found) amenities[amenityKey] = true;
  });

  return { location, ...amenities };
};

export const buildSearchUrl = (parsed) => {
  const params = new URLSearchParams();
  if (parsed.location) params.append('location', parsed.location);
  if (parsed.hasSwimmingPool) params.append('hasSwimmingPool', 'true');
  if (parsed.hasFreeWifi) params.append('hasFreeWifi', 'true');
  if (parsed.hasDining) params.append('hasDining', 'true');
  if (parsed.hasParking) params.append('hasParking', 'true');
  if (parsed.hasFitnessCenter) params.append('hasFitnessCenter', 'true');
  if (parsed.hasRoomService) params.append('hasRoomService', 'true');
  return params.toString();
};