import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play, Ticket, X, ChevronRight, ArrowLeft,
  ChevronDown, ChevronUp, ShieldAlert, ArrowRight, CheckCircle2,
} from 'lucide-react';
import { getMovieById } from '../features/movies/moviesData';
import { useMovieDetail } from '../features/movies/useMovies';
import { useLocationStore, useLiveLocations, LOCATION_CINEMAS_MAP } from '../features/location/useLocationStore';
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

const generateDates = () => {
  const today = new Date();
  const days  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months= ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return Array.from({length: 7}, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() + i);
    return {
      label:     i === 0 ? `Today, ${d.getDate()} ${months[d.getMonth()]}` : `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`,
      shortLabel: months[d.getMonth()],
      dateNum:   String(d.getDate()).padStart(2,'0'),
      day:       i === 0 ? 'Today' : days[d.getDay()],
      val:       `${i === 0 ? 'Today' : days[d.getDay()]}, ${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]}`,
    };
  });
};

const SLOTS_CACHE: Record<string, {time:string; fmt:string; showtimeId:string}[]> = {};
function getSlotsForCinema(cinemaId: string, movieId: string, dateVal: string, hallTypes: string[]) {
  const k = `${cinemaId}_${movieId}_${dateVal}`;
  if (!SLOTS_CACHE[k]) SLOTS_CACHE[k] = [
    { time:'10:30 AM', fmt: hallTypes[0]||'Standard', showtimeId:`st_${cinemaId}_${movieId}_1030` },
    { time:'01:45 PM', fmt: hallTypes[0]||'Standard', showtimeId:`st_${cinemaId}_${movieId}_1345` },
    { time:'04:15 PM', fmt: hallTypes[1]||hallTypes[0]||'Standard', showtimeId:`st_${cinemaId}_${movieId}_1615` },
    { time:'07:30 PM', fmt: hallTypes[0]||'Standard', showtimeId:`st_${cinemaId}_${movieId}_1930` },
    { time:'10:00 PM', fmt: hallTypes[1]||hallTypes[0]||'Standard', showtimeId:`st_${cinemaId}_${movieId}_2200` },
  ];
  return SLOTS_CACHE[k];
}

// ─── Trailer Modal ────────────────────────────────────────────────────────────
const TrailerModal: React.FC<{url:string;title:string;onClose:()=>void}> = ({url,title,onClose}) => (
  <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={onClose}>
    <div className="relative w-full max-w-5xl" onClick={e=>e.stopPropagation()}>
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-sm font-bold text-gray-900">{title} — Trailer</span>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-900"><X className="w-5 h-5"/></button>
      </div>
      <div className="aspect-video w-full bg-black rounded-xl overflow-hidden">
        <iframe src={url} title={title} className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>
      </div>
    </div>
  </div>
);

// ─── Info Row ─────────────────────────────────────────────────────────────────
const InfoRow: React.FC<{label:string;children:React.ReactNode}> = ({label,children}) => (
  <div className="flex py-3 border-b border-[#2a3040] last:border-0">
    <span className="text-[#00a8cc] text-[13px] w-40 shrink-0">{label}</span>
    <span className="text-[#cdd6e0] text-[13px] flex-1">{children}</span>
  </div>
);

