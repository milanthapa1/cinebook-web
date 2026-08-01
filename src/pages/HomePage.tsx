import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useMovies } from '../features/movies/useMovies';
import { ALL_MOVIES_DATA } from '../features/movies/moviesData';

const normaliseMovie = (m: any) => ({
  ...m,
  releaseDate: typeof m.releaseDate === 'string'
    ? m.releaseDate
    : new Date(m.releaseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
  format: Array.isArray(m.format) ? m.format : [m.format],
  genre: Array.isArray(m.genre) ? m.genre : [m.genre],
  cast: Array.isArray(m.cast) ? m.cast : [],
  badge: m.badge ?? null,
  bannerUrl: m.bannerUrl ?? null,
});

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<'NOW_SHOWING' | 'COMING_SOON'>('NOW_SHOWING');

  const { data: apiMovies } = useMovies();
  const allMovies = apiMovies?.length ? apiMovies.map(normaliseMovie) : ALL_MOVIES_DATA;

  const heroMovies  = allMovies.filter((m) => m.isShowing);
  const nowShowing  = allMovies.filter((m) => m.isShowing);
  const comingSoon  = allMovies.filter((m) => !m.isShowing);
  const displayList = activeTab === 'NOW_SHOWING' ? nowShowing : comingSoon;

  const next = useCallback(() => setCurrentSlide((p) => (p + 1) % heroMovies.length), [heroMovies.length]);
  const prev = useCallback(() => setCurrentSlide((p) => (p - 1 + heroMovies.length) % heroMovies.length), [heroMovies.length]);

  useEffect(() => {
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">

      {/* ── Hero Slideshow ───────────────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden bg-black select-none" style={{ height: 'clamp(340px, 52vw, 560px)' }}>

        {/* Slides track */}
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)`, width: `${heroMovies.length * 100}%` }}
        >
          {heroMovies.map((movie) => {
            /* Use dedicated banner if uploaded, otherwise fall back to poster */
            const bgImage = movie.bannerUrl || movie.posterUrl;
            return (
              <div
                key={movie.id}
                className="relative h-full shrink-0"
                style={{ width: `${100 / heroMovies.length}%` }}
              >
                {/* Full-bleed background image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${bgImage})` }}
                />

                {/* Left-side dark gradient for text legibility only — no full overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />

                {/* Content — bottom-left, minimal — exactly like QFX */}
                <div className="absolute bottom-0 left-0 right-0 px-8 sm:px-14 pb-10 pt-16">
                  {/* NOW SHOWING label */}
                  <p className="text-[#00a8cc] text-xs font-semibold uppercase tracking-[0.2em] mb-2">
                    Now Showing
                  </p>

                  {/* Movie title — large, white */}
                  <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight drop-shadow-md max-w-2xl">
                    {movie.title}
                  </h1>

                  {/* Buy Now button */}
                  <button
                    onClick={() => navigate(`/showtimes?movieId=${movie.id}`)}
                    className="mt-5 inline-flex items-center px-7 py-2.5 bg-[#00a8cc] hover:bg-[#0096c7] text-white font-semibold text-sm rounded transition-colors active:scale-95"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Prev arrow */}
        <button
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-[#00a8cc] text-white flex items-center justify-center transition-colors border border-white/10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Next arrow */}
        <button
          onClick={next}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-[#00a8cc] text-white flex items-center justify-center transition-colors border border-white/10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-4 right-6 z-20 flex items-center gap-1.5">
          {heroMovies.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === currentSlide ? 'w-6 h-1.5 bg-[#00a8cc]' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Movies section ───────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">

        {/* Tab strip */}
        <div className="flex items-center gap-8 border-b border-gray-200 pb-0 mb-8">
          <button
            onClick={() => setActiveTab('NOW_SHOWING')}
            className={`text-base font-semibold pb-3 transition-all relative ${
              activeTab === 'NOW_SHOWING'
                ? 'text-[#00a8cc] border-b-2 border-[#00a8cc]'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Now Showing
            <span className="ml-2 px-1.5 py-0.5 bg-[#00a8cc]/10 text-[#00a8cc] rounded text-[10px] font-semibold">
              {nowShowing.length}
            </span>
          </button>

          <span className="text-gray-200 text-lg pb-3">|</span>

          <button
            onClick={() => setActiveTab('COMING_SOON')}
            className={`text-base font-semibold pb-3 flex items-center gap-1.5 transition-all relative ${
              activeTab === 'COMING_SOON'
                ? 'text-amber-500 border-b-2 border-amber-500'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-500" /> Coming Soon
            <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 rounded text-[10px] font-semibold">
              {comingSoon.length}
            </span>
          </button>
        </div>

        {/* Movie card grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {displayList.map((movie) => (
            <div
              key={movie.id}
              onClick={() =>
                activeTab === 'NOW_SHOWING'
                  ? navigate(`/showtimes?movieId=${movie.id}`)
                  : navigate(`/movies/${movie.id}`)
              }
              className="group bg-white rounded-xl overflow-hidden cursor-pointer border border-gray-200 hover:border-[#00a8cc]/40 transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Top bar */}
              <div className="qfx-card-top-bar text-white text-[10px] font-semibold px-2.5 py-1.5 flex items-center justify-between">
                <span>{movie.badge || movie.releaseDate}</span>
                {movie.badge && (
                  <span className="text-[9px] bg-black/25 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    {movie.isShowing ? 'Now Showing' : 'Upcoming'}
                  </span>
                )}
              </div>

              {/* Poster */}
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-200">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Rating badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase text-white ${
                    movie.rating === 'Adult' ? 'bg-red-700'
                    : movie.rating === 'U'   ? 'bg-teal-600'
                    : 'bg-[#00a8cc]'
                  }`}>
                    {movie.rating}
                  </span>
                </div>

                {/* Coming soon date overlay */}
                {!movie.isShowing && (
                  <div className="absolute inset-0 bg-gray-900/25 flex items-end p-3">
                    <span className="px-2 py-1 bg-amber-500/90 text-black text-[9px] font-semibold uppercase rounded tracking-wider">
                      {movie.releaseDate}
                    </span>
                  </div>
                )}
              </div>

              {/* Dashed ticket stub line */}
              <div className="ticket-dashed-line" />

              {/* Footer */}
              <div className="p-3 text-center bg-gray-50 space-y-0.5">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-[#00a8cc] transition-colors truncate">
                  {movie.title}
                </h3>
                <p className="text-[10px] text-gray-500 truncate">
                  {movie.language} &bull; {movie.genre.slice(0, 2).join(', ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
