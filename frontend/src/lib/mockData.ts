import { Activity } from '../types/activity';
import { TouristPlace } from '../types/tourist-place';
import { Category } from '../types/category';

// Mock Tour Data - 10 Tours Reales de Cartagena with prices in COP
export const mockTours: Activity[] = [
  {
    id: 1,
    name: 'Pasadía Islas del Rosario (Bora Bora / Islabela)',
    description: 'Excursión de un día completo a las Islas del Rosario',
    price: 390000,
    durationMinutes: 480,
    touristPlaceId: 1,
    categoryId: 1,
    imageUrl: '/images/islas-rosario.jpg',
    status: 'available',
  },
  {
    id: 2,
    name: 'Tour Ciudad Amurallada & Castillo San Felipe',
    description: 'Recorrido por la ciudad amurallada y el castillo',
    price: 180000,
    durationMinutes: 240,
    touristPlaceId: 1,
    categoryId: 1,
    imageUrl: '/images/ciudad-amurallada.jpg',
    status: 'available',
  },
  {
    id: 3,
    name: 'Atardecer en Catamarán por la Bahía',
    description: 'Paseo en catamarán al atardecer por la bahía',
    price: 140000,
    durationMinutes: 150,
    touristPlaceId: 2,
    categoryId: 1,
    imageUrl: '/images/catamaran.jpg',
    status: 'available',
  },
  {
    id: 4,
    name: 'Pasadía Club de Playa Isla Barú (Playa Blanca)',
    description: 'Excursión al club de playa en Isla Barú',
    price: 160000,
    durationMinutes: 420,
    touristPlaceId: 3,
    categoryId: 1,
    imageUrl: '/images/isla-barú.jpg',
    status: 'available',
  },
  {
    id: 5,
    name: 'Tour Gastronómico & Street Art en Getsemaní',
    description: 'Recorrido gastronómico y arte callejero en Getsemaní',
    price: 120000,
    durationMinutes: 180,
    touristPlaceId: 4,
    categoryId: 1,
    imageUrl: '/images/getsemaní.jpg',
    status: 'available',
  },
  {
    id: 6,
    name: 'Pasadía Cocoliso Resort / Isla del Sol',
    description: 'Excursión al resort Cocoliso o Isla del Sol',
    price: 350000,
    durationMinutes: 480,
    touristPlaceId: 3,
    categoryId: 1,
    imageUrl: '/images/cocoliso.jpg',
    status: 'available',
  },
  {
    id: 7,
    name: 'Tour Chiva Rumbera Nocturna',
    description: 'Paseo nocturno en chiva con música rumbera',
    price: 85000,
    durationMinutes: 180,
    touristPlaceId: 1,
    categoryId: 1,
    imageUrl: '/images/chiva.jpg',
    status: 'available',
  },
  {
    id: 8,
    name: 'Pasadía Beach Club Tierra Bomba',
    description: 'Excursión al beach club en Tierra Bomba',
    price: 195000,
    durationMinutes: 360,
    touristPlaceId: 3,
    categoryId: 1,
    imageUrl: '/images/playa-tierra-bomba.jpg',
    status: 'available',
  },
  {
    id: 9,
    name: 'Experiencia Volcán del Totumo & Manglares',
    description: 'Visita al volcán de barro y manglares',
    price: 150000,
    durationMinutes: 360,
    touristPlaceId: 5,
    categoryId: 1,
    imageUrl: '/images/totumo.jpg',
    status: 'available',
  },
  {
    id: 10,
    name: 'Pasadía de Lujo en Cholón (Bote de Fiesta)',
    description: 'Experiencia de lujo en bote de fiesta en Cholón',
    price: 320000,
    durationMinutes: 420,
    touristPlaceId: 6,
    categoryId: 1,
    imageUrl: '/images/cholon.jpg',
    status: 'available',
  },
];

// Mock Tourist Places
export const mockTouristPlaces: TouristPlace[] = [
  { id: 1, name: 'Centro Histórico', description: 'Zona colonial y patrimonio de Cartagena', city: 'Cartagena', location: 'Cartagena de Indias', imageUrl: '/images/centro-historico.jpg', status: 'active' },
  { id: 2, name: 'Islas del Rosario', description: 'Archipiélago de islas paradisíacas frente a Cartagena', city: 'Cartagena', location: 'Cartagena', imageUrl: '/images/islas-rosario.jpg', status: 'active' },
  { id: 3, name: 'Bahía de Cartagena', description: 'Bahía natural de Cartagena', city: 'Cartagena', location: 'Cartagena', imageUrl: '/images/bahia.jpg', status: 'active' },
  { id: 4, name: 'Getsemaní', description: 'Barrio histórico y cultural de Cartagena', city: 'Cartagena', location: 'Cartagena', imageUrl: '/images/getsemaní.jpg', status: 'active' },
  { id: 5, name: 'Totumo', description: 'Volcán de barro y manglares', city: 'Cartagena', location: 'Cartagena', imageUrl: '/images/totumo.jpg', status: 'active' },
  { id: 6, name: 'Cholón', description: 'Isla privada para eventos y fiestas', city: 'Cartagena', location: 'Cartagena', imageUrl: '/images/cholón.jpg', status: 'active' },
];

