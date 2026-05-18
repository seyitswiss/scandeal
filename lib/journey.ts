export type JourneyType =
  | 'shopping'
  | 'food'
  | 'selfcare'
  | 'project'
  | 'home'
  | 'mobility'
  | 'business'
  | 'leisure'
  | 'travel'
  | 'nightlife'
  | 'education'

export const journeyMap: Record<string, JourneyType> = {
  // Shopping
  Jewelry: 'shopping',
  Watches: 'shopping',
  Fashion: 'shopping',
  Shoes: 'shopping',
  Bags: 'shopping',
  Furniture: 'home',
  'Home Decor': 'home',
  Electronics: 'shopping',
  'Mobile Shop': 'shopping',
  'Computer Store': 'shopping',
  Gaming: 'leisure',
  Toys: 'shopping',
  Flowers: 'shopping',
  Gifts: 'shopping',
  Kiosk: 'shopping',
  Supermarket: 'shopping',
  'Pet Shop': 'shopping',
  'Sports Store': 'shopping',
  Optician: 'shopping',
  'Perfume Store': 'shopping',
  'Luxury Goods': 'shopping',
  'Vending Machine': 'shopping',

  // Food
  Restaurant: 'food',
  Cafe: 'leisure',
  Bakery: 'leisure',
  Bar: 'nightlife',
  'Fast Food': 'food',
  'Take Away': 'food',
  Delivery: 'food',
  'Ice Cream': 'leisure',
  'Food Truck': 'food',
  Catering: 'food',
  Winery: 'leisure',
  Dessert: 'leisure',
  'Bubble Tea': 'leisure',
  'Coffee Shop': 'leisure',

  // Beauty & Health
  'Hair Salon': 'selfcare',
  Cosmetic: 'selfcare',
  'Nail Salon': 'selfcare',
  'Spa & Wellness': 'selfcare',
  Massage: 'selfcare',
  Fitness: 'selfcare',
  'Yoga & Pilates': 'selfcare',
  Therapy: 'selfcare',
  'Tattoo Studio': 'selfcare',
  'Beauty Clinic': 'selfcare',
  'Dental Clinic': 'selfcare',
  Doctor: 'selfcare',
  Pharmacy: 'selfcare',
  Physiotherapy: 'selfcare',
  Chiropractic: 'selfcare',
  'Nutrition Coach': 'selfcare',

  // Home Services
  Cleaning: 'project',
  Moving: 'home',
  Painting: 'home',
  Plumbing: 'home',
  Electrical: 'home',
  Gardening: 'home',
  'Pest Control': 'home',
  Flooring: 'home',
  Roofing: 'home',
  'Interior Design': 'home',
  'Smart Home': 'home',
  Renovation: 'home',
  'Kitchen Studio': 'home',
  Carpenter: 'home',
  'Glass Service': 'home',
  Solar: 'home',
  HVAC: 'home',
  'Facility Service': 'project',
  'Security Systems': 'home',

  // Construction & Real Estate
  Architect: 'project',
  'Construction Company': 'project',
  'Real Estate Agency': 'home',
  'Property Management': 'project',
  'Building Management': 'project',
  Engineering: 'project',
  Surveying: 'project',
  'Interior Architecture': 'home',
  'Real Estate Investment': 'business',
  Coworking: 'business',
  'Commercial Property': 'business',

  // Automotive
  Garage: 'mobility',
  'Car Dealer': 'mobility',
  'Car Wash': 'mobility',
  'Car Rental': 'mobility',
  Taxi: 'mobility',
  Chauffeur: 'mobility',
  Tuning: 'mobility',
  'Tire Service': 'mobility',
  'EV Charging': 'mobility',
  Motorcycle: 'mobility',
  'Bicycle Shop': 'mobility',
  Scooter: 'mobility',
  Transport: 'mobility',
  Logistics: 'business',
  Courier: 'business',
  'Moving Transport': 'home',
  'Truck Service': 'mobility',

  // Professional
  Insurance: 'business',
  Accounting: 'business',
  Lawyer: 'business',
  Consulting: 'business',
  'Marketing Agency': 'business',
  'Web Agency': 'business',
  Photographer: 'business',
  Videographer: 'business',
  Printing: 'business',
  Recruiting: 'business',
  'Job Center': 'business',
  Coaching: 'education',
  Translation: 'business',
  'IT Support': 'business',
  'Software Company': 'business',
  Telecom: 'business',
  'Security Service': 'business',
  Bank: 'business',
  'Crypto Service': 'business',
  Investment: 'business',
  Mortgage: 'business',
  'Tax Advisor': 'business',
  Notary: 'business',
  'Debt Consulting': 'business',
  SaaS: 'business',
  'AI Company': 'business',
  'App Developer': 'business',
  Hosting: 'business',
  'Cyber Security': 'business',
  'E-Commerce Service': 'business',
  'POS Systems': 'business',

  // Entertainment & Leisure
  Lounge: 'nightlife',
  Cinema: 'leisure',
  Bowling: 'leisure',
  'Escape Room': 'leisure',
  Arcade: 'leisure',
  Casino: 'nightlife',
  'Event Location': 'leisure',
  Nightclub: 'nightlife',
  'Concert Venue': 'nightlife',
  'Gaming Lounge': 'leisure',
  'VR Experience': 'leisure',
  'Theme Park': 'leisure',
  Museum: 'leisure',
  Zoo: 'leisure',
  'Swimming Pool': 'leisure',
  'Kids Playground': 'leisure',
  Landmark: 'leisure',
  Viewpoint: 'leisure',
  Castle: 'leisure',
  'Historic Place': 'leisure',
  'Tourist Spot': 'leisure',
  'Photo Spot': 'leisure',
  'Boat Tour': 'leisure',
  'Observation Deck': 'leisure',
  Park: 'leisure',
  'Lake Attraction': 'leisure',

  // Travel
  Hotel: 'travel',
  Resort: 'travel',
  Airbnb: 'travel',
  'Travel Agency': 'travel',
  Airline: 'travel',
  Cruise: 'travel',
  'Ski Resort': 'travel',
  Camping: 'travel',
  'Tour Guide': 'travel',
  'Wellness Resort': 'travel',
  Hostel: 'travel',

  // Education
  School: 'education',
  'Language School': 'education',
  'Driving School': 'education',
  Tutor: 'education',
  Academy: 'education',
  University: 'education',
  Childcare: 'education',
  NGO: 'education',
  'Religious Center': 'leisure',
  'Club Association': 'leisure',
  'Community Center': 'leisure',
}

