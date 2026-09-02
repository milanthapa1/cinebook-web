import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useMovies } from '../features/movies/useMovies';

const normaliseMovie = (m: any) => ({
  ...m,
  releaseDate: typeof m.releaseDate === 'string'
    ? /^\d{4}-\d{2}-\d{2}T/.test(m.releaseDate)
      ? new Date(m.releaseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
      : m.releaseDate
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
  const allMovies = (apiMovies ?? []).map(normaliseMovie);

  const heroMovies  = allMovies.filter((m) => m.isShowing);
  const nowShowing  = allMovies.filter((m) => m.isShowing);
  const comingSoon  = allMovies.filter((m) => !m.isShowing);
  const displayList = activeTab === 'NOW_SHOWING' ? nowShowing : comingSoon;

  const next = useCallback(
    () => setCurrentSlide((p) => (heroMovies.length ? (p + 1) % heroMovies.length : 0)),
    [heroMovies.length],
  );
  const prev = useCallback(
    () => setCurrentSlide((p) => (heroMovies.length ? (p - 1 + heroMovies.length) % heroMovies.length : 0)),
    [heroMovies.length],
  );

  useEffect(() => {
    if (heroMovies.length === 0) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next, heroMovies.length]);

  const isLoading = apiMovies === undefined;

  if (isLoading) {
    return (
    <div className="bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        {/* Hero skeleton */}
      <div className="relative w-full overflow-hidden bg-black select-none" style={{ height: 'clamp(340px, 52vw, 560px)' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-8 sm:px-14 pb-10 pt-16 space-y-4">
            <div className="skeleton h-4 w-28 rounded bg-[#00a8cc]/30" />
            <div className="skeleton h-12 w-96 max-w-full rounded bg-white/20" />
            <div className="skeleton h-10 w-28 rounded bg-[#00a8cc]/40" />
          </div>
          {/* Dot indicators skeleton */}
          <div className="absolute bottom-4 right-6 z-20 flex items-center gap-1.5">
            <div className="skeleton w-6 h-1.5 rounded-full bg-white/20" />
            <div className="skeleton w-1.5 h-1.5 rounded-full bg-white/10" />
            <div className="skeleton w-1.5 h-1.5 rounded-full bg-white/10" />
          </div>
        </div>

        {/* Movies section skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          {/* Tab strip */}
          <div className="flex items-center gap-8 border-b border-gray-200 dark:border-gray-800 pb-0 mb-8">
            <div className="skeleton h-4 w-24 rounded mb-3" />
            <div className="skeleton h-4 w-24 rounded mb-3" />
          </div>
          {/* Movie card grid skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                {/* Top bar */}
                <div className="skeleton h-6 w-full rounded-none" />
                {/* Poster */}
                <div className="skeleton aspect-[2/3] w-full rounded-none" />
                {/* Dashed line */}
                <div className="border-t-2 border-dashed border-gray-200 dark:border-gray-700" />
                {/* Footer */}
                <div className="p-3 space-y-1.5 bg-gray-50 dark:bg-gray-800">
                  <div className="skeleton h-3 w-3/4 mx-auto rounded" />
                  <div className="skeleton h-2.5 w-1/2 mx-auto rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">

      {/* ── Hero Slideshow ───────────────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden bg-black select-none" style={{ height: 'clamp(380px, 46vw, 500px)' }}>

        {/* Slides track */}
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * (100 / heroMovies.length)}%)`, width: `${heroMovies.length * 100}%` }}
        >
          {heroMovies.map((movie) => {
            /* If bannerUrl exists it already has c_fill,w_1920,h_500 baked in from upload.
               If falling back to posterUrl, inject a landscape crop transformation so it
               doesn't look portrait/zoomed in the hero. */
            const bgImage = movie.bannerUrl
              ? movie.bannerUrl
              : movie.posterUrl.includes('/upload/')
                ? movie.posterUrl.replace('/upload/', '/upload/c_fill,w_1920,h_500,g_north/')
                : movie.posterUrl;
            return (
              <div
                key={movie.id}
                className="relative h-full shrink-0"
                style={{ width: `calc(100% / ${heroMovies.length})` }}
              >
                {/* Full-bleed background image — no zoom trick, no blur */}
                <img
                  src={bgImage}
                  alt={movie.title}
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />

                {/* Left-side dark gradient for text legibility only - no full overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />

                {/* Content - bottom-left, minimal - exactly like QFX */}
                <div className="absolute bottom-0 left-0 right-0 px-8 sm:px-14 pb-10 pt-16">
                  {/* NOW SHOWING label */}
                  <p className="text-[#00a8cc] text-xs font-semibold uppercase tracking-[0.2em] mb-2">
                    Now Showing
                  </p>

                  {/* Movie title - large, white */}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pb-10">

        {/* Tab strip */}
        <div className="flex items-center gap-8 border-b border-gray-200 pb-0 mb-8 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('NOW_SHOWING')}
            className={`text-base font-semibold pb-3 transition-all relative ${
              activeTab === 'NOW_SHOWING'
                ? 'text-[#00a8cc] border-b-2 border-[#00a8cc]'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Now Showing
            <span className="ml-2 px-1.5 py-0.5 bg-[#00a8cc]/10 text-[#00a8cc] rounded text-[10px] font-semibold">
              {nowShowing.length}
            </span>
          </button>

          <span className="text-gray-200 text-lg pb-3 dark:text-gray-700">|</span>

          <button
            onClick={() => setActiveTab('COMING_SOON')}
            className={`text-base font-semibold pb-3 flex items-center gap-1.5 transition-all relative ${
              activeTab === 'COMING_SOON'
                ? 'text-amber-500 border-b-2 border-amber-500'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
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
              className="group bg-white rounded-xl overflow-hidden cursor-pointer border border-gray-200 hover:border-[#00a8cc]/40 transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-lg dark:bg-gray-900 dark:border-gray-800"
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
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-200 dark:bg-gray-800">
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
              <div className="p-3 text-center bg-gray-50 space-y-0.5 dark:bg-gray-800">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-[#00a8cc] transition-colors truncate dark:text-gray-100">
                  {movie.title}
                </h3>
                <p className="text-[10px] text-gray-500 truncate dark:text-gray-400">
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