// Mock Categories
export const mockCategories: Category[] = [
  { id: 1, name: 'Excursiones', description: 'Actividades guiadas en Cartagena', status: 'active' },
];

// Mock 15 Test Clients with nationalities
export const mockClients = [
  { id: 1, fullName: 'Cliente 1 Colombiana', documentNumber: '101000001', email: 'cliente1@example.com', phone: '3001000001', nationality: 'Colombiana', numberOfPeople: 2, observations: 'Cliente de prueba', status: 'active', hotelId: 1 },
  { id: 2, fullName: 'Cliente 2 estadounidense', documentNumber: '101000002', email: 'cliente2@example.com', phone: '3001000002', nationality: 'Estadounidense', numberOfPeople: 4, observations: 'Turista extranjero', status: 'active', hotelId: 2 },
  { id: 3, fullName: 'Cliente 3 Española', documentNumber: '101000003', email: 'cliente3@example.com', phone: '3001000003', nationality: 'Española', numberOfPeople: 3, observations: 'Turista europeo', status: 'active', hotelId: 3 },
  { id: 4, fullName: 'Cliente 4 Argentina', documentNumber: '101000004', email: 'cliente4@example.com', phone: '3001000004', nationality: 'Argentina', numberOfPeople: 2, observations: 'Turista suramericano', status: 'active', hotelId: 4 },
  { id: 5, fullName: 'Cliente 5 Mexicana', documentNumber: '101000005', email: 'cliente5@example.com', phone: '3001000005', nationality: 'Mexicana', numberOfPeople: 5, observations: 'Turista mexicano', status: 'active', hotelId: 5 },
  { id: 6, fullName: 'Cliente 6 Colombiana', documentNumber: '101000006', email: 'cliente6@example.com', phone: '3001000006', nationality: 'Colombiana', numberOfPeople: 3, observations: 'Cliente frecuente', status: 'active', hotelId: 1 },
  { id: 7, fullName: 'Cliente 7 estadounidense', documentNumber: '101000007', email: 'cliente7@example.com', phone: '3001000007', nationality: 'Estadounidense', numberOfPeople: 2, observations: 'Business trip', status: 'active', hotelId: 2 },
  { id: 8, fullName: 'Cliente 8 Española', documentNumber: '101000008', email: 'cliente8@example.com', phone: '3001000008', nationality: 'Española', numberOfPeople: 4, observations: 'Holiday vacation', status: 'active', hotelId: 3 },
  { id: 9, fullName: 'Cliente 9 Argentina', documentNumber: '101000009', email: 'cliente9@example.com', phone: '3001000009', nationality: 'Argentina', numberOfPeople: 2, observations: 'Cultural tour', status: 'active', hotelId: 4 },
  { id: 10, fullName: 'Cliente 5 Mexicana', documentNumber: '101000010', email: 'cliente10@example.com', phone: '3001000010', nationality: 'Mexicana', numberOfPeople: 3, observations: 'Adventure seeker', status: 'active', hotelId: 5 },
  { id: 11, fullName: 'Cliente 11 Colombiana', documentNumber: '101000011', email: 'cliente11@example.com', phone: '3001000011', nationality: 'Colombiana', numberOfPeople: 4, observations: 'Family trip', status: 'active', hotelId: 1 },
  { id: 12, fullName: 'Cliente 12 estadounidense', documentNumber: '101000012', email: 'cliente12@example.com', phone: '3001000012', nationality: 'Estadounidense', numberOfPeople: 2, observations: 'Honeymoon', status: 'active', hotelId: 2 },
  { id: 13, fullName: 'Cliente 13 Española', documentNumber: '101000013', email: 'cliente13@example.com', phone: '3001000013', nationality: 'Española', numberOfPeople: 5, observations: 'Exploring Cartagena', status: 'active', hotelId: 3 },
  { id: 14, fullName: 'Cliente 14 Argentina', documentNumber: '101000014', email: 'cliente14@example.com', phone: '3001000014', nationality: 'Argentina', numberOfPeople: 3, observations: 'Gastronomy tour', status: 'active', hotelId: 4 },
  { id: 15, fullName: 'Cliente 5 Mexicana', documentNumber: '101000015', email: 'cliente15@example.com', phone: '3001000015', nationality: 'Mexicana', numberOfPeople: 4, observations: 'Beach vacation', status: 'active', hotelId: 5 },
];

// Mock Itineraries/Reservations data for Dashboard/Reports
export const mockItineraries = [
  // Client 1 (Foreign - Cultural/Luxury)
  {
    id: 1,
    clientId: 1,
    status: 'confirmed',
    totalAmount: 510000,
    observations: 'Itinerario de prueba para Cliente 1 Colombiana',
    createdAt: new Date('2026-08-15'),
    items: [
      { id: 1, activityId: 2, quantityPeople: 2, unitPrice: 180000, subtotal: 360000 }, // Ciudad Amurallada
      { id: 2, activityId: 3, quantityPeople: 2, unitPrice: 140000, subtotal: 280000 }, // Catamaran
    ],
  },
  {
    id: 2,
    clientId: 1,
    status: 'confirmed',
    totalAmount: 390000,
    observations: 'Second itinerary for Cliente 1',
    createdAt: new Date('2026-08-18'),
    items: [
      { id: 3, activityId: 10, quantityPeople: 2, unitPrice: 320000, subtotal: 640000 }, // Lujo en Cholón
    ],
  },
  // Client 2 (Foreign - Cultural)
  {
    id: 3,
    clientId: 2,
    status: 'confirmed',
    totalAmount: 320000,
    observations: 'Itinerary for Cliente 2 estadounidense',
    createdAt: new Date('2026-08-16'),
    items: [
      { id: 4, activityId: 2, quantityPeople: 2, unitPrice: 180000, subtotal: 360000 }, // Ciudad Amurallada
    ],
  },
  // Client 3 (Foreign - Cultural)
  {
    id: 4,
    clientId: 3,
    status: 'confirmed',
    totalAmount: 300000,
    observations: 'Itinerary for Cliente 3 Española',
    createdAt: new Date('2026-08-17'),
    items: [
      { id: 5, activityId: 2, quantityPeople: 3, unitPrice: 180000, subtotal: 540000 }, // Ciudad Amurallada
    ],
  },
  // Client 4 (Foreign - Luxury)
  {
    id: 5,
    clientId: 4,
    status: 'confirmed',
    totalAmount: 640000,
    observations: 'Itinerary for Cliente 4 Argentina',
    createdAt: new Date('2026-08-20'),
    items: [
      { id: 6, activityId: 10, quantityPeople: 2, unitPrice: 320000, subtotal: 640000 }, // Lujo en Cholón
    ],
  },
  // Client 5 (Foreign - Cultural)
  {
    id: 6,
    clientId: 5,
    status: 'confirmed',
    totalAmount: 120000,
    observations: 'Itinerary for Cliente 5 Mexicana',
    createdAt: new Date('2026-08-22'),
    items: [
      { id: 7, activityId: 2, quantityPeople: 2, unitPrice: 180000, subtotal: 360000 }, // Ciudad Amurallada
    ],
  },
  // Client 6 (National - Barú/Tierra Bomba)
  {
    id: 7,
    clientId: 6,
    status: 'confirmed',
    totalAmount: 355000,
    observations: 'Itinerary for Cliente 6 Colombiana',
    createdAt: new Date('2026-08-15'),
    items: [
      { id: 8, activityId: 4, quantityPeople: 3, unitPrice: 160000, subtotal: 480000 }, // Isla Barú
    ],
  },
  // Client 7 (National - Beach)
  {
    id: 8,
    clientId: 7,
    status: 'confirmed',
    totalAmount: 390000,
    observations: 'Itinerary for Cliente 7 estadounidense',
    createdAt: new Date('2026-08-19'),
    items: [
      { id: 9, activityId: 8, quantityPeople: 2, unitPrice: 195000, subtotal: 390000 }, // Beach Club Tierra Bomba
    ],
  },
  // Client 8 (National - Totumo)
  {
    id: 9,
    clientId: 8,
    status: 'confirmed',
    totalAmount: 150000,
    observations: 'Itinerary for Cliente 8 Española',
    createdAt: new Date('2026-08-21'),
    items: [
      { id: 10, activityId: 9, quantityPeople: 2, unitPrice: 150000, subtotal: 300000 }, // Volcán Totumo
    ],
  },
  // Client 9 (National - Cocoliso)
  {
    id: 10,
    clientId: 9,
    status: 'confirmed',
    totalAmount: 350000,
    observations: 'Itinerary for Cliente 9 Argentina',
    createdAt: new Date('2026-08-23'),
    items: [
      { id: 11, activityId: 6, quantityPeople: 2, unitPrice: 350000, subtotal: 700000 }, // Cocoliso Resort
    ],
  },
  // Client 10 (National - Chiva)
  {
    id: 11,
    clientId: 10,
    status: 'confirmed',
    totalAmount: 85000,
    observations: 'Itinerary for Cliente 10 Mexicana',
    createdAt: new Date('2026-08-24'),
    items: [
      { id: 12, activityId: 7, quantityPeople: 2, unitPrice: 85000, subtotal: 170000 }, // Chiva Rumbera
    ],
  },
  // Client 11 (Mixed)
  {
    id: 12,
    clientId: 11,
    status: 'confirmed',
    totalAmount: 500000,
    observations: 'Itinerary for Cliente 11 Colombiana',
    createdAt: new Date('2026-08-15'),
    items: [
      { id: 13, activityId: 2, quantityPeople: 2, unitPrice: 180000, subtotal: 360000 }, // Ciudad Amurallada
      { id: 14, activityId: 3, quantityPeople: 2, unitPrice: 140000, subtotal: 280000 }, // Catamaran
    ],
  },
  // Client 12 (Mixed)
  {
    id: 13,
    clientId: 12,
    status: 'confirmed',
    totalAmount: 275000,
    observations: 'Itinerary for Cliente 12 estadounidense',
    createdAt: new Date('2026-08-19'),
    items: [
      { id: 15, activityId: 4, quantityPeople: 2, unitPrice: 160000, subtotal: 320000 }, // Isla Barú
      { id: 16, activityId: 7, quantityPeople: 2, unitPrice: 85000, subtotal: 170000 }, // Chiva Rumbera
    ],
  },
  // Client 13 (Mixed)
  {
    id: 14,
    clientId: 13,
    status: 'confirmed',
    totalAmount: 470000,
    observations: 'Itinerary for Cliente 13 Española',
    createdAt: new Date('2026-08-22'),
    items: [
      { id: 17, activityId: 9, quantityPeople: 2, unitPrice: 150000, subtotal: 300000 }, // Volcán Totumo
      { id: 18, activityId: 2, quantityPeople: 2, unitPrice: 180000, subtotal: 360000 }, // Ciudad Amurallada
    ],
  },
  // Client 14 (Mixed)
  {
    id: 15,
    clientId: 14,
    status: 'confirmed',
    totalAmount: 415000,
    observations: 'Itinerary for Cliente 14 Argentina',
    createdAt: new Date('2026-08-25'),
    items: [
      { id: 19, activityId: 8, quantityPeople: 3, unitPrice: 195000, subtotal: 585000 }, // Beach Club Tierra Bomba
    ],
  },
  // Client 15 (Mixed)
  {
    id: 16,
    clientId: 15,
    status: 'confirmed',
    totalAmount: 405000,
    observations: 'Itinerary for Cliente 15 Mexicana',
    createdAt: new Date('2026-08-26'),
    items: [
      { id: 20, activityId: 6, quantityPeople: 2, unitPrice: 350000, subtotal: 700000 }, // Cocoliso Resort
    ],
  },
];

