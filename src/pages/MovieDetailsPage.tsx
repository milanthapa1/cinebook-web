import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play, Ticket, X, ChevronRight, ArrowLeft,
  ChevronDown, ChevronUp, ShieldAlert, ArrowRight,
} from 'lucide-react';
import { useMovieDetail } from '../features/movies/useMovies';
import { useLocationStore, useLiveLocations } from '../features/location/useLocationStore';
import { useShowtimes } from '../features/showtimes/useShowtimes';
import {
  generateBookingDates,
  groupShowtimesByCinema,
  isPastSlot,
} from '../features/showtimes/showtimeHelpers';
import { useSeats, useHoldSeats } from '../features/seat-selection/useSeats';
import { useSeatStore } from '../features/seat-selection/useSeatStore';
import { useAuthStore } from '../features/auth/useAuthStore';

// ─── Date helpers ─────────────────────────────────────────────────────────────
function fmtDate(raw: any): string {
  if (!raw) return '';
  try {
    const d = raw instanceof Date ? raw : new Date(raw);
    const day = d.getDate();
    const s = [, 'st','nd','rd'][day % 10] ?? 'th';
    const ovr = [11,12,13].includes(day % 100) ? 'th' : s;
    return `${day}${ovr} ${d.toLocaleString('en-GB',{month:'short'})}, ${d.getFullYear()}`;
  } catch { return String(raw); }
}

function normalise(raw: any): any {
  if (!raw) return null;
  return {
    ...raw,
    releaseDateDisplay: fmtDate(raw.releaseDate),
    year: raw.year ?? (raw.releaseDate ? new Date(raw.releaseDate).getFullYear().toString() : ''),
    format: Array.isArray(raw.format) ? raw.format : raw.format ? [raw.format] : [],
    genre:  Array.isArray(raw.genre)  ? raw.genre  : raw.genre  ? [raw.genre]  : [],
    cast:   Array.isArray(raw.cast)   ? raw.cast   : [],
  };
}

// ─── Trailer Modal ────────────────────────────────────────────────────────────
const TrailerModal: React.FC<{url:string;title:string;onClose:()=>void}> = ({url,title,onClose}) => (
  <div className="fixed inset-0 z-50 bg-gray-900/95 flex items-center justify-center p-4" onClick={onClose}>
    <div className="relative w-full max-w-5xl bg-white rounded-xl p-4 dark:bg-gray-900 dark:border dark:border-gray-700" onClick={e=>e.stopPropagation()}>
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{title} - Trailer</span>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"><X className="w-5 h-5"/></button>
      </div>
      <div className="aspect-video w-full bg-gray-100 rounded-xl overflow-hidden dark:bg-gray-800">
        <iframe src={url} title={title} className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>
      </div>
    </div>
  </div>
);

// ─── Info Row ─────────────────────────────────────────────────────────────────
const InfoRow: React.FC<{label:string;children:React.ReactNode}> = ({label,children}) => (
  <div className="flex py-3 border-b border-gray-200 last:border-0 dark:border-gray-700">
    <span className="text-[#00a8cc] text-[13px] w-40 shrink-0">{label}</span>
    <span className="text-gray-700 text-[13px] flex-1 dark:text-gray-300">{children}</span>
  </div>
);