// ─── Seat Map ─────────────────────────────────────────────────────────────────
const SeatMap: React.FC<{showtimeId:string}> = ({showtimeId}) => {
  const {data:seats,isLoading} = useSeats(showtimeId);
  const {selectedSeats,seatError,clearSeatError,toggleSeat} = useSeatStore();
  if (isLoading) return (
    <div className="flex flex-col items-center gap-2 py-4">
      {['A','B','C','D','E','F'].map(r=>(
        <div key={r} className="flex gap-1.5">
          {Array.from({length:10}).map((_,i)=><div key={i} className="w-6 h-6 shimmer rounded"/>)}
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
    const label=type==='RECLINER'?`VIP RECLINER — NPR ${price}`:type==='PREMIUM'?`PREMIUM — NPR ${price}`:`STANDARD — NPR ${price}`;
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
            <p className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-1">{tier.label}</p>
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
                          title={`${seat.row}${seat.number} — NPR ${seat.price}`}
                          className={`w-6 h-6 rounded text-[9px] font-bold transition-all border flex items-center justify-center ${
                            unavail?'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed':
                            sel?'bg-amber-400 border-amber-300 text-black font-extrabold scale-110':
                            'bg-gray-100 border-[#00a8cc] text-[#00a8cc] hover:bg-[#00a8cc] hover:text-gray-900'
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
      <div className="flex flex-wrap justify-center gap-5 text-[11px] text-gray-600 pt-3 border-t border-gray-200">
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded border border-[#00a8cc] bg-gray-100 inline-block"/>Available</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-amber-400 inline-block"/>Selected</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-gray-200 border border-gray-300 inline-block"/>Booked</span>
      </div>
    </div>
  );
};

// ─── Coming Soon — QFX info layout ───────────────────────────────────────────
const ComingSoonDetail: React.FC<{movie:any}> = ({movie}) => {
  const navigate = useNavigate();
  const [showTrailer,setShowTrailer] = useState(false);
  const cast = (movie.cast??[]).filter((c:any)=>c?.name);
  return (
    <div className="min-h-screen bg-[#131622] text-gray-100 pb-20">
      <div className="border-b border-[#2a3040] py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-[13px] text-[#8a9ab5]">
          <button onClick={()=>navigate('/movies')} className="hover:text-gray-900">Movies</button>
          <ChevronRight className="w-3 h-3"/><button onClick={()=>navigate(-1)} className="flex items-center gap-1 hover:text-gray-900"><ArrowLeft className="w-3 h-3"/>Back</button>
          <ChevronRight className="w-3 h-3"/><span className="text-gray-900">{movie.title}</span>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row gap-10 md:items-center">
        <div className="shrink-0 w-full md:w-48 lg:w-52">
          <img src={movie.posterUrl} alt={movie.title} className="w-full aspect-[2/3] object-cover object-center rounded-lg"/>
        </div>
        <div className="flex-1 min-w-0 space-y-4">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900">{movie.title}</h1>
            <p className="text-[#8a9ab5] text-[13px] mt-2 leading-relaxed">{movie.synopsis}</p>
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
            <p className="text-[13px] text-[#cdd6e0]">From {movie.releaseDateDisplay}</p>
          </div>
        </div>
      </div>
      {showTrailer&&<TrailerModal url={movie.trailerUrl} title={movie.title} onClose={()=>setShowTrailer(false)}/>}
    </div>
  );
};

// ─── Now Showing — 100% QFX-accurate layout ──────────────────────────────────
const NowShowingDetail: React.FC<{movie:any}> = ({movie}) => {
  const navigate  = useNavigate();
  const {selectedLocation} = useLocationStore();
  const { liveMap } = useLiveLocations();
  const cinemas = liveMap[selectedLocation] || liveMap[Object.keys(liveMap)[0]] || [];
  const user = useAuthStore(s=>s.user);
  const {selectedSeats,clearSelection,setExpiresAt,setShowtimeId} = useSeatStore();
  const holdMutation = useHoldSeats();

  const dates = generateDates();
  const [showTrailer,setShowTrailer]   = useState(false);
  const [moreInfo,setMoreInfo]         = useState(false);
  const [selDate,setSelDate]           = useState(dates[0].val);
  const [cinFilter,setCinFilter]       = useState('All');
  const [langFilter,setLangFilter]     = useState('All');
  const [step1Open,setStep1Open]       = useState(true);
  const [step2Open,setStep2Open]       = useState(false);
  const [holdError,setHoldError]       = useState('');
  const [selSlot,setSelSlot]           = useState<{cinema:string;cinemaId:string;time:string;fmt:string;lang:string;showtimeId:string}|null>(null);
  const cast = (movie.cast??[]).filter((c:any)=>c?.name);

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
    <div className="min-h-screen bg-[#131622] text-gray-100 pb-20">

      {/* Breadcrumb */}
      <div className="border-b border-[#2a3040] py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-[13px] text-[#8a9ab5]">
          <button onClick={()=>navigate('/movies')} className="hover:text-gray-900 transition-colors">Movies</button>
          <ChevronRight className="w-3 h-3"/>
          <button onClick={()=>navigate(-1)} className="flex items-center gap-1 hover:text-gray-900 transition-colors"><ArrowLeft className="w-3 h-3"/>Back</button>
          <ChevronRight className="w-3 h-3"/>
          <span className="text-gray-900">{movie.title}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col lg:flex-row gap-6 lg:items-start">

        {/* ══ LEFT SIDEBAR ══════════════════════════════════════════════════ */}
        <div className="lg:w-[200px] shrink-0">

          {/* Poster card — exactly like QFX */}
          <div className="relative group">
            {/* Cyan "NOW SHOWING" / badge bar */}
            <div className="qfx-card-top-bar text-center text-gray-900 text-[11px] font-extrabold uppercase py-1.5">
              {movie.badge||'Now Showing'}
            </div>
            {/* Full-width poster, no border radius on sides so it flows with bar */}
            <img src={movie.posterUrl} alt={movie.title}
              className="w-full aspect-[2/3] object-cover object-center block"/>
            {/* Trailer overlay on hover */}
            {movie.trailerUrl&&(
              <button onClick={()=>setShowTrailer(true)}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-black/80 hover:bg-[#00a8cc] text-gray-900 text-[11px] font-bold rounded-full border border-white/20 transition-all opacity-0 group-hover:opacity-100 whitespace-nowrap">
                <Play className="w-3 h-3 fill-white"/> Trailer
              </button>
            )}
          </div>

          {/* Below poster info — exactly QFX style */}
          <div className="pt-3 space-y-2">
            <p className="text-[11px] font-black text-[#00a8cc] uppercase tracking-widest">Now Showing</p>
            <h2 className="text-[15px] font-bold text-gray-900 leading-snug">
              {movie.title}
              <span className="text-[#8a9ab5] font-normal text-[13px] ml-1">({movie.year})</span>
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

            {/* Expanded info — slides in below */}
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
          <div className="flex border-b border-[#2a3040] mb-0">
            {['NOW SHOWING','FOOD & BEVERAGES','CHECKOUT'].map((tab,i)=>(
              <button key={tab} className={`px-5 py-3 text-[13px] font-extrabold uppercase tracking-wider whitespace-nowrap transition-colors ${
                i===0?'text-[#00a8cc] border-b-2 border-[#00a8cc] -mb-px':'text-[#8a9ab5] hover:text-gray-900'
              }`}>{tab}</button>
            ))}
          </div>

          {/* ── Step 1: Select Date, Cinema & Time ── */}
          <div className="bg-[#1a1f2e] rounded-b-xl border border-t-0 border-[#2a3040] overflow-hidden">
            <div onClick={()=>setStep1Open(o=>!o)}
              className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-2.5">
                <span className={`w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center shrink-0 ${selSlot?'bg-emerald-500':'bg-[#00a8cc]'} text-gray-900`}>
                  {selSlot?'✓':'1'}
                </span>
                <span className="text-[14px] font-bold text-gray-900">Select Date, Cinema &amp; Time</span>
                {selSlot&&<span className="text-[12px] text-[#00a8cc] hidden sm:inline">{selSlot.time} · {selSlot.cinema}</span>}
              </div>
              {step1Open?<ChevronUp className="w-4 h-4 text-[#8a9ab5]"/>:<ChevronDown className="w-4 h-4 text-[#8a9ab5]"/>}
            </div>

            {step1Open&&(
              <div className="px-5 pb-5 space-y-5 border-t border-[#2a3040]">

                {/* Select Date */}
                <div className="pt-4">
                  <p className="text-[12px] font-bold text-[#8a9ab5] mb-2.5 uppercase tracking-wider">Select Date</p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {dates.map(d=>(
                      <button key={d.val} onClick={()=>{setSelDate(d.val);setSelSlot(null);clearSelection();}}
                        className={`flex flex-col items-center px-3 py-2 rounded-lg border min-w-[52px] transition-all ${
                          selDate===d.val?'bg-[#00a8cc] border-[#00a8cc] text-gray-900':'bg-[#131622] border-[#2a3040] text-[#8a9ab5] hover:border-[#00a8cc]/50'
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
                  <p className="text-[12px] font-bold text-[#8a9ab5] mb-2.5 uppercase tracking-wider">Select Cinemas <span className="text-[#cdd6e0]">({selectedLocation})</span></p>
                  <div className="flex flex-wrap gap-2">
                    {['All',...cinemas.map(c=>c.name)].map(name=>(
                      <button key={name} onClick={()=>setCinFilter(name)}
                        className={`px-3 py-1.5 rounded text-[12px] font-semibold transition-all ${
                          cinFilter===name?'bg-[#00a8cc] text-gray-900':'bg-[#131622] border border-[#2a3040] text-[#8a9ab5] hover:border-[#00a8cc]/50'
                        }`}>{name}</button>
                    ))}
                  </div>
                </div>

                {/* Select Language */}
                <div>
                  <p className="text-[12px] font-bold text-[#8a9ab5] mb-2.5 uppercase tracking-wider">Select Language</p>
                  <div className="flex gap-2 flex-wrap">
                    {['All','English','Hindi Dubbed','Nepali'].map(lang=>(
                      <button key={lang} onClick={()=>setLangFilter(lang)}
                        className={`px-3 py-1.5 rounded text-[12px] font-semibold transition-all ${
                          langFilter===lang?'bg-[#00a8cc] text-gray-900':'bg-[#131622] border border-[#2a3040] text-[#8a9ab5] hover:border-[#00a8cc]/50'
                        }`}>{lang}</button>
                    ))}
                  </div>
                </div>

                {/* Time slots per cinema */}
                <div className="space-y-4 pt-1 border-t border-[#2a3040]">
                  {cinemas.filter(cin=>cinFilter==='All'||cinFilter===cin.name).map(cin=>{
                    const slots = getSlotsForCinema(cin.id,movie.id,selDate,cin.hallTypes);
                    return(
                      <div key={cin.id}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[13px] font-extrabold text-gray-900 uppercase">{cin.name}</span>
                          <span className="text-[11px] text-amber-400 font-semibold">({movie.language||'ENG'})</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {slots.map(slot=>{
                            const isSel = selSlot?.showtimeId===slot.showtimeId;
                            return(
                              <button key={slot.showtimeId}
                                onClick={()=>handleSlot(cin.name,cin.id,slot.time,slot.fmt,movie.language||'ENG',slot.showtimeId)}
                                className={`px-3.5 py-2 rounded text-left border transition-all ${
                                  isSel?'bg-[#00a8cc] border-[#00a8cc] text-gray-900 font-bold':'bg-[#131622] border-[#2a3040] text-[#cdd6e0] hover:border-[#00a8cc]/60'
                                }`}>
                                <span className="block text-[13px] font-bold">{slot.time}</span>
                                <span className="block text-[10px] text-[#8a9ab5] mt-0.5">{slot.fmt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Please Note — QFX amber box */}
                <div className="rounded border border-amber-600/30 bg-[#1a1208] p-4 space-y-1.5">
                  <p className="text-[13px] font-bold text-amber-400">Please Note</p>
                  <p className="text-[12px] text-amber-300/90 leading-relaxed">Tickets are required for all admissions. No entry for children under 2.5 feet.</p>
                  <p className="text-[12px] text-amber-300/60 leading-relaxed">सूचना: बुद्ध देखि बालक सम्म सबै दर्शकहरुलाई सिनेमा हेर्न टिकेटको टिकट दर लागू हुनेछ। २.५ फिट भन्दा मुनिको बालबालिकालाई सिनेमाघर भित्र प्रवेश निषेध गरिएको छ।</p>
                </div>
              </div>
            )}
          </div>

          {/* ── Step 2: Pick Seats ── */}
          <div className={`mt-4 bg-[#1a1f2e] rounded-xl border border-[#2a3040] overflow-hidden transition-opacity ${selSlot?'opacity-100':'opacity-40 pointer-events-none'}`}>
            <div onClick={()=>selSlot&&setStep2Open(o=>!o)}
              className={`flex items-center justify-between px-5 py-3.5 ${selSlot?'cursor-pointer hover:bg-gray-100':''} transition-colors`}>
              <div className="flex items-center gap-2.5">
                <span className={`w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center shrink-0 ${selSlot?'bg-[#00a8cc]':'bg-[#2a3040]'} text-gray-900`}>2</span>
                <span className="text-[14px] font-bold text-gray-900">Pick Your Seats</span>
                {!selSlot&&<span className="text-[12px] text-[#8a9ab5] ml-1">— select a showtime first</span>}
              </div>
              {selSlot&&(step2Open?<ChevronUp className="w-4 h-4 text-[#8a9ab5]"/>:<ChevronDown className="w-4 h-4 text-[#8a9ab5]"/>)}
            </div>

            {step2Open&&selSlot&&(
              <div className="px-5 pb-5 pt-4 border-t border-[#2a3040] space-y-5">
                {holdError&&(
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-[12px] text-rose-400 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0"/>{holdError}
                  </div>
                )}
                <SeatMap showtimeId={selSlot.showtimeId}/>
                <div className="flex items-center justify-between pt-4 border-t border-[#2a3040]">
                  <div>
                    <span className="text-[12px] text-[#8a9ab5]">
                      {selectedSeats.length} seat{selectedSeats.length!==1?'s':''} selected
                    </span>
                    {selectedSeats.length>0&&(
                      <p className="text-[14px] font-extrabold text-gray-900">
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
          <div className="mt-6 px-1 space-y-1">
            <h4 className="text-[14px] font-bold text-gray-900 mb-3">Movie Details</h4>
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
              <p className="text-[13px] text-[#cdd6e0]">From {movie.releaseDateDisplay}</p>
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
  const {data:apiMovie,isLoading} = useMovieDetail(id??'');
  const staticFallback = !isLoading&&!apiMovie ? getMovieById(id??'') : null;
  const movie = normalise(apiMovie??staticFallback);

  if (isLoading||!movie) return (
    <div className="min-h-screen bg-[#131622] flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto px-4 py-10">
      <div className="lg:w-[200px] shrink-0"><div className="aspect-[2/3] shimmer rounded-lg"/></div>
      <div className="flex-1 space-y-4 pt-2">
        <div className="h-7 shimmer rounded w-1/3"/>
        <div className="h-4 shimmer rounded w-full"/>
        <div className="h-4 shimmer rounded w-5/6"/>
        <div className="mt-4 h-48 shimmer rounded-xl"/>
      </div>
    </div>
  );

  return movie.isShowing ? <NowShowingDetail movie={movie}/> : <ComingSoonDetail movie={movie}/>;
};
