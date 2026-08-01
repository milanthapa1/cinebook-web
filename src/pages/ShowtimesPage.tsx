import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronDown, ChevronUp, Play, ShieldAlert, X,
  ArrowRight, CheckCircle2, Film, CalendarDays,
} from 'lucide-react';
import { getMovieById } from '../features/movies/moviesData';
import { useMovieDetail } from '../features/movies/useMovies';
import { useMovies } from '../features/movies/useMovies';
import { useLocationStore, useLiveLocations } from '../features/location/useLocationStore';
import { useShowtimes } from '../features/showtimes/useShowtimes';
import {
  generateBookingDates,
  groupShowtimesByCinema,
  findSlotByTime,
  isPastSlot,
} from '../features/showtimes/showtimeHelpers';
import { useSeats, useHoldSeats } from '../features/seat-selection/useSeats';
import { useSeatStore } from '../features/seat-selection/useSeatStore';
import { useAuthStore } from '../features/auth/useAuthStore';

// ─── Seat Map ─────────────────────────────────────────────────────────────────
const SeatMap: React.FC<{ showtimeId: string; movieTitle: string; language: string }> = ({ showtimeId }) => {
  const { data: seats, isLoading } = useSeats(showtimeId);
  const { selectedSeats, seatError, clearSeatError, toggleSeat } = useSeatStore();

  if (isLoading) return (
    <div className="space-y-4 py-6">
      <div className="max-w-xl mx-auto text-center">
        <div className="w-full h-2 bg-[#00a8cc] rounded-t-full opacity-70" />
        <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 block">Screen</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        {['A','B','C','D','E','F'].map(r => (
          <div key={r} className="flex gap-1.5">
            {Array.from({ length: 10 }).map((_, i) => <div key={i} className="w-6 h-6 shimmer rounded" />)}
          </div>
        ))}
      </div>
    </div>
  );

  if (!seats?.length) return <p className="text-center py-8 text-xs text-gray-500">No seat data available.</p>;

  const rows = Array.from(new Set(seats.map(s => s.row))).sort();
  const tierMap: Record<string, { seats: typeof seats; price: number; label: string }> = {};
  rows.forEach(row => {
    const rowSeats = seats.filter(s => s.row === row);
    const type = rowSeats[0]?.type ?? 'STANDARD';
    const price = rowSeats[0]?.price ?? 0;
    const label = type === 'RECLINER' ? `VIP RECLINER — NPR ${price}` : type === 'PREMIUM' ? `PREMIUM — NPR ${price}` : `STANDARD — NPR ${price}`;
    if (!tierMap[label]) tierMap[label] = { seats: [], price, label };
    tierMap[label].seats.push(...rowSeats);
  });

  return (
    <div className="space-y-6">
      {seatError && (
        <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-600">
          <span>{seatError}</span>
          <button onClick={clearSeatError} className="ml-4 text-amber-500 hover:text-amber-700">✕</button>
        </div>
      )}
      <div className="max-w-xl mx-auto text-center space-y-1">
        <div className="w-full h-2 bg-[#00a8cc] rounded-t-full opacity-70" />
        <span className="text-[10px] text-gray-400 uppercase tracking-widest">Screen</span>
      </div>
      <div className="space-y-6 overflow-x-auto pb-2">
        {Object.values(tierMap).map(tier => (
          <div key={tier.label} className="space-y-2 min-w-max mx-auto">
            <p className="text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-1">{tier.label}</p>
            {Array.from(new Set(tier.seats.map(s => s.row))).sort().map(row => {
              const rowSeats = tier.seats.filter(s => s.row === row).sort((a, b) => a.number - b.number);
              return (
                <div key={row} className="flex items-center gap-2 justify-center">
                  <span className="w-5 text-center text-[11px] font-semibold text-[#00a8cc] shrink-0">{row}</span>
                  <div className="flex gap-1.5">
                    {rowSeats.map(seat => {
                      const isSel = selectedSeats.some(s => s.id === seat.id);
                      const isUnavail = seat.status === 'BOOKED' || (seat.status === 'HELD' && !seat.heldByCurrentUser);
                      return (
                        <button key={seat.id} disabled={isUnavail}
                          onClick={() => !isUnavail && toggleSeat({ id: seat.id, row: seat.row, number: seat.number, type: seat.type as any, price: seat.price })}
                          title={`${seat.row}${seat.number} — NPR ${seat.price}`}
                          className={`w-6 h-6 rounded text-[9px] font-semibold transition-all border flex items-center justify-center ${
                            isUnavail ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                            : isSel ? 'bg-amber-400 border-amber-300 text-black scale-110'
                            : seat.status === 'HELD' ? 'bg-orange-100 border-orange-300 text-orange-600 cursor-not-allowed'
                            : 'bg-white border-[#00a8cc] text-[#00a8cc] hover:bg-[#00a8cc] hover:text-white'
                          }`}
                        >{seat.number}</button>
                      );
                    })}
                  </div>
                  <span className="w-5 text-center text-[11px] font-semibold text-[#00a8cc] shrink-0">{row}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-5 text-[11px] text-gray-500 pt-3 border-t border-gray-100">
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded border border-[#00a8cc] bg-white inline-block" /> Available</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-amber-400 inline-block" /> Selected</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-orange-100 border border-orange-300 inline-block" /> Held</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-gray-200 inline-block" /> Booked</span>
      </div>
    </div>
  );
};

// ─── Browse Mode — shown when no movieId in URL ───────────────────────────────
const BrowseShowtimes: React.FC = () => {
  const navigate = useNavigate();
  const bookingDates = useMemo(() => generateBookingDates(), []);
  const [selectedDateIso, setSelectedDateIso] = useState(bookingDates[0].iso);
  const { selectedLocation } = useLocationStore();

  const { data: showtimes, isLoading } = useShowtimes({ date: selectedDateIso });
  const { data: allMovies } = useMovies();

  // Group showtimes by movie
  const byMovie = useMemo(() => {
    if (!showtimes?.length) return [];
    const map = new Map<string, { movie: any; groups: ReturnType<typeof groupShowtimesByCinema> }>();
    showtimes.forEach(st => {
      if (!st.movie) return;
      const mid = st.movieId;
      if (!map.has(mid)) {
        map.set(mid, { movie: st.movie, groups: [] });
      }
    });
    for (const [mid, entry] of map.entries()) {
      const movieShowtimes = showtimes.filter(s => s.movieId === mid);
      entry.groups = groupShowtimesByCinema(movieShowtimes, selectedLocation);
    }
    return Array.from(map.values()).filter(e => e.groups.length > 0);
  }, [showtimes, selectedLocation]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <h1 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#00a8cc]" /> All Showtimes
          </h1>
          <span className="text-xs text-gray-500">{selectedLocation}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Date strip */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {bookingDates.map(d => (
            <button key={d.iso} onClick={() => setSelectedDateIso(d.iso)}
              className={`px-3 py-2 rounded-xl text-center min-w-[64px] border transition-all shrink-0 ${
                selectedDateIso === d.iso
                  ? 'bg-[#00a8cc] border-[#00a8cc] text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}>
              <span className="block text-[10px] uppercase font-medium">{d.shortLabel}</span>
              <span className="block text-base font-bold leading-tight">{d.dateNum}</span>
              <span className="block text-[10px]">{d.day}</span>
            </button>
          ))}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(n => <div key={n} className="h-32 shimmer rounded-2xl" />)}
          </div>
        ) : byMovie.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl py-20 text-center space-y-3">
            <Film className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-semibold text-gray-500">No showtimes scheduled for this date</p>
            <p className="text-xs text-gray-400">Try selecting a different date above</p>
          </div>
        ) : (
          <div className="space-y-4">
            {byMovie.map(({ movie, groups }) => (
              <div key={movie.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                {/* Movie header row */}
                <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100">
                  <img src={movie.posterUrl} alt={movie.title}
                    className="w-10 h-14 rounded-lg object-cover border border-gray-200 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-semibold text-gray-900 truncate">{movie.title}</h2>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {movie.language} · {movie.runtimeMins}m · {movie.rating}
                    </p>
                  </div>
                  <button onClick={() => navigate(`/showtimes?movieId=${movie.id}`)}
                    className="shrink-0 text-[11px] font-semibold text-[#00a8cc] hover:underline flex items-center gap-1">
                    View all <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Cinema groups + time slots */}
                <div className="px-5 py-4 space-y-4">
                  {groups.map(group => (
                    <div key={group.cinemaId}>
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        {group.cinemaName}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.slots.map(slot => {
                          const isPast = isPastSlot(slot.startsAt);
                          return (
                            <button key={slot.showtimeId}
                              disabled={isPast}
                              onClick={() => !isPast && navigate(`/showtimes?movieId=${movie.id}&time=${encodeURIComponent(slot.showtimeId)}`)}
                              className={`px-3.5 py-2 rounded-xl border transition-all text-left ${
                                isPast
                                  ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed opacity-60'
                                  : 'bg-gray-50 border-gray-200 hover:border-[#00a8cc] hover:bg-[#00a8cc]/5'
                              }`}>
                              <span className={`block text-xs font-semibold ${isPast ? 'text-gray-300' : 'text-gray-800'}`}>{slot.time}</span>
                              <span className={`block text-[9px] mt-0.5 ${isPast ? 'text-gray-300' : 'text-gray-400'}`}>
                                {isPast ? 'Show ended' : slot.fmt}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Movie Mode — shown when ?movieId= is present ────────────────────────────
const MovieShowtimes: React.FC<{ movieIdParam: string }> = ({ movieIdParam }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quickCinema = searchParams.get('cinema') || '';
  const quickDate   = searchParams.get('date')   || '';
  const quickTime   = searchParams.get('time')   || '';

  const bookingDates = useMemo(() => generateBookingDates(), []);
  const initialIso = quickDate && bookingDates.some(d => d.iso === quickDate)
    ? quickDate : bookingDates[0].iso;

  const { data: apiMovie, isLoading: movieLoading } = useMovieDetail(movieIdParam);
  const staticFallback = !movieLoading && !apiMovie ? getMovieById(movieIdParam) : null;
  const rawMovie = apiMovie ?? staticFallback;

  const { selectedLocation } = useLocationStore();
  const { liveMap } = useLiveLocations();
  const user = useAuthStore(s => s.user);

  const [selectedDateIso, setSelectedDateIso]           = useState(initialIso);
  const [selectedCinemaFilter, setSelectedCinemaFilter] = useState(quickCinema || 'All');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState('All');
  const [step1Expanded, setStep1Expanded] = useState(true);
  const [step2Expanded, setStep2Expanded] = useState(false);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [holdError, setHoldError] = useState('');

  const { data: showtimes, isLoading: showtimesLoading } = useShowtimes({
    movieId: rawMovie?.id ?? movieIdParam,
    date: selectedDateIso,
  });

  const cinemaGroups = useMemo(
    () => groupShowtimesByCinema(showtimes, selectedLocation),
    [showtimes, selectedLocation],
  );

  const filteredGroups = useMemo(
    () => cinemaGroups.filter(g => selectedCinemaFilter === 'All' || g.cinemaName === selectedCinemaFilter),
    [cinemaGroups, selectedCinemaFilter],
  );

  const cinemaFilterOptions = useMemo(() => {
    const fromApi = cinemaGroups.map(g => g.cinemaName);
    const fromLoc = (liveMap[selectedLocation] ?? []).map(c => c.name);
    return Array.from(new Set([...fromApi, ...fromLoc]));
  }, [cinemaGroups, liveMap, selectedLocation]);

  const [selectedSlot, setSelectedSlot] = useState<{
    cinema: string; cinemaId: string; time: string;
    fmt: string; language: string; showtimeId: string;
  } | null>(null);

  const { selectedSeats, clearSelection, setExpiresAt, setShowtimeId } = useSeatStore();
  const holdMut = useHoldSeats();

  useEffect(() => {
    if (quickDate) setSelectedDateIso(initialIso);
    if (quickCinema) setSelectedCinemaFilter(quickCinema);
  }, [quickDate, quickCinema, initialIso]);

  useEffect(() => {
    if (!quickTime || !cinemaGroups.length) return;

    // Primary: try matching by showtimeId or time string via helper
    let slot = findSlotByTime(cinemaGroups, quickTime);

    // Secondary: match by raw startsAt timestamp substring (e.g. "10:30" in ISO string)
    if (!slot) {
      for (const g of cinemaGroups) {
        const found = g.slots.find(s => {
          const d = new Date(s.startsAt);
          const h = String(d.getHours()).padStart(2, '0');
          const m = String(d.getMinutes()).padStart(2, '0');
          return `${h}:${m}` === quickTime || s.time === quickTime;
        });
        if (found) { slot = found; break; }
      }
    }

    if (!slot) return;
    const group = cinemaGroups.find(g => g.slots.some(s => s.showtimeId === slot!.showtimeId));
    if (!group) return;

    setSelectedSlot({
      cinema: group.cinemaName,
      cinemaId: group.cinemaId,
      time: slot.time,
      fmt: slot.fmt,
      language: (rawMovie as any)?.language ?? '',
      showtimeId: slot.showtimeId,
    });
    setShowtimeId(slot.showtimeId);
    setStep1Expanded(false);
    setStep2Expanded(true);
  }, [quickTime, cinemaGroups, rawMovie, setShowtimeId]);

  // Show skeleton only while actively loading the movie
  if (movieLoading) return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 mt-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="bg-white rounded-xl p-4 space-y-3 border border-gray-200">
          <div className="aspect-[2/3] shimmer rounded-lg" />
          <div className="h-4 shimmer rounded w-3/4" />
          <div className="h-3 shimmer rounded w-1/2" />
        </div>
        <div className="lg:col-span-3 space-y-4">
          <div className="h-16 shimmer rounded-xl" />
          <div className="h-48 shimmer rounded-xl" />
        </div>
      </div>
    </div>
  );

  // Movie not found — show a helpful message instead of eternal skeleton
  if (!rawMovie) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4 px-4">
        <Film className="w-12 h-12 text-gray-300 mx-auto" />
        <h2 className="text-lg font-semibold text-gray-700">Movie not found</h2>
        <p className="text-sm text-gray-500">We couldn't find this movie. It may have been removed.</p>
        <button onClick={() => navigate('/showtimes')}
          className="px-5 py-2 bg-[#00a8cc] hover:bg-[#0096c7] text-white text-sm font-semibold rounded-xl transition-colors">
          Browse All Showtimes
        </button>
      </div>
    </div>
  );

  const movie = {
    id: rawMovie.id,
    title: (rawMovie as any).title ?? '',
    year: (rawMovie as any).year ?? new Date((rawMovie as any).releaseDate ?? Date.now()).getFullYear().toString(),
    synopsis: (rawMovie as any).synopsis ?? '',
    posterUrl: (rawMovie as any).posterUrl ?? '',
    trailerUrl: (rawMovie as any).trailerUrl ?? '',
    language: (rawMovie as any).language ?? '',
    runtimeMins: (rawMovie as any).runtimeMins ?? 0,
    rating: (rawMovie as any).rating ?? '',
    badge: (rawMovie as any).badge ?? null,
    isShowing: (rawMovie as any).isShowing ?? true,
  };

  const handleSelectSlot = (cinema: string, cinemaId: string, time: string,
    fmt: string, lang: string, showtimeId: string) => {
    if (selectedSlot?.showtimeId !== showtimeId) { clearSelection(); setShowtimeId(showtimeId); }
    setSelectedSlot({ cinema, cinemaId, time, fmt, language: lang, showtimeId });
    setStep1Expanded(false);
    setStep2Expanded(true);
    setHoldError('');
  };

  const handleProceedToCheckout = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/showtimes?movieId=${movie.id}` } } });
      return;
    }
    if (!selectedSlot) { setHoldError('Please select a showtime first.'); return; }
    if (!selectedSeats.length) { setHoldError('Please select at least one seat.'); return; }
    setHoldError('');
    try {
      const result = await holdMut.mutateAsync({
        showtimeId: selectedSlot.showtimeId,
        seatIds: selectedSeats.map(s => s.id),
      });
      setExpiresAt(result.expiresAt);
      navigate(`/booking-summary?showtimeId=${selectedSlot.showtimeId}&movie=${encodeURIComponent(movie.title)}&cinema=${encodeURIComponent(selectedSlot.cinema)}&time=${encodeURIComponent(selectedSlot.time)}`);
    } catch (e: any) {
      setHoldError(e.response?.data?.message || 'Could not hold seats. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-3 text-xs font-semibold uppercase tracking-wider">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg bg-[#00a8cc] text-white hover:bg-[#0096c7] transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[#00a8cc] border-b-2 border-[#00a8cc] pb-0.5">Select Showtime</span>
          <span className="text-gray-300">→</span>
          <span className={selectedSlot ? 'text-[#00a8cc]' : 'text-gray-400'}>Pick Seats</span>
          <span className="text-gray-300">→</span>
          <span className="text-gray-400">Checkout</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* ── Sidebar ── */}
        <aside className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4 sticky top-32 shadow-sm">
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden border border-gray-200 bg-gray-100 group">
              <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
              <div className="qfx-card-top-bar absolute top-0 inset-x-0 text-center text-white text-[10px] font-semibold uppercase py-1">
                {movie.badge || (movie.isShowing ? 'Now Showing' : 'Coming Soon')}
              </div>
              {movie.trailerUrl && (
                <button onClick={() => setShowTrailerModal(true)}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/70 hover:bg-[#00a8cc] text-white text-xs font-semibold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                  <Play className="w-3 h-3 fill-white" /> Trailer
                </button>
              )}
            </div>
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] font-semibold text-[#00a8cc] uppercase">Now Showing</span>
              <h2 className="text-sm font-semibold text-gray-900 leading-tight">
                {movie.title} <span className="text-gray-400 font-normal">({movie.year})</span>
              </h2>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="px-2 py-0.5 bg-[#00a8cc] text-white text-[10px] font-semibold rounded">{movie.runtimeMins} mins</span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-semibold rounded">{movie.rating}</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3 pt-1">{movie.synopsis}</p>
            </div>
            {selectedSlot && (
              <div className="p-3 bg-[#00a8cc]/8 border border-[#00a8cc]/20 rounded-xl space-y-1 text-[11px]">
                <p className="font-semibold text-[#00a8cc] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Showtime Selected
                </p>
                <p className="text-gray-700 font-medium">{selectedSlot.cinema}</p>
                <p className="text-gray-900 font-bold">{selectedSlot.time}</p>
                <p className="text-gray-500">{selectedSlot.fmt} · {selectedSlot.language}</p>
                <button onClick={() => { setStep1Expanded(true); setStep2Expanded(false); }}
                  className="text-[#00a8cc] hover:underline text-[10px] font-semibold mt-1">Change showtime</button>
              </div>
            )}
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Step 1 */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div onClick={() => setStep1Expanded(!step1Expanded)}
              className="p-4 bg-gray-50 flex items-center justify-between cursor-pointer border-b border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-2.5">
                <span className={`w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center shrink-0 ${selectedSlot ? 'bg-emerald-500 text-white' : 'bg-[#00a8cc] text-white'}`}>
                  {selectedSlot ? '✓' : '1'}
                </span>
                <span className="text-sm font-semibold text-gray-900">Select Date, Cinema &amp; Time</span>
                {selectedSlot && (
                  <span className="text-xs text-[#00a8cc] hidden sm:inline">
                    {selectedSlot.time} at {selectedSlot.cinema}
                  </span>
                )}
              </div>
              {step1Expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>

            {step1Expanded && (
              <div className="p-5 space-y-6">
                {/* Date strip */}
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Select Date</p>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {bookingDates.map(d => (
                      <button key={d.iso} onClick={() => { setSelectedDateIso(d.iso); setSelectedSlot(null); clearSelection(); }}
                        className={`px-3 py-2 rounded-xl text-center min-w-[62px] border transition-all shrink-0 ${
                          selectedDateIso === d.iso
                            ? 'bg-[#00a8cc] border-[#00a8cc] text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}>
                        <span className="block text-[10px] uppercase font-medium">{d.shortLabel}</span>
                        <span className="block text-base font-bold leading-tight">{d.dateNum}</span>
                        <span className="block text-[10px]">{d.day}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cinema filter */}
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Cinema ({selectedLocation})</p>
                  <div className="flex flex-wrap gap-2">
                    {['All', ...cinemaFilterOptions].map(name => (
                      <button key={name} onClick={() => setSelectedCinemaFilter(name)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          selectedCinemaFilter === name
                            ? 'bg-[#00a8cc] text-white'
                            : 'bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900'
                        }`}>{name}</button>
                    ))}
                  </div>
                </div>

                {/* Language filter */}
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Language</p>
                  <div className="flex gap-2 flex-wrap">
                    {['All','English','Hindi Dubbed','Nepali'].map(lang => (
                      <button key={lang} onClick={() => setSelectedLanguageFilter(lang)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          selectedLanguageFilter === lang
                            ? 'bg-[#00a8cc] text-white'
                            : 'bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900'
                        }`}>{lang}</button>
                    ))}
                  </div>
                </div>

                {/* Timeslots */}
                <div className="space-y-5 pt-2 border-t border-gray-100">
                  {showtimesLoading && (
                    <div className="space-y-3">
                      {[1,2].map(n => <div key={n} className="h-16 shimmer rounded-xl" />)}
                    </div>
                  )}
                  {!showtimesLoading && filteredGroups.length === 0 && (
                    <div className="text-center py-8 space-y-2">
                      <CalendarDays className="w-8 h-8 text-gray-300 mx-auto" />
                      <p className="text-xs text-gray-500">No showtimes for this date.</p>
                    </div>
                  )}
                  {filteredGroups.map(group => (
                    <div key={group.cinemaId} className="space-y-2">
                      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{group.cinemaName}
                        <span className="text-gray-400 ml-1.5 font-normal normal-case tracking-normal">({movie.language})</span>
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        {group.slots.map(slot => {
                          const isSel = selectedSlot?.showtimeId === slot.showtimeId;
                          const isPast = isPastSlot(slot.startsAt);
                          return (
                            <button key={slot.showtimeId}
                              disabled={isPast}
                              onClick={() => !isPast && handleSelectSlot(group.cinemaName, group.cinemaId, slot.time, slot.fmt, movie.language, slot.showtimeId)}
                              className={`px-3.5 py-2.5 rounded-xl text-left transition-all border relative ${
                                isPast
                                  ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed opacity-60'
                                  : isSel
                                  ? 'bg-[#00a8cc] border-[#00a8cc] text-white scale-105'
                                  : 'bg-gray-50 border-gray-200 hover:border-[#00a8cc] text-gray-700'
                              }`}>
                              <span className="block text-xs font-semibold">{slot.time}</span>
                              <span className={`block text-[9px] mt-0.5 ${isPast ? 'text-gray-300' : isSel ? 'text-white/70' : 'text-gray-400'}`}>
                                {isPast ? 'Show ended' : slot.fmt}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[11px] text-amber-700">
                  <p className="font-semibold">Please Note</p>
                  <p>Tickets required for all admissions. No entry for children under 2.5 feet.</p>
                </div>
              </div>
            )}
          </div>

          {/* Step 2 */}
          <div className={`bg-white rounded-xl border overflow-hidden shadow-sm transition-all ${selectedSlot ? 'border-gray-200' : 'border-gray-200/50 opacity-60'}`}>
            <div onClick={() => selectedSlot && setStep2Expanded(!step2Expanded)}
              className={`p-4 bg-gray-50 flex items-center justify-between border-b border-gray-200 ${selectedSlot ? 'cursor-pointer hover:bg-gray-100 transition-colors' : 'cursor-not-allowed'}`}>
              <div className="flex items-center gap-2.5">
                <span className={`w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center shrink-0 ${selectedSlot ? 'bg-[#00a8cc] text-white' : 'bg-gray-200 text-gray-400'}`}>2</span>
                <span className="text-sm font-semibold text-gray-900">Pick Seats</span>
                {!selectedSlot && <span className="text-[11px] text-gray-400 ml-1">— select a showtime first</span>}
                {selectedSlot && <span className="text-[11px] text-gray-500 ml-1">| {movie.title}</span>}
              </div>
              {selectedSlot && (step2Expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />)}
            </div>

            {step2Expanded && selectedSlot && (
              <div className="p-6 space-y-6">
                {holdError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" /> {holdError}
                  </div>
                )}
                <SeatMap showtimeId={selectedSlot.showtimeId} movieTitle={movie.title} language={selectedSlot.language} />
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-xs text-gray-500 block">{selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {selectedSeats.length > 0 ? selectedSeats.map(s => `${s.row}${s.number}`).join(', ') : 'None'}
                    </span>
                    {selectedSeats.length > 0 && (
                      <span className="text-xs text-[#00a8cc] font-semibold ml-3">
                        NPR {selectedSeats.reduce((sum, s) => sum + s.price, 0).toFixed(0)}
                      </span>
                    )}
                  </div>
                  <button onClick={handleProceedToCheckout}
                    disabled={selectedSeats.length === 0 || holdMut.isPending}
                    className="px-7 py-2.5 bg-[#00a8cc] hover:bg-[#0096c7] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2">
                    {holdMut.isPending ? 'Holding...' : 'Proceed to Checkout'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trailer modal */}
      {showTrailerModal && movie.trailerUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowTrailerModal(false)}>
          <div className="w-full max-w-4xl bg-white rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Play className="w-4 h-4 text-[#00a8cc] fill-[#00a8cc]" /> {movie.title} — Trailer
              </h3>
              <button onClick={() => setShowTrailerModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe src={movie.trailerUrl} title={movie.title} className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Root export — routes to browse or movie mode ────────────────────────────
export const ShowtimesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const movieIdParam = searchParams.get('movieId') || '';

  if (!movieIdParam) return <BrowseShowtimes />;
  return <MovieShowtimes movieIdParam={movieIdParam} />;
};
