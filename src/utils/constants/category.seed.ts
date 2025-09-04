export type CategorySeed = { title: string; description?: string; type: string };

export const CATEGORY_SEED_DATA: CategorySeed[] = [
  {
    title: 'Live Concerts & Club Nights',
    type: 'Physical',
    description: 'Main theatre shows, KOKO Electronic, headline gigs open to public & members',
  },
  {
    title: 'Balcony Theatre Viewing',
    type: 'Physical (Members)',
    description: 'Exclusive member-only vantage point with table service',
  },
  {
    title: 'Rooftop DJ Parties',
    type: 'Physical (Members)',
    description: 'DJs, jazz, and acoustic sets on rooftop terrace',
  },
  {
    title: 'Jazz & Soul Nights',
    type: 'Physical (Members)',
    description: 'Small intimate gigs in lounges (e.g. Ellen’s)',
  },
  {
    title: 'Cultural Programming (Talks, Film, Poetry, Games)',
    type: 'Physical (Members)',
    description: 'Member events like panel talks, screenings, poetry, games nights',
  },
  {
    title: 'Immersive Parties (House Parties, Gospel Brunch, Afterparties)',
    type: 'Physical (Members)',
    description: 'Signature themed events curated for members',
  },
  {
    title: 'Supper Clubs / Dining Experiences',
    type: 'Physical (Members)',
    description: 'Chef’s table, wine tastings, cocktail showcases',
  },
  {
    title: 'Write Club',
    type: 'Physical (Members)',
    description: 'Monthly writers’ development workshop hosted in one of the House’s private spaces',
  },
  {
    title: 'Livestream Concerts',
    type: 'Digital',
    description: 'Select gigs streamed live',
  },
  {
    title: 'Behind-the-Scenes Artist Content',
    type: 'Digital (Members)',
    description: 'Exclusive interviews, studio sessions, playlists via app',
  },
  {
    title: 'Member Community on App',
    type: 'Digital',
    description: 'Updates, ticket drops, collaboration features',
  },
  {
    title: 'Concerts with Livestream Option',
    type: 'Hybrid',
    description: 'Live gig in theatre + online streaming for remote members',
  },
  {
    title: 'Panel Discussions / Talks Online',
    type: 'Hybrid',
    description: 'Held at KOKO, streamed for digital members',
  },
  {
    title: 'Music/Art Workshops & Masterclasses',
    type: 'Hybrid',
    description: 'e.g. vinyl sessions, production masterclasses',
  },
  {
    title: 'Festival Takeovers (All Points East, Frieze)',
    type: 'Hybrid',
    description: 'Members attend physically; digital perks include early access & content',
  },
  {
    title: 'Glastonbury £30K Luxury Tents',
    type: 'Getaway / Premium',
    description: 'Exclusive festival hospitality package',
  },
  {
    title: 'Artist Retreats & Trips',
    type: 'Getaway / Premium',
    description: 'Curated travel experiences with artists and community',
  },
  {
    title: 'International Partnered Events',
    type: 'Getaway / Premium',
    description: 'VIP access to music/art events abroad',
  },
];

