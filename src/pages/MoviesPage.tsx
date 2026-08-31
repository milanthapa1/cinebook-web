import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Ticket, Info } from 'lucide-react';
import { useMovies } from '../features/movies/useMovies';

// ─── Movie Card ───────────────────────────────────────────────────────────────
interface MovieCardProps {
  movie: {
    id: string;
    title: string;
    posterUrl: string;
    rating: string;
    language: string;
    genre: string[];
    runtimeMins: number;
    isShowing: boolean;
  };
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Now Showing → booking flow (showtimes page)
    // Coming Soon → info/detail page
    if (movie.isShowing) {
      navigate(`/showtimes?movieId=${movie.id}`);
    } else {
      navigate(`/movies/${movie.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative bg-white rounded-xl overflow-hidden cursor-pointer border border-gray-200 hover:border-[#00a8cc]/50 transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-200">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Dark overlay - light tint only for button legibility */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Status badge - top left */}
        <div className="absolute top-2 left-2">
          <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
            movie.isShowing
              ? 'bg-emerald-500 text-white'
              : 'bg-gray-500/80 text-white'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${movie.isShowing ? 'bg-white' : 'bg-gray-400'}`} />
            {movie.isShowing ? 'Now Showing' : 'Coming Soon'}
          </span>
        </div>

        {/* Rating badge - top right */}
        <div className="absolute top-2 right-2">
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-black text-white ${
            movie.rating === 'R' ? 'bg-rose-600' :
            movie.rating === 'PG-13' ? 'bg-orange-600' :
            movie.rating === 'PG' ? 'bg-teal-600' : 'bg-[#00a8cc]'
          }`}>
            {movie.rating}
          </span>
        </div>

        {/* ── CTA Button - animates from top edge to center on hover ── */}
        {movie.isShowing ? (
          /* NOW SHOWING: "Buy Tickets" slides from top → center, fades back top on leave */
          <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex items-center justify-center
                          opacity-0 -translate-y-8
                          group-hover:opacity-100 group-hover:translate-y-0
                          transition-all duration-300 ease-out
                          pointer-events-none group-hover:pointer-events-auto">
            <span className="flex items-center gap-1.5 px-4 py-2 bg-[#00a8cc] hover:bg-[#0096c7] text-white text-xs font-extrabold rounded-lg uppercase tracking-wide whitespace-nowrap">
              <Ticket className="w-3.5 h-3.5" /> Buy Tickets
            </span>
          </div>
        ) : (
          /* COMING SOON: "More Info" slides from top → center on hover */
          <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex items-center justify-center
                          opacity-0 -translate-y-8
                          group-hover:opacity-100 group-hover:translate-y-0
                          transition-all duration-300 ease-out
                          pointer-events-none group-hover:pointer-events-auto">
            <span className="flex items-center gap-1.5 px-4 py-2 bg-white/90 hover:bg-white text-gray-800 text-xs font-semibold rounded-lg uppercase tracking-wide border border-gray-200 whitespace-nowrap">
              <Info className="w-3.5 h-3.5 text-[#00a8cc]" /> More Info
            </span>
          </div>
        )}
      </div>

      {/* Dashed divider */}
      <div className="ticket-dashed-line" />

      {/* Footer */}
      <div className="px-3 py-2.5 bg-gray-50 flex-1 flex flex-col justify-center">
        <h3 className="text-xs font-extrabold text-gray-900 group-hover:text-[#00a8cc] transition-colors truncate leading-tight">
          {movie.title}
        </h3>
        <p className="text-[10px] text-gray-500 truncate mt-0.5">
          {movie.language} &bull; {movie.runtimeMins}m &bull; {(movie.genre || []).slice(0, 1).join(', ')}
        </p>
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export const MoviesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'showing' | 'soon'>('all');

  const { data: apiMovies, isLoading } = useMovies({
    search: search.trim() || undefined,
    genre: selectedGenre || undefined,
    language: selectedLanguage || undefined,
    format: selectedFormat || undefined,
  });

  const allMovies: any[] = apiMovies || [];

  const movies = useMemo(() => {
    const filtered = allMovies.filter(m => {
      const q = search.toLowerCase();
      const matchSearch = !search || m.title.toLowerCase().includes(q);
      const matchGenre  = !selectedGenre  || (Array.isArray(m.genre)  ? m.genre.includes(selectedGenre)   : false);
      const matchLang   = !selectedLanguage || m.language === selectedLanguage;
      const matchFmt    = !selectedFormat  || (Array.isArray((m as any).format) ? (m as any).format.includes(selectedFormat) : false);
      return matchSearch && matchGenre && matchLang && matchFmt;
    });
    if (activeTab === 'showing') return filtered.filter(m => m.isShowing);
    if (activeTab === 'soon')    return filtered.filter(m => !m.isShowing);
    return filtered;
  }, [allMovies, search, selectedGenre, selectedLanguage, selectedFormat, activeTab]);

  const nowCount  = allMovies.filter(m => m.isShowing).length;
  const soonCount = allMovies.filter(m => !m.isShowing).length;

  const genres    = ['Action', 'Sci-Fi', 'Drama', 'Adventure', 'Animation', 'Biography', 'Mystery', 'Crime', 'Comedy', 'Romance'];
  const languages = ['English', 'Nepali', 'Hindi'];
  const formats   = ['IMAX', '3D', '2D'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 min-h-screen">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Movies</h1>
        <p className="text-xs text-gray-500 mt-1">
          <span className="text-emerald-600 font-bold">{nowCount} Now Showing</span>
          <span className="mx-2 text-gray-300">·</span>
          <span className="text-amber-600 font-bold">{soonCount} Coming Soon</span>
        </p>
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3 shadow-sm">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, genre or language..."
            className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#00a8cc] transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <select value={selectedGenre} onChange={e => setSelectedGenre(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#00a8cc] text-xs">
            <option value="">All Genres</option>
            {genres.map(g => <option key={g}>{g}</option>)}
          </select>
          <select value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#00a8cc] text-xs">
            <option value="">All Languages</option>
            {languages.map(l => <option key={l}>{l}</option>)}
          </select>
          <select value={selectedFormat} onChange={e => setSelectedFormat(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#00a8cc] text-xs">
            <option value="">All Formats</option>
            {formats.map(f => <option key={f}>{f}</option>)}
          </select>
          {(search || selectedGenre || selectedLanguage || selectedFormat) && (
            <button onClick={() => { setSearch(''); setSelectedGenre(''); setSelectedLanguage(''); setSelectedFormat(''); }}
              className="text-[#00a8cc] hover:underline px-2 py-1.5 text-xs">Reset</button>
          )}
        </div>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-2">
        {([['all', 'All'], ['showing', 'Now Showing'], ['soon', 'Coming Soon']] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setActiveTab(val)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === val ? 'bg-[#00a8cc] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] shimmer rounded-xl" />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 space-y-3 shadow-sm">
          <p className="text-sm font-semibold text-gray-600">No movies match your filters</p>
          <button onClick={() => { setSearch(''); setSelectedGenre(''); setSelectedLanguage(''); setSelectedFormat(''); setActiveTab('all'); }}
            className="text-xs text-[#00a8cc] font-bold hover:underline">Clear Filters</button>
        </div>
      )}
    </div>
  );
};