// ─── Seat Map ─────────────────────────────────────────────────────────────────
const SeatMap: React.FC<{showtimeId:string}> = ({showtimeId}) => {
  const {data:seats,isLoading} = useSeats(showtimeId);
  const {selectedSeats,seatError,clearSeatError,toggleSeat} = useSeatStore();

  // Auto-deselect any seat that becomes unavailable (booked / held by another
  // user) once the latest seat state arrives — mirrors the ShowtimesPage map.
  useEffect(() => {
    if (seats?.length && selectedSeats.length) {
      const unavailable = new Set(
        seats.filter(s => s.status === 'BOOKED' || (s.status === 'HELD' && !s.heldByCurrentUser)).map(s => s.id)
      );
      selectedSeats.forEach(s => {
        if (unavailable.has(s.id)) toggleSeat(s);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seats]);

  if (isLoading) return (
    <div className="space-y-4 py-4">
      {/* Screen */}
      <div className="max-w-xl mx-auto text-center space-y-1">
        <div className="w-full h-3 bg-[#00a8cc]/30 rounded-t-full shadow-none" />
        <div className="skeleton h-2.5 w-12 mx-auto rounded" />
      </div>
      {/* Tier label */}
      <div className="skeleton h-3 w-40 mx-auto rounded" />
      {/* Seat rows */}
      {['A','B','C'].map(r=>(
        <div key={r} className="flex items-center gap-2 justify-center">
          <span className="w-5 skeleton h-3.5 rounded" />
          <div className="flex gap-1.5">
            {Array.from({length:10}).map((_,i)=><div key={i} className="w-6 h-6 skeleton rounded"/>)}
          </div>
          <span className="w-5 skeleton h-3.5 rounded" />
        </div>
      ))}
      {/* Tier label 2 */}
      <div className="skeleton h-3 w-36 mx-auto rounded" />
      {['D','E','F'].map(r=>(
        <div key={r} className="flex items-center gap-2 justify-center">
          <span className="w-5 skeleton h-3.5 rounded" />
          <div className="flex gap-1.5">
            {Array.from({length:10}).map((_,i)=><div key={i} className="w-6 h-6 skeleton rounded"/>)}
          </div>
          <span className="w-5 skeleton h-3.5 rounded" />
        </div>
      ))}
    </div>
  );
  if (!seats?.length) return <p className="text-center py-6 text-xs text-gray-500">No seat data for this showtime.</p>;
  const rows = Array.from(new Set(seats.map(s=>s.row))).sort();
  const tierMap:Record<string,{seats:typeof seats;label:string}> = {};
  rows.forEach(row=>{
    const rs=seats.filter(s=>s.row===row);
    const type=rs[0]?.type??'STANDARD';
    const price=rs[0]?.price??0;
    const label=type==='RECLINER'?`VIP RECLINER - NPR ${price}`:type==='PREMIUM'?`PREMIUM - NPR ${price}`:`STANDARD - NPR ${price}`;
    if(!tierMap[label]) tierMap[label]={seats:[],label};
    tierMap[label].seats.push(...rs);
  });
  return (
    <div className="space-y-5">
      {seatError&&<div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-400"><span>{seatError}</span><button onClick={clearSeatError}>✕</button></div>}
      <div className="max-w-xl mx-auto text-center">
        <div className="w-full h-3 bg-[#00a8cc] rounded-t-full shadow-[0_5px_15px_rgba(0,168,204,0.5)]"/>
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Screen</span>
      </div>
      <div className="space-y-5 overflow-x-auto pb-2">
        {Object.values(tierMap).map(tier=>(
          <div key={tier.label} className="space-y-2 min-w-max mx-auto">
            <p className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-1 dark:text-gray-400 dark:border-gray-700">{tier.label}</p>
            {Array.from(new Set(tier.seats.map(s=>s.row))).sort().map(row=>{
              const rs=tier.seats.filter(s=>s.row===row).sort((a,b)=>a.number-b.number);
              return(
                <div key={row} className="flex items-center gap-2 justify-center">
                  <span className="w-5 text-center text-[11px] font-black text-[#00a8cc] shrink-0">{row}</span>
                  <div className="flex gap-1.5">
                    {rs.map(seat=>{
                      const sel=selectedSeats.some(s=>s.id===seat.id);
                      const unavail=seat.status==='BOOKED'||(seat.status==='HELD'&&!seat.heldByCurrentUser);
                      return(
                        <button key={seat.id} disabled={unavail}
                          onClick={()=>!unavail&&toggleSeat({id:seat.id,row:seat.row,number:seat.number,type:seat.type as any,price:seat.price})}
                          title={`${seat.row}${seat.number} - NPR ${seat.price}`}
                          className={`w-6 h-6 rounded text-[9px] font-bold transition-all border flex items-center justify-center ${
                            unavail?'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400':
                            sel?'bg-amber-400 border-amber-300 text-black font-extrabold scale-110':
                            'bg-gray-100 border-[#00a8cc] text-[#00a8cc] hover:bg-[#00a8cc] hover:text-gray-900 dark:bg-gray-800'
                          }`}>{seat.number}</button>
                      );
                    })}
                  </div>
                  <span className="w-5 text-center text-[11px] font-black text-[#00a8cc] shrink-0">{row}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-5 text-[11px] text-gray-600 pt-3 border-t border-gray-200 dark:text-gray-400 dark:border-gray-700">
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded border border-[#00a8cc] bg-gray-100 inline-block dark:bg-gray-800"/>Available</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-amber-400 inline-block"/>Selected</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-gray-200 border border-gray-300 inline-block dark:bg-gray-700 dark:border-gray-600"/>Booked</span>
      </div>
    </div>
  );
};

// ─── Coming Soon - QFX info layout ───────────────────────────────────────────
const ComingSoonDetail: React.FC<{movie:any}> = ({movie}) => {
  const navigate = useNavigate();
  const [showTrailer,setShowTrailer] = useState(false);
  const cast = (movie.cast??[]).filter((c:any)=>c?.name);
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20 dark:bg-gray-950 dark:text-gray-100">
      <div className="border-b border-gray-200 py-3 px-4 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-[13px] text-gray-600 dark:text-gray-400">
          <button onClick={()=>navigate('/movies')} className="hover:text-gray-900 dark:hover:text-white">Movies</button>
          <ChevronRight className="w-3 h-3"/><button onClick={()=>navigate(-1)} className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"><ArrowLeft className="w-3 h-3"/>Back</button>
          <ChevronRight className="w-3 h-3"/><span className="text-gray-900 dark:text-gray-100">{movie.title}</span>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row gap-10 md:items-center">
        <div className="shrink-0 w-full md:w-48 lg:w-52">
          <div className="relative group">
            <img src={movie.posterUrl} alt={movie.title} className="w-full aspect-[2/3] object-cover object-center rounded-lg"/>
            {movie.trailerUrl&&(
              <button onClick={()=>setShowTrailer(true)} title={`Watch ${movie.title} Trailer`}
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 rounded-lg transition-colors">
                <span className="w-14 h-14 rounded-full bg-white/90 hover:bg-[#00a8cc] text-[#00a8cc] hover:text-gray-900 flex items-center justify-center shadow-xl transition-all hover:scale-105">
                  <Play className="w-6 h-6 fill-current ml-0.5"/>
                </span>
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0 space-y-4">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 dark:text-gray-100">{movie.title}</h1>
            <p className="text-[#8a9ab5] text-[13px] mt-2 leading-relaxed dark:text-gray-400">{movie.synopsis}</p>
          </div>
          <div className="pt-1">
            <InfoRow label="Original Title">{movie.title}</InfoRow>
            <InfoRow label="Release Date">{movie.releaseDateDisplay}</InfoRow>
            {movie.rating&&<InfoRow label="Age Rating">{movie.rating}</InfoRow>}
            {movie.runtimeMins&&<InfoRow label="Runtime">{movie.runtimeMins} mins</InfoRow>}
            {movie.year&&<InfoRow label="Year">{movie.year}</InfoRow>}
            {movie.language&&<InfoRow label="Original Language">{movie.language}</InfoRow>}
            {movie.genre?.length>0&&<InfoRow label="Genre">{movie.genre.join(', ')}</InfoRow>}
            {movie.director&&<InfoRow label="Director">{movie.director}</InfoRow>}
            {cast.length>0&&<InfoRow label="Cast">{cast.slice(0,5).map((c:any,i:number)=><span key={i}>{c.name}{i<Math.min(cast.length,5)-1?',\u00a0\u00a0':''}</span>)}</InfoRow>}
            {movie.trailerUrl&&(
              <InfoRow label="Trailer">
                <button onClick={()=>setShowTrailer(true)} className="flex items-center gap-2 group">
                  <span className="w-6 h-6 rounded-full border-2 border-[#00a8cc] flex items-center justify-center group-hover:bg-[#00a8cc] transition-colors shrink-0">
                    <Play className="w-2.5 h-2.5 fill-[#00a8cc] group-hover:fill-white ml-0.5"/>
                  </span>
                  <span className="text-[#00a8cc] font-semibold group-hover:underline text-[13px]">{movie.language||'Watch'}</span>
                </button>
              </InfoRow>
            )}
          </div>
          <div className="border-t border-[#00a8cc]/40 pt-4">
            <p className="text-[13px] text-gray-600 dark:text-gray-400">From {movie.releaseDateDisplay}</p>
          </div>
        </div>
      </div>
      {showTrailer&&<TrailerModal url={movie.trailerUrl} title={movie.title} onClose={()=>setShowTrailer(false)}/>}
    </div>
  );
};

// ─── Now Showing - 100% QFX-accurate layout ──────────────────────────────────
const NowShowingDetail: React.FC<{movie:any}> = ({movie}) => {
  const navigate  = useNavigate();
  const {selectedLocation} = useLocationStore();
  const { liveMap } = useLiveLocations();
  const user = useAuthStore(s=>s.user);
  const {selectedSeats,clearSelection,setExpiresAt,setShowtimeId} = useSeatStore();
  const holdMutation = useHoldSeats();

  const dates = generateBookingDates();
  const [showTrailer,setShowTrailer]   = useState(false);
  const [moreInfo,setMoreInfo]         = useState(false);
  const [selDateIso,setSelDateIso]     = useState(dates[0].iso);
  const [cinFilter,setCinFilter]       = useState('All');
  const [step1Open,setStep1Open]       = useState(true);
  const [step2Open,setStep2Open]       = useState(false);
  const [holdError,setHoldError]       = useState('');
  const [selSlot,setSelSlot]           = useState<{cinema:string;cinemaId:string;time:string;fmt:string;lang:string;showtimeId:string}|null>(null);
  const cast = (movie.cast??[]).filter((c:any)=>c?.name);

  const { data: showtimes, isLoading: showtimesLoading } = useShowtimes({ movieId: movie.id, date: selDateIso });

  const cinemaGroups = useMemo(
    () => groupShowtimesByCinema(showtimes, selectedLocation),
    [showtimes, selectedLocation],
  );

  const filteredGroups = useMemo(
    () => cinemaGroups.filter(g => cinFilter==='All' || g.cinemaName===cinFilter),
    [cinemaGroups, cinFilter],
  );

  const cinemaFilterOptions = useMemo(() => {
    const fromGroups = cinemaGroups.map(g => g.cinemaName);
    const fromLoc = (liveMap[selectedLocation] ?? []).map(c => c.name);
    return Array.from(new Set([...fromGroups, ...fromLoc]));
  }, [cinemaGroups, liveMap, selectedLocation]);

  const handleSlot = (cinema:string,cinemaId:string,time:string,fmt:string,lang:string,showtimeId:string) => {
    if (selSlot?.showtimeId!==showtimeId) { clearSelection(); setShowtimeId(showtimeId); }
    setSelSlot({cinema,cinemaId,time,fmt,lang,showtimeId});
    setStep1Open(false); setStep2Open(true); setHoldError('');
  };

  const handleCheckout = async () => {
    if (!user) { navigate('/login',{state:{from:{pathname:`/movies/${movie.id}` }}}); return; }
    if (!selSlot||selectedSeats.length===0) { setHoldError('Select at least one seat.'); return; }
    try {
      const r = await holdMutation.mutateAsync({showtimeId:selSlot.showtimeId,seatIds:selectedSeats.map(s=>s.id)});
      setExpiresAt(r.expiresAt);
      navigate(`/booking-summary?showtimeId=${selSlot.showtimeId}&movie=${encodeURIComponent(movie.title)}&cinema=${encodeURIComponent(selSlot.cinema)}&time=${encodeURIComponent(selSlot.time)}`);
    } catch(e:any) { setHoldError(e.response?.data?.message||'Could not hold seats. Try again.'); }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20 dark:bg-gray-950 dark:text-gray-100">

      {/* Breadcrumb */}
      <div className="border-b border-gray-200 py-3 px-4 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-[13px] text-gray-600 dark:text-gray-400">
          <button onClick={()=>navigate('/movies')} className="hover:text-gray-900 transition-colors dark:hover:text-white">Movies</button>
          <ChevronRight className="w-3 h-3"/>
          <button onClick={()=>navigate(-1)} className="flex items-center gap-1 hover:text-gray-900 transition-colors dark:hover:text-white"><ArrowLeft className="w-3 h-3"/>Back</button>
          <ChevronRight className="w-3 h-3"/>
          <span className="text-gray-900 dark:text-gray-100">{movie.title}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col lg:flex-row gap-6 lg:items-start">

        {/* ══ LEFT SIDEBAR ══════════════════════════════════════════════════ */}
        <div className="lg:w-[200px] shrink-0">

          {/* Poster card - exactly like QFX */}
          <div className="relative group">
            {/* Cyan "NOW SHOWING" / badge bar */}
            <div className="qfx-card-top-bar text-center text-gray-900 text-[11px] font-extrabold uppercase py-1.5">
              {movie.badge||'Now Showing'}
            </div>
            {/* Full-width poster, no border radius on sides so it flows with bar */}
            <img src={movie.posterUrl} alt={movie.title}
              className="w-full aspect-[2/3] object-cover object-center block"/>
            {/* Play button overlay - open trailer modal */}
            {movie.trailerUrl&&(
              <button onClick={()=>setShowTrailer(true)} title={`Watch ${movie.title} Trailer`}
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors">
                <span className="w-16 h-16 rounded-full bg-white/90 hover:bg-[#00a8cc] text-[#00a8cc] hover:text-gray-900 flex items-center justify-center shadow-xl transition-all hover:scale-105">
                  <Play className="w-7 h-7 fill-current ml-1"/>
                </span>
              </button>
            )}
          </div>

          {/* Below poster info - exactly QFX style */}
          <div className="pt-3 space-y-2">
            <p className="text-[11px] font-black text-[#00a8cc] uppercase tracking-widest">Now Showing</p>
            <h2 className="text-[15px] font-bold text-gray-900 leading-snug dark:text-gray-100">
              {movie.title}
              <span className="text-[#8a9ab5] font-normal text-[13px] ml-1 dark:text-gray-500">({movie.year})</span>
            </h2>
            <div className="flex gap-2 flex-wrap">
              {movie.runtimeMins&&<span className="px-2.5 py-0.5 bg-[#00a8cc] text-gray-900 text-[11px] font-bold rounded">{movie.runtimeMins} mins</span>}
              {movie.rating&&<span className="px-2.5 py-0.5 bg-[#2a3040] text-gray-900 text-[11px] font-bold rounded">{movie.rating}</span>}
            </div>

            {/* BUY NOW button */}
            <button onClick={()=>{ setStep1Open(true); document.getElementById('booking-panel')?.scrollIntoView({behavior:'smooth'}); }}
              className="w-full py-2 bg-[#00a8cc] hover:bg-[#0096c7] text-gray-900 font-extrabold text-[13px] uppercase tracking-wider rounded flex items-center justify-center gap-2 transition-all active:scale-95">
              <Ticket className="w-3.5 h-3.5"/> Buy Now
            </button>

            {/* More Info / See Less toggle */}
            <button onClick={()=>setMoreInfo(v=>!v)}
              className="w-full text-center text-[#00a8cc] text-[12px] font-semibold py-1 border border-[#2a3040] rounded hover:border-[#00a8cc]/50 transition-colors">
              {moreInfo ? 'See Less ▲' : 'More Info ▼'}
            </button>

            {/* Expanded info - slides in below */}
            {moreInfo&&(
              <div className="pt-3 border-t border-[#2a3040] space-y-2.5">
                <p className="text-[12px] text-[#8a9ab5] leading-relaxed">{movie.synopsis}</p>
                <div className="space-y-1.5 text-[12px]">
                  {[
                    ['LANGUAGE', movie.language],
                    ['GENRE',    movie.genre?.join(', ')],
                    ['CAST',     cast.slice(0,3).map((c:any)=>c.name).join(', ')],
                    ['DIRECTOR', movie.director],
                  ].filter(([,v])=>v).map(([label,value])=>(
                    <p key={label} className="leading-snug">
                      <span className="text-[#8a9ab5] uppercase text-[10px] font-bold tracking-wider">{label}: </span>
                      <span className="text-[#cdd6e0]">{value}</span>
                    </p>
                  ))}
                </div>
                {movie.trailerUrl&&(
                  <button onClick={()=>setShowTrailer(true)} className="flex items-center gap-2 pt-1 group">
                    <span className="w-6 h-6 rounded-full border-2 border-[#00a8cc] flex items-center justify-center group-hover:bg-[#00a8cc] transition-colors shrink-0">
                      <Play className="w-2.5 h-2.5 fill-[#00a8cc] group-hover:fill-white ml-0.5"/>
                    </span>
                    <span className="text-[#00a8cc] font-semibold text-[12px] group-hover:underline">Watch Trailer</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ══ RIGHT BOOKING PANEL ═══════════════════════════════════════════ */}
        <div id="booking-panel" className="flex-1 min-w-0">

          {/* Tab bar */}
          <div className="flex border-b border-gray-200 mb-0 bg-white dark:border-gray-800 dark:bg-gray-900">
            {['NOW SHOWING','CHECKOUT'].map((tab,i)=>(
              <button key={tab} className={`px-5 py-3 text-[13px] font-extrabold uppercase tracking-wider whitespace-nowrap transition-colors ${
                i===0?'text-[#00a8cc] border-b-2 border-[#00a8cc] -mb-px':'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              }`}>{tab}</button>
            ))}
          </div>

          {/* ── Step 1: Select Date, Cinema & Time ── */}
          <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
            <div onClick={()=>setStep1Open(o=>!o)}
              className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors dark:hover:bg-gray-800">
              <div className="flex items-center gap-2.5">
                <span className={`w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center shrink-0 ${selSlot?'bg-emerald-500':'bg-[#00a8cc]'} text-gray-900`}>
                  {selSlot?'✓':'1'}
                </span>
                <span className="text-[14px] font-bold text-gray-900 dark:text-gray-100">Select Date, Cinema &amp; Time</span>
                {selSlot&&<span className="text-[12px] text-[#00a8cc] hidden sm:inline">{selSlot.time} · {selSlot.cinema}</span>}
              </div>
              {step1Open?<ChevronUp className="w-4 h-4 text-gray-500"/>:<ChevronDown className="w-4 h-4 text-gray-500"/>}
            </div>

            {step1Open&&(
              <div className="px-5 pb-5 space-y-5 border-t border-gray-200 dark:border-gray-800">

                {/* Select Date */}
                <div className="pt-4">
                  <p className="text-[12px] font-bold text-gray-500 mb-2.5 uppercase tracking-wider dark:text-gray-400">Select Date</p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {dates.map(d=>(
                      <button key={d.iso} onClick={()=>{setSelDateIso(d.iso);setSelSlot(null);clearSelection();}}
                        className={`flex flex-col items-center px-3 py-2 rounded-lg border min-w-[52px] transition-all ${
                          selDateIso===d.iso?'bg-[#00a8cc] border-[#00a8cc] text-gray-900':'bg-white border-gray-300 text-gray-600 hover:border-[#00a8cc]/50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                        }`}>
                        <span className="text-[10px] uppercase font-semibold">{d.shortLabel}</span>
                        <span className="text-[18px] font-black leading-tight">{d.dateNum}</span>
                        <span className="text-[10px] font-semibold">{d.day}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Select Cinemas */}
                <div>
                  <p className="text-[12px] font-bold text-gray-500 mb-2.5 uppercase tracking-wider dark:text-gray-400">Select Cinemas <span className="text-gray-700 dark:text-gray-300">({selectedLocation})</span></p>
                  <div className="flex flex-wrap gap-2">
                    {['All',...cinemaFilterOptions].map(name=>(
                      <button key={name} onClick={()=>setCinFilter(name)}
                        className={`px-3 py-1.5 rounded text-[12px] font-semibold transition-all ${
                          cinFilter===name?'bg-[#00a8cc] text-gray-900':'bg-white border border-gray-300 text-gray-600 hover:border-[#00a8cc]/50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                        }`}>{name}</button>
                    ))}
                  </div>
                </div>

                {/* Time slots per cinema */}
                <div className="space-y-4 pt-1 border-t border-gray-200 dark:border-gray-800">
                  {showtimesLoading ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="skeleton h-2.5 w-32 rounded" />
                        <div className="flex flex-wrap gap-2">
                          {[1,2,3,4].map(n=>(
                            <div key={n} className="skeleton h-12 w-20 rounded" />
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="skeleton h-2.5 w-28 rounded" />
                        <div className="flex flex-wrap gap-2">
                          {[1,2].map(n=>(
                            <div key={n} className="skeleton h-12 w-20 rounded" />
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : filteredGroups.length===0 ? (
                    <div className="text-center py-6">
                      <p className="text-[12px] text-gray-500 dark:text-gray-400">No showtimes scheduled for this date.</p>
                    </div>
                  ) : filteredGroups.map(group=>{
                    return(
                      <div key={group.cinemaId}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[13px] font-extrabold text-gray-900 uppercase dark:text-gray-100">{group.cinemaName}</span>
                          <span className="text-[11px] text-amber-600 font-semibold">({movie.language||'ENG'})</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {group.slots.map(slot=>{
                            const isSel = selSlot?.showtimeId===slot.showtimeId;
                            const isPast = isPastSlot(slot.startsAt);
                            return(
                              <button key={slot.showtimeId} disabled={isPast}
                                onClick={()=>!isPast&&handleSlot(group.cinemaName,group.cinemaId,slot.time,slot.fmt,movie.language||'ENG',slot.showtimeId)}
                                className={`px-3.5 py-2 rounded text-left border transition-all ${
                                  isPast?'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-600':
                                  isSel?'bg-[#00a8cc] border-[#00a8cc] text-gray-900 font-bold':'bg-white border-gray-300 text-gray-700 hover:border-[#00a8cc]/60 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200'
                                }`}>
                                <span className="block text-[13px] font-bold">{slot.time}</span>
                                <span className="block text-[10px] text-gray-500 mt-0.5 dark:text-gray-400">{isPast?'Show ended':slot.fmt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Please Note - QFX amber box */}
                <div className="rounded border border-amber-600/30 bg-amber-50 p-4 space-y-1.5 dark:bg-amber-950/40 dark:border-amber-900">
                  <p className="text-[13px] font-bold text-amber-700 dark:text-amber-400">Please Note</p>
                  <p className="text-[12px] text-amber-800/90 leading-relaxed">Tickets are required for all admissions. No entry for children under 2.5 feet.</p>
                  <p className="text-[12px] text-amber-800/70 leading-relaxed">सूचना: बुद्ध देखि बालक सम्म सबै दर्शकहरुलाई सिनेमा हेर्न टिकेटको टिकट दर लागू हुनेछ। २.५ फिट भन्दा मुनिको बालबालिकालाई सिनेमाघर भित्र प्रवेश निषेध गरिएको छ।</p>
                </div>
              </div>
            )}
          </div>

          {/* ── Step 2: Pick Seats ── */}
          <div className={`mt-4 bg-white rounded-xl border border-gray-200 overflow-hidden transition-opacity dark:bg-gray-900 dark:border-gray-800 ${selSlot?'opacity-100':'opacity-40 pointer-events-none'}`}>
            <div onClick={()=>selSlot&&setStep2Open(o=>!o)}
              className={`flex items-center justify-between px-5 py-3.5 ${selSlot?'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800':''} transition-colors`}>
              <div className="flex items-center gap-2.5">
                <span className={`w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center shrink-0 ${selSlot?'bg-[#00a8cc]':'bg-gray-300 dark:bg-gray-700'} text-gray-900 dark:text-gray-900`}>2</span>
                <span className="text-[14px] font-bold text-gray-900 dark:text-gray-100">Pick Your Seats</span>
                {!selSlot&&<span className="text-[12px] text-gray-500 ml-1 dark:text-gray-400">- select a showtime first</span>}
              </div>
              {selSlot&&(step2Open?<ChevronUp className="w-4 h-4 text-gray-500"/>:<ChevronDown className="w-4 h-4 text-gray-500"/>)}
            </div>

            {step2Open&&selSlot&&(
              <div className="px-5 pb-5 pt-4 border-t border-gray-200 space-y-5 dark:border-gray-800">
                {holdError&&(
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-[12px] text-rose-600 flex items-center gap-2 dark:text-rose-400">
                    <ShieldAlert className="w-4 h-4 shrink-0"/>{holdError}
                  </div>
                )}
                <SeatMap showtimeId={selSlot.showtimeId}/>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div>
                    <span className="text-[12px] text-gray-500 dark:text-gray-400">
                      {selectedSeats.length} seat{selectedSeats.length!==1?'s':''} selected
                    </span>
                    {selectedSeats.length>0&&(
                      <p className="text-[14px] font-extrabold text-gray-900 dark:text-gray-100">
                        {selectedSeats.map(s=>`${s.row}${s.number}`).join(', ')}
                        <span className="text-[#00a8cc] ml-3">NPR {selectedSeats.reduce((s,x)=>s+x.price,0).toFixed(0)}</span>
                      </p>
                    )}
                  </div>
                  <button onClick={handleCheckout} disabled={selectedSeats.length===0||holdMutation.isPending}
                    className="px-6 py-2.5 bg-[#00a8cc] hover:bg-[#0096c7] disabled:opacity-40 text-gray-900 font-extrabold text-[12px] uppercase tracking-wider rounded transition-all active:scale-95 flex items-center gap-2">
                    {holdMutation.isPending?'Holding...':'Proceed to Checkout'}
                    <ArrowRight className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Movie Details table */}
          <div className="mt-6 px-1 space-y-1 bg-white rounded-xl border border-gray-200 p-5 dark:bg-gray-900 dark:border-gray-800">
            <h4 className="text-[14px] font-bold text-gray-900 mb-3 dark:text-gray-100">Movie Details</h4>
            <InfoRow label="Original Title">{movie.title}</InfoRow>
            <InfoRow label="Release Date">{movie.releaseDateDisplay}</InfoRow>
            {movie.rating&&<InfoRow label="Age Rating">{movie.rating}</InfoRow>}
            {movie.runtimeMins&&<InfoRow label="Runtime">{movie.runtimeMins} mins</InfoRow>}
            {movie.year&&<InfoRow label="Year">{movie.year}</InfoRow>}
            {movie.language&&<InfoRow label="Original Language">{movie.language}</InfoRow>}
            {movie.genre?.length>0&&<InfoRow label="Genre">{movie.genre.join(', ')}</InfoRow>}
            {movie.director&&<InfoRow label="Director">{movie.director}</InfoRow>}
            {cast.length>0&&<InfoRow label="Cast">{cast.slice(0,5).map((c:any,i:number)=><span key={i}>{c.name}{i<Math.min(cast.length,5)-1?',\u00a0\u00a0':''}</span>)}</InfoRow>}
            {movie.trailerUrl&&(
              <InfoRow label="Trailer">
                <button onClick={()=>setShowTrailer(true)} className="flex items-center gap-2 group">
                  <span className="w-6 h-6 rounded-full border-2 border-[#00a8cc] flex items-center justify-center group-hover:bg-[#00a8cc] transition-colors shrink-0">
                    <Play className="w-2.5 h-2.5 fill-[#00a8cc] group-hover:fill-white ml-0.5"/>
                  </span>
                  <span className="text-[#00a8cc] font-semibold text-[13px] group-hover:underline">{movie.language||'Watch'}</span>
                </button>
              </InfoRow>
            )}
            <div className="border-t border-[#00a8cc]/40 pt-4 mt-2">
              <p className="text-[13px] text-gray-600 dark:text-gray-400">From {movie.releaseDateDisplay}</p>
            </div>
          </div>
        </div>
      </div>

      {showTrailer&&<TrailerModal url={movie.trailerUrl} title={movie.title} onClose={()=>setShowTrailer(false)}/>}
    </div>
  );
};

// ─── Entry point ──────────────────────────────────────────────────────────────
export const MovieDetailsPage: React.FC = () => {
  const {id} = useParams<{id:string}>();
  const { data: apiMovie, isLoading } = useMovieDetail(id ?? '');
  const movie = normalise(apiMovie);

  if (isLoading||!movie) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Breadcrumb skeleton */}
      <div className="border-b border-gray-200 py-3 px-4 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          <div className="skeleton h-3 w-12 rounded" />
          <div className="skeleton h-3 w-1 rounded" />
          <div className="skeleton h-3 w-10 rounded" />
          <div className="skeleton h-3 w-1 rounded" />
          <div className="skeleton h-3 w-32 rounded" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col lg:flex-row gap-6">
        {/* Left sidebar skeleton */}
        <div className="lg:w-[200px] shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
            {/* Badge bar */}
            <div className="skeleton h-7 w-full rounded-none" />
            {/* Poster */}
            <div className="skeleton aspect-[2/3] w-full rounded-none" />
          </div>
          <div className="pt-3 space-y-2.5">
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-2/3 rounded" />
            <div className="flex gap-2">
              <div className="skeleton h-5 w-16 rounded" />
              <div className="skeleton h-5 w-10 rounded" />
            </div>
            <div className="skeleton h-9 w-full rounded" />
            <div className="skeleton h-8 w-full rounded" />
          </div>
        </div>

        {/* Right panel skeleton */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Tab bar */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="flex border-b border-gray-200 dark:border-gray-800">
              <div className="px-5 py-3">
                <div className="skeleton h-3 w-24 rounded" />
              </div>
              <div className="px-5 py-3">
                <div className="skeleton h-3 w-20 rounded" />
              </div>
            </div>

            {/* Step 1 */}
            <div className="p-5 space-y-5">
              {/* Date picker */}
              <div>
                <div className="skeleton h-3 w-20 rounded mb-3" />
                <div className="flex gap-2">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="skeleton h-16 w-14 rounded-lg" />
                  ))}
                </div>
              </div>
              {/* Cinema filter */}
              <div>
                <div className="skeleton h-3 w-32 rounded mb-3" />
                <div className="flex gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="skeleton h-8 w-16 rounded" />
                  ))}
                </div>
              </div>
              {/* Time slots */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-3">
                <div className="skeleton h-3 w-28 rounded" />
                <div className="flex gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton h-12 w-20 rounded" />
                  ))}
                </div>
              </div>
              {/* Please Note */}
              <div className="skeleton h-20 w-full rounded-xl" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden opacity-40">
            <div className="p-4 flex items-center gap-2.5">
              <div className="skeleton h-6 w-6 rounded-full" />
              <div className="skeleton h-4 w-28 rounded" />
            </div>
          </div>

          {/* Movie Details table */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-3">
            <div className="skeleton h-4 w-28 rounded mb-4" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <div className="skeleton h-3 w-32 rounded shrink-0" />
                <div className="skeleton h-3 w-40 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return movie.isShowing ? <NowShowingDetail movie={movie}/> : <ComingSoonDetail movie={movie}/>;
};
