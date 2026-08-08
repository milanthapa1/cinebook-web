export interface MovieDetailItem {
  id: string;
  title: string;
  year: string;
  synopsis: string;
  posterUrl: string;
  trailerUrl: string;
  genre: string[];
  language: string;
  format: string[];
  runtimeMins: number;
  rating: 'PG' | 'Adult' | 'U';
  badge?: string;
  releaseDate: string;
  isShowing: boolean;
  cast: Array<{ name: string; role: string; photoUrl: string }>;
}

export const ALL_MOVIES_DATA: MovieDetailItem[] = [
  {
    id: 'mov_intothewild',
    title: 'Into the Wild',
    year: '2026',
    synopsis: 'An inspiring adventure of a young man who leaves society behind to embark on a solitary journey into the Alaskan wilderness.',
    posterUrl: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&q=80&w=800',
    trailerUrl: 'https://www.youtube.com/embed/g7ArZ7VD-y0',
    genre: ['Adventure', 'Biography', 'Drama'],
    language: 'English',
    format: ['IMAX 2D', '4K LASER'],
    runtimeMins: 148,
    rating: 'PG',
    badge: 'Trending',
    releaseDate: '01 AUG 2026',
    isShowing: true,
    cast: [
      { name: 'Emile Hirsch', role: 'Christopher McCandless', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' },
      { name: 'Marcia Gay Harden', role: 'Billie McCandless', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' },
    ],
  },
  {
    id: 'mov_spiderverse',
    title: 'Spider-Man: Brand New Day',
    year: '2026',
    synopsis: 'Peter Parker tries to focus on college and leave Spider-Man behind. But when a new threat endangers his friends, he must break his oath and swing back into action.',
    posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&q=80&w=800',
    trailerUrl: 'https://www.youtube.com/embed/cqGjhVJWtEg',
    genre: ['Fantasy', 'Action', 'Adventure'],
    language: 'English, Hindi Dubbed',
    format: ['IMAX 3D', '4K LASER'],
    runtimeMins: 146,
    rating: 'PG',
    badge: 'Super Hit',
    releaseDate: '30 JUL 2026',
    isShowing: true,
    cast: [
      { name: 'Tom Holland', role: 'Peter Parker / Spider-Man', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' },
      { name: 'Zendaya', role: 'MJ', photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
      { name: 'Jacob Batalon', role: 'Ned Leeds', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
    ],
  },
  {
    id: 'mov_gauthali',
    title: 'Gauthali',
    year: '2026',
    synopsis: 'A touching story set in the lush hills of Western Nepal following a young woman fighting against traditional boundaries to preserve her family lineage.',
    posterUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
    trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w',
    genre: ['Social Drama', 'Family'],
    language: 'Nepali',
    format: ['2D LASER'],
    runtimeMins: 135,
    rating: 'PG',
    badge: 'Super Hit',
    releaseDate: '17 JUL 2026',
    isShowing: true,
    cast: [
      { name: 'Thinley Lhamo', role: 'Gauthali', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
      { name: 'Dayahang Rai', role: 'Bir Bahadur', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' },
    ],
  },
  {
    id: 'mov_odyssey',
    title: 'The Odyssey',
    year: '2026',
    synopsis: 'An epic cinematic journey charting Odysseus 10-year struggle to return home after the Trojan War against mythical beasts and vengeful gods.',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800',
    trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w',
    genre: ['Action', 'Adventure', 'Fantasy'],
    language: 'English, Hindi Dubbed',
    format: ['IMAX 2D', 'DOLBY ATMOS'],
    runtimeMins: 165,
    rating: 'Adult',
    releaseDate: '17 JUL 2026',
    isShowing: true,
    cast: [
      { name: 'Cillian Murphy', role: 'Odysseus', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
      { name: 'Emily Blunt', role: 'Penelope', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' },
    ],
  },
  {
    id: 'mov_dhamaal4',
    title: 'Dhamaal 4',
    year: '2026',
    synopsis: 'The hilarious group of friends reunite for another madcap wild treasure hunt filled with hilarious misunderstandings and non-stop comedy chaos.',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
    trailerUrl: 'https://www.youtube.com/embed/uYPbbksJxIg',
    genre: ['Comedy', 'Drama'],
    language: 'Hindi',
    format: ['2D LASER'],
    runtimeMins: 142,
    rating: 'PG',
    releaseDate: '10 JUL 2026',
    isShowing: true,
    cast: [
      { name: 'Ajay Devgn', role: 'Goploo', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' },
      { name: 'Ritesh Deshmukh', role: 'Desh', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
    ],
  },
  {
    id: 'mov_halee',
    title: 'Halee',
    year: '2026',
    synopsis: 'An emotional story depicting traditional farming life in Eastern Nepal and the struggles of local youth facing modern migration.',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800',
    trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w',
    genre: ['Nepali', 'Social Drama'],
    language: 'Nepali',
    format: ['2D'],
    runtimeMins: 130,
    rating: 'U',
    releaseDate: '07 Aug 2026',
    isShowing: false,
    cast: [
      { name: 'Bipin Karki', role: 'Halee Ram', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' },
    ],
  },
  {
    id: 'mov_masterni',
    title: 'Masterni',
    year: '2026',
    synopsis: 'A dedicated village school teacher uncovers a corruption conspiracy and fights to protect her students educational rights.',
    posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800',
    trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w',
    genre: ['Crime', 'Thriller', 'Mystery'],
    language: 'Nepali',
    format: ['2D'],
    runtimeMins: 138,
    rating: 'PG',
    releaseDate: '21 Aug 2026',
    isShowing: false,
    cast: [
      { name: 'Swastima Khadka', role: 'Masterni', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
    ],
  },
  {
    id: 'mov_insidious',
    title: 'Insidious: Out of the Further',
    year: '2026',
    synopsis: 'The Lambert family must go deeper into the Further than ever before to face their demons and close the door on the dark realm once and for all.',
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=800',
    trailerUrl: 'https://www.youtube.com/embed/cqGjhVJWtEg',
    genre: ['Mystery', 'Thriller', 'Horror'],
    language: 'English',
    format: ['DOLBY ATMOS', '2D'],
    runtimeMins: 118,
    rating: 'Adult',
    releaseDate: '21 Aug 2026',
    isShowing: false,
    cast: [
      { name: 'Patrick Wilson', role: 'Josh Lambert', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
    ],
  },
  {
    id: 'mov_drishyam3',
    title: 'Drishyam 3',
    year: '2026',
    synopsis: 'Vijay Salgaonkar faces his ultimate trial as new forensic technology reopens the case that threatened his family years ago.',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800',
    trailerUrl: 'https://www.youtube.com/embed/uYPbbksJxIg',
    genre: ['Thriller', 'Crime'],
    language: 'Hindi',
    format: ['2D LASER'],
    runtimeMins: 155,
    rating: 'PG',
    releaseDate: '02 Oct 2026',
    isShowing: false,
    cast: [
      { name: 'Ajay Devgn', role: 'Vijay Salgaonkar', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' },
      { name: 'Tabu', role: 'Meera Deshmukh', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' },
    ],
  },
];

export const getMovieById = (id: string): MovieDetailItem => {
  const found = ALL_MOVIES_DATA.find((m) => m.id === id);
  return found || ALL_MOVIES_DATA[0];
};