export const instantRelevanceMap: Record<JourneyType, Record<string, number>> = {
  shopping: {
    Cafe: 5,
    Restaurant: 4,
    Bakery: 4,
    'Ice Cream': 4,
    Beauty: 3,
    Cinema: 3,
  },

  food: {
    Cafe: 5,
    Bakery: 4,
    'Ice Cream': 4,
    Bar: 4,
    Lounge: 4,
    Cinema: 3,
    Shopping: 3,
  },

  selfcare: {
    Cafe: 5,
    Restaurant: 5,
    Bakery: 4,
    'Ice Cream': 4,
    Fashion: 5,
    Jewelry: 4,
    'Perfume Store': 4,
    Flowers: 3,
    Cinema: 3,
  },

  project: {
    Moving: 5,
    Painting: 5,
    Furniture: 5,
    'Home Decor': 5,
    Gardening: 4,
    Electrical: 4,
    Plumbing: 4,
    Flooring: 4,
    Renovation: 4,
    'Kitchen Studio': 4,
    'Hardware Store': 5,
  },

  home: {
    Cleaning: 5,
    Furniture: 5,
    'Home Decor': 5,
    Painting: 4,
    Moving: 4,
    Gardening: 4,
    Electronics: 3,
    'Smart Home': 4,
  },

  mobility: {
    'Car Wash': 5,
    'Tire Service': 5,
    Garage: 4,
    'EV Charging': 4,
    Cafe: 3,
    'Fast Food': 3,
    Kiosk: 3,
  },

  business: {
    Cafe: 4,
    Coworking: 5,
    Printing: 5,
    'IT Support': 4,
    Telecom: 4,
    Accounting: 4,
    Consulting: 3,
  },

  leisure: {
    Cafe: 5,
    Restaurant: 5,
    Bakery: 4,
    'Ice Cream': 5,
    Bar: 4,
    Lounge: 4,
    Shopping: 4,
    Gifts: 4,
    Hotel: 3,
  },

  travel: {
    Restaurant: 5,
    Cafe: 5,
    Bar: 4,
    Taxi: 5,
    'Tour Guide': 5,
    Museum: 4,
    'Lake Attraction': 4,
    'Boat Tour': 4,
    Spa: 3,
  },

  nightlife: {
    Taxi: 5,
    Restaurant: 4,
    'Fast Food': 4,
    Lounge: 5,
    Nightclub: 5,
    Hotel: 3,
  },

  education: {
    Cafe: 4,
    Bakery: 4,
    Bookstore: 5,
    Printing: 4,
    Coworking: 3,
  },
}

export function getJourneyType(subCategory: string | null | undefined): JourneyType | null {
  if (!subCategory) return null
  return journeyMap[subCategory] ?? null
}

export function getInstantRelevanceScore(
  sourceSubCategory: string | null | undefined,
  targetSubCategory: string | null | undefined
): number {
  if (!sourceSubCategory || !targetSubCategory) return 1

  const journeyType = getJourneyType(sourceSubCategory)
  if (!journeyType) return 1

  const relevance = instantRelevanceMap[journeyType]
  return relevance[targetSubCategory] ?? 1
}