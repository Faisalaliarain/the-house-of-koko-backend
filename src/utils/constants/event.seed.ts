export type EventSeed = {
  title: string;
  categorySlug: string; // will be resolved to category ObjectId
  price: { min: number; max: number; currency: string };
  status?: string;
  datetime?: { date?: string; start_time?: string; end_time?: string; timezone?: string };
  venue?: { name?: string; address?: string | null; city?: string; country?: string };
  image_url?: string;
  description?: string;
};

export const EVENT_SEED_DATA: EventSeed[] = [
  {
    title: 'Amos Lee Concert',
    categorySlug: 'live-concerts-club-nights',
    price: { min: 500, max: 2000, currency: 'GBP' },
    status: 'Almost Sold Out',
    datetime: { date: '2025-07-17', start_time: '18:00', end_time: '20:00', timezone: 'Europe/London' },
    venue: { name: 'Main Theatre, The House of KOKO', address: null, city: 'London', country: 'UK' },
    image_url: 'https://example.com/event-images/amos-lee.jpg',
    description:
      "Over a storied and prolific career spanning two decades, Philadelphia songwriter Amos Lee has traversed folk and soul-pop, country & more, supporting the likes of Bob Dylan, Paul Simon and playing for Barack Obama.",
  },
  {
    title: 'Sunset Rooftop DJ Set',
    categorySlug: 'rooftop-dj-parties',
    price: { min: 50, max: 150, currency: 'GBP' },
    status: 'Tickets Available',
    datetime: { date: '2025-08-12', start_time: '19:00', end_time: '23:00', timezone: 'Europe/London' },
    venue: { name: 'Rooftop Terrace, The House of KOKO', address: null, city: 'London', country: 'UK' },
    image_url: 'https://example.com/event-images/rooftop-dj.jpg',
    description: 'DJs spinning house and nu‑disco as the sun sets over Camden.'
  },
  {
    title: 'Jazz & Soul Evening',
    categorySlug: 'jazz-soul-nights',
    price: { min: 80, max: 200, currency: 'GBP' },
    status: 'Limited',
    datetime: { date: '2025-09-05', start_time: '20:00', end_time: '22:30', timezone: 'Europe/London' },
    venue: { name: "Ellen's Lounge", address: null, city: 'London', country: 'UK' },
    image_url: 'https://example.com/event-images/jazz-soul.jpg',
    description: 'An intimate night of classic standards and modern soul.'
  },
  {
    title: 'Livestream: Behind the Scenes with KOKO',
    categorySlug: 'behind-the-scenes-artist-content',
    price: { min: 0, max: 0, currency: 'GBP' },
    status: 'Streaming Soon',
    datetime: { date: '2025-07-30', start_time: '17:00', end_time: '18:00', timezone: 'Europe/London' },
    venue: { name: 'Online', address: null, city: 'London', country: 'UK' },
    image_url: 'https://example.com/event-images/bts.jpg',
    description: 'Exclusive interviews, studio sessions, and playlists via the app.'
  },
  {
    title: 'Hybrid Panel: Music Production Masterclass',
    categorySlug: 'musicart-workshops-masterclasses',
    price: { min: 120, max: 300, currency: 'GBP' },
    status: 'Tickets Available',
    datetime: { date: '2025-10-01', start_time: '16:00', end_time: '18:30', timezone: 'Europe/London' },
    venue: { name: 'Studio A, The House of KOKO', address: null, city: 'London', country: 'UK' },
    image_url: 'https://example.com/event-images/masterclass.jpg',
    description: 'Hands‑on session with producers; attend in person or stream online.'
  },
];