// Mock Reviews/CSAT Data
export const mockReviews = [
  { id: 1, itineraryItemId: 1, ratingOverall: 5, ratingLunch: 5, ratingGuide: 5, ratingTransport: 4, comment: 'Excelente experiencia, el guía fue muy conocedor' },
  { id: 2, itineraryItemId: 2, ratingOverall: 4, ratingLunch: 4, ratingGuide: 5, ratingTransport: 3, comment: 'El transporte llegó con 15 minutos de retraso' },
  { id: 3, itineraryItemId: 3, ratingOverall: 5, ratingLunch: 5, ratingGuide: 5, ratingTransport: 5, comment: 'El almuerzo estaba delicioso y bien servido' },
  { id: 4, itineraryItemId: 4, ratingOverall: 4, ratingLunch: 4, ratingGuide: 4, ratingTransport: 4, comment: 'La playa y el mar eran hermosos, recomendado!' },
  { id: 5, itineraryItemId: 5, ratingOverall: 5, ratingLunch: 5, ratingGuide: 5, ratingTransport: 5, comment: 'La chiva rumbera fue la mejor parte de la noche' },
  { id: 6, itineraryItemId: 6, ratingOverall: 3, ratingLunch: 3, ratingGuide: 4, ratingTransport: 2, comment: 'Muy organizado y puntual, volveré a contratar' },
  { id: 7, itineraryItemId: 7, ratingOverall: 4, ratingLunch: 5, ratingGuide: 5, ratingTransport: 2, comment: 'El guide fue excelente, pero el transport tenía retrasos' },
  { id: 8, itineraryItemId: 8, ratingOverall: 5, ratingLunch: 5, ratingGuide: 5, ratingTransport: 5, comment: 'Mejor experiencia que tuve en Cartagena' },
  { id: 9, itineraryItemId: 9, ratingOverall: 5, ratingLunch: 5, ratingGuide: 5, ratingTransport: 5, comment: 'El catamarán al atardecer es imperdible' },
  { id: 10, itineraryItemId: 10, ratingOverall: 4, ratingLunch: 4, ratingGuide: 5, ratingTransport: 4, comment: 'Buen valor por el precio, recommended' },
  // Special CSAT/NPS insights
  { id: 11, itineraryItemId: 4, ratingOverall: 5, ratingLunch: 5, ratingGuide: 5, ratingTransport: 5, comment: 'El 90% de los clientes calificaron el almuerzo de Tour Barú con 5 estrellas' },
  { id: 12, itineraryItemId: 7, ratingOverall: 3, ratingLunch: 4, ratingGuide: 4, ratingTransport: 1, comment: 'Retrasos en el transporte, el guía llegó 20 minutos tarde' },
];

// Mock Dashboard Insights Data
export const mockDashboardInsights = {
  // Hotel conversion metrics
  hotelConversion: [
    { hotel: 'Hotel Las Américas', conversion: 34, previousMonth: 10, trend: 'up' },
    { hotel: 'Sofitel Legend Santa Clara', conversion: 28, previousMonth: 15, trend: 'up' },
    { hotel: 'Hotel Estelar Bocagrande', conversion: 18, previousMonth: 12, trend: 'down' },
    { hotel: 'Hyatt Regency Cartagena', conversion: 12, previousMonth: 8, trend: 'up' },
    { hotel: 'Selina Getsemaní', conversion: 8, previousMonth: 6, trend: 'up' },
  ],
  // Tour satisfaction rates
  tourSatisfaction: [
    { tour: 'Islas del Rosario', satisfaction: 96, category: 'almuerzos' },
    { tour: 'Tour Ciudad Amurallada', satisfaction: 92, category: 'general' },
    { tour: 'Atardecer en Catamarán', satisfaction: 94, category: 'experiencia' },
    { tour: 'Pasadía Isla Barú', satisfaction: 89, category: 'general' },
    { tour: 'Tour Gastronómico Getsemaní', satisfaction: 91, category: 'gastronomía' },
    { tour: 'Cocoliso Resort', satisfaction: 93, category: 'lujo' },
    { tour: 'Chiva Rumbera', satisfaction: 85, category: 'diversión' },
    { tour: 'Beach Club Tierra Bomba', satisfaction: 90, category: 'playa' },
    { tour: 'Volcán del Totumo', satisfaction: 88, category: 'aventura' },
    { tour: 'Lujo en Cholón', satisfaction: 95, category: 'lujo' },
  ],
  // Nationality preferences
  nationalityPreferences: {
    extranjeros: {
      label: 'Turistas Extranjeros',
      preferredTours: ['Ciudad Amurallada', 'Catamarán', 'Cholón', 'Islas del Rosario'],
      description: 'Prefieren tours culturales y de lujo',
    },
    nacionales: {
      label: 'Turistas Nacionales',
      preferredTours: ['Isla Barú', 'Tierra Bomba', 'Totumo', 'Cocoliso'],
      description: 'Prefieren pasadías de playa',
    },
  },
  // Key metrics
  keyMetrics: {
    totalClients: 15,
    totalItineraries: 16,
    totalRevenue: 6215000,
    averageTicket: 388437,
    satisfactionRate: 91,
    npsScore: 42,
  },
  // Comparison insights
  comparisonInsights: [
    'Tu hotel con mayor conversión este mes fue "Hotel Las Américas" (+34% vs mes anterior)',
    'El Tour Islas del Rosario tiene una tasa de satisfacción del 96% en almuerzos',
    'Los turistas extranjeros consumen un 40% más en tours culturales vs nacionales',
    'El ticket promedio de tours de lujo es un 250% superior a tours estándar',
    'La alerta del sistema: 2 tours con retrasos de transporte reportados este mes',
  ],
};

// All mock data is exported individually via export const above