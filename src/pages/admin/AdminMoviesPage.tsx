import React, { useState, useMemo } from 'react';
import {
  Plus, Pencil, Trash2, X, Check, Film, Eye, EyeOff,
  Loader2, Search, Clock, Globe, Tag,
  UserPlus, UserMinus,
} from 'lucide-react';
import {
  useAdminMovies, useCreateMovie, useUpdateMovie,
  useDeleteMovie, useToggleShowing, AdminMovie,
} from '../../features/admin/useAdmin';
import apiClient from '../../lib/apiClient';

// ─── Blank form ───────────────────────────────────────────────────────────────
const BLANK: Omit<AdminMovie, 'id' | 'createdAt'> & { director: string } = {
  title: '', synopsis: '', posterUrl: '', bannerUrl: '', trailerUrl: '', genre: [],
  language: '', format: [], runtimeMins: 120, rating: 'PG',
  cast: [], director: '', releaseDate: new Date().toISOString().split('T')[0], isShowing: true,
};

const inputCls = 'w-full bg-white border border-gray-200 focus:border-[#00a8cc] focus:ring-2 focus:ring-[#00a8cc]/10 text-gray-900 text-xs rounded-xl px-3 py-2.5 focus:outline-none transition-all placeholder:text-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500';

const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
  <div>
    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-1.5 dark:text-gray-400">
      {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

// ─── Movie Card ───────────────────────────────────────────────────────────────
const MovieCard: React.FC<{
  movie: AdminMovie & { director?: string };
  onEdit: (m: AdminMovie) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  toggling: boolean;
}> = ({ movie, onEdit, onDelete, onToggle, toggling }) => (
  <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-all duration-200 hover:-translate-y-0.5 flex flex-col dark:bg-gray-900 dark:border-gray-800 dark:hover:border-gray-700">
    <div className="relative aspect-[2/3] bg-gray-100 overflow-hidden dark:bg-gray-800">
      <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/* Status badge */}
      <div className="absolute top-2 left-2">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide ${movie.isShowing ? 'bg-emerald-500 text-white' : 'bg-gray-700/90 text-gray-200'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${movie.isShowing ? 'bg-white' : 'bg-gray-400'}`} />
          {movie.isShowing ? 'Live' : 'Soon'}
        </span>
      </div>

      {/* Rating */}
      <div className="absolute top-2 right-2">
        <span className="px-1.5 py-0.5 bg-black/60 border border-white/20 rounded text-[10px] font-bold text-white">{movie.rating}</span>
      </div>

      {/* Hover actions - always visible on touch devices, hover only on desktop */}
      <div className="absolute bottom-2 inset-x-2 flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
        <button onClick={() => onEdit(movie)} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-[#00a8cc] hover:bg-[#0096c7] text-white text-[11px] font-bold rounded-lg transition-colors">
          <Pencil className="w-3 h-3" /> Edit
        </button>
        <button
          onClick={() => onToggle(movie.id)}
          disabled={toggling}
          title={movie.isShowing ? 'Set to Coming Soon' : 'Set to Now Showing'}
          className={`flex items-center justify-center w-8 py-1.5 rounded-lg transition-colors ${movie.isShowing ? 'bg-amber-500/20 hover:bg-amber-500/40 text-amber-300' : 'bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300'}`}
        >
          {toggling ? <Loader2 className="w-3 h-3 animate-spin" /> : movie.isShowing ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        </button>
        <button onClick={() => onDelete(movie.id)} className="flex items-center justify-center w-8 py-1.5 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 rounded-lg transition-colors">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>

    {/* Info strip */}
    <div className="px-3 py-2.5 flex-1 flex flex-col gap-1">
      <h3 className="text-xs font-bold text-gray-900 leading-tight line-clamp-1 dark:text-gray-100">{movie.title}</h3>
      <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{movie.runtimeMins}m</span>
        <span>·</span>
        <span className="flex items-center gap-0.5"><Globe className="w-3 h-3" />{(movie.language || '').split(',')[0].trim()}</span>
        {movie.genre[0] && <><span>·</span><span className="flex items-center gap-0.5 truncate"><Tag className="w-3 h-3 shrink-0" />{movie.genre[0]}</span></>}
      </div>
    </div>
  </div>
);

// ─── Cast Row editor ──────────────────────────────────────────────────────────
const CastEditor: React.FC<{
  cast: { name: string; role?: string | null; photoUrl?: string | null }[];
  onChange: (cast: { name: string; role: string; photoUrl: string }[]) => void;
}> = ({ cast, onChange }) => {
  const add = () => onChange([...cast as any, { name: '', role: '', photoUrl: '' }]);
  const remove = (i: number) => onChange((cast as any).filter((_: any, idx: number) => idx !== i));
  const update = (i: number, k: string, v: string) =>
    onChange((cast as any).map((c: any, idx: number) => idx === i ? { ...c, [k]: v } : c));

  return (
    <div className="space-y-2">
      {cast.map((c, i) => (
        <div key={i} className="flex gap-2 items-start">
          <div className="flex-1 grid grid-cols-2 gap-2">
            <input value={c.name ?? ''} onChange={e => update(i, 'name', e.target.value)} placeholder="Actor name" className={inputCls} />
            <input value={c.role ?? ''} onChange={e => update(i, 'role', e.target.value)} placeholder="Character role" className={inputCls} />
          </div>
          <button onClick={() => remove(i)} className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors shrink-0 mt-0.5">
            <UserMinus className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 hover:border-[#00a8cc] text-[11px] text-gray-500 hover:text-[#00a8cc] transition-colors w-full justify-center dark:border-gray-700 dark:text-gray-400"
      >
        <UserPlus className="w-3.5 h-3.5" /> Add Cast Member
      </button>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export const AdminMoviesPage: React.FC = () => {
  const { data: movies, isLoading } = useAdminMovies();
  const createMut  = useCreateMovie();
  const updateMut  = useUpdateMovie();
  const deleteMut  = useDeleteMovie();
  const toggleMut  = useToggleShowing();

  const [showForm, setShowForm]     = useState(false);
  const [editId, setEditId]         = useState<string | null>(null);
  const [form, setForm]             = useState<typeof BLANK>(BLANK);
  const [uploadingPoster, setUP]    = useState(false);
  const [uploadingBanner, setUB]    = useState(false);
  const [confirmDelete, setConfirm] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState<'all' | 'showing' | 'upcoming'>('all');

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const openCreate = () => { setForm(BLANK); setEditId(null); setError(''); setShowForm(true); };
  const openEdit = (m: AdminMovie & { director?: string }) => {
    setForm({
      title: m.title, synopsis: m.synopsis, posterUrl: m.posterUrl,
      bannerUrl: m.bannerUrl ?? '',
      trailerUrl: m.trailerUrl ?? '', genre: m.genre, language: m.language,
      format: m.format, runtimeMins: m.runtimeMins, rating: m.rating,
      cast: (m.cast ?? []).map(c => ({ name: c.name ?? '', role: c.role ?? '', photoUrl: c.photoUrl ?? '' })), director: (m as any).director ?? '',
      releaseDate: (m.releaseDate || '').split('T')[0], isShowing: m.isShowing,
    });
    setEditId(m.id); setError(''); setShowForm(true);
  };

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try { await toggleMut.mutateAsync(id); }
    finally { setTogglingId(null); }
  };

  const filtered = useMemo(() => {
    if (!movies) return [];
    return movies.filter(m => {
      const match = !search || m.title.toLowerCase().includes(search.toLowerCase());
      const tab = filter === 'all' ? true : filter === 'showing' ? m.isShowing : !m.isShowing;
      return match && tab;
    });
  }, [movies, search, filter]);

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUP(true);
    try {
      const sig = await apiClient.post('/uploads/signature?folder=cinebook/posters');
      const { timestamp, signature, apiKey, cloudName, folder } = sig.data.data;
      const fd = new FormData();
      fd.append('file', file); fd.append('api_key', apiKey);
      fd.append('timestamp', String(timestamp)); fd.append('signature', signature); fd.append('folder', folder);
      const r = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd });
      const d = await r.json();
      if (d.secure_url) set('posterUrl', d.secure_url);
      else setError('Upload failed - no URL returned');
    } catch { setError('Poster upload failed'); }
    finally { setUP(false); }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;

    // Validate that the uploaded image is landscape (wider than tall)
    const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.src = URL.createObjectURL(file);
    });
    if (dimensions.height > dimensions.width) {
      setError('Banner must be a landscape (horizontal) image. Portrait images will look zoomed in the hero.');
      e.target.value = '';
      return;
    }

    setUB(true);
    try {
      const sig = await apiClient.post('/uploads/signature?folder=cinebook/banners');
      const { timestamp, signature, apiKey, cloudName, folder } = sig.data.data;
      const fd = new FormData();
      fd.append('file', file); fd.append('api_key', apiKey);
      fd.append('timestamp', String(timestamp)); fd.append('signature', signature); fd.append('folder', folder);
      const r = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd });
      const d = await r.json();
      if (d.secure_url) {
        // Inject Cloudinary transformation: fill to 1920x500, focus on top-center
        // e.g. .../upload/c_fill,w_1920,h_500,g_north/...
        const transformedUrl = d.secure_url.replace('/upload/', '/upload/c_fill,w_1920,h_500,g_north/');
        set('bannerUrl', transformedUrl);
      } else setError('Banner upload failed - no URL returned');
    } catch { setError('Banner upload failed'); }
    finally { setUB(false); }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.posterUrl.trim()) { setError('Poster is required.'); return; }
    if (!form.genre.length) { setError('At least one genre is required.'); return; }
    if (!form.format.length) { setError('At least one format is required.'); return; }
    if (!form.language.trim()) { setError('Language is required.'); return; }
    setError('');
    const payload = {
      ...form,
      // Ensure runtimeMins is always a valid positive number
      runtimeMins: Number(form.runtimeMins) > 0 ? Number(form.runtimeMins) : 1,
      // Convert empty optional strings to undefined so Zod .optional().nullable() accepts them
      trailerUrl: (form.trailerUrl ?? '').trim() || undefined,
      bannerUrl:  (form.bannerUrl  ?? '').trim() || undefined,
      director:   (form.director   ?? '').trim() || undefined,
      synopsis:   (form.synopsis   ?? '').trim() || '',
      // Clean up cast: empty role/photoUrl strings → undefined (not valid URL)
      cast: form.cast
        .filter(c => c.name.trim()) // drop cast rows with no name
        .map(c => ({
          name:     c.name.trim(),
          role:     (c.role     ?? '').trim() || undefined,
          photoUrl: (c.photoUrl ?? '').trim() || undefined,
        })),
    };
    try {
      if (editId) await updateMut.mutateAsync({ id: editId, ...payload });
      else await createMut.mutateAsync(payload as any);
      setShowForm(false);
    } catch (e: any) {
      const data = e.response?.data;
      if (data?.errors?.length) {
        // Show specific field validation errors from Zod
        setError(data.errors.map((err: any) => `${err.field.replace('body.', '')}: ${err.message}`).join(' | '));
      } else {
        setError(data?.message || 'Save failed');
      }
    }
  };

  const handleDelete = async (id: string) => {
    try { await deleteMut.mutateAsync(id); setConfirm(null); }
    catch (e: any) { setError(e.response?.data?.message || 'Delete failed'); }
  };

  const nowShowing = movies?.filter(m => m.isShowing).length ?? 0;
  const upcoming   = movies?.filter(m => !m.isShowing).length ?? 0;

  return (
    <div className="space-y-5 max-w-7xl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Movies</h1>
          <p className="text-sm text-gray-500 mt-0.5 dark:text-gray-400">
            <span className="font-semibold text-gray-700 dark:text-gray-300">{movies?.length ?? 0}</span> total · <span className="text-emerald-600 font-semibold">{nowShowing} showing</span> · <span className="text-amber-600 font-semibold">{upcoming} upcoming</span>
          </p>
        </div>
        <button onClick={openCreate} className="flex items-center justify-center gap-2 px-4 py-2 bg-[#00a8cc] hover:bg-[#0096c7] text-white font-bold text-xs rounded-xl transition-all active:scale-95 shrink-0 w-full sm:w-auto">
          <Plus className="w-3.5 h-3.5" /> Add Movie
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search movies..."
            className="w-full bg-white border border-gray-200 focus:border-[#00a8cc] text-gray-900 text-xs rounded-lg pl-8 pr-3 py-2.5 focus:outline-none transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500" />
        </div>
        <div className="flex gap-1.5">
          {(['all','showing','upcoming'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold capitalize transition-colors ${filter===f?'bg-[#00a8cc] text-white':'bg-white border border-gray-200 text-gray-600 hover:text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-100'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-500">{error}</div>}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {Array.from({length:12}).map((_,i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden dark:bg-gray-900 dark:border-gray-800">
              <div className="relative aspect-[2/3] bg-gray-100 overflow-hidden dark:bg-gray-800">
                <div className="skeleton w-full h-full rounded-none" />
                {/* Status badge */}
                <div className="absolute top-2 left-2">
                  <div className="skeleton h-4 w-12 rounded-md bg-white/30" />
                </div>
                {/* Rating */}
                <div className="absolute top-2 right-2">
                  <div className="skeleton h-4 w-7 rounded bg-white/30" />
                </div>
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
              {/* Info strip */}
              <div className="px-3 py-2.5 space-y-1.5">
                <div className="skeleton h-3 w-3/4 rounded" />
                <div className="flex items-center gap-2">
                  <div className="skeleton h-2.5 w-10 rounded" />
                  <div className="skeleton h-2.5 w-14 rounded" />
                  <div className="skeleton h-2.5 w-12 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-2 dark:text-gray-500">
          <Film className="w-8 h-8 opacity-30" />
          <p className="text-sm font-semibold">No movies found</p>
          {search && <p className="text-xs">Try a different search term</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map(m => (
            <MovieCard key={m.id} movie={m as any} onEdit={openEdit} onDelete={setConfirm}
              onToggle={handleToggle} toggling={togglingId === m.id} />
          ))}
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-xs w-full space-y-4 shadow-2xl dark:bg-gray-900 dark:border-gray-800">
            <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Delete this movie?</h3>
              <p className="text-xs text-gray-600 mt-1 dark:text-gray-400">Permanent. All showtimes and bookings will also be removed.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleDelete(confirmDelete)} disabled={deleteMut.isPending}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors">
                {deleteMut.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Yes, Delete'}
              </button>
              <button onClick={() => setConfirm(null)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg transition-colors dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="w-full max-w-lg bg-white border-l border-gray-200 flex flex-col shadow-2xl overflow-hidden dark:bg-gray-900 dark:border-gray-800">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-[#00a8cc]/10 rounded-lg flex items-center justify-center">
                  <Film className="w-3.5 h-3.5 text-[#00a8cc]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">{editId ? 'Edit Movie' : 'Add New Movie'}</h2>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">{editId ? 'Update details below' : 'Fill in all required fields'}</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors dark:hover:bg-gray-800 dark:text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-500">{error}</div>}

              {/* Poster preview + upload */}
              <div className="flex gap-4 items-start">
                <div className="w-20 aspect-[2/3] bg-gray-100 rounded-xl border border-gray-200 overflow-hidden shrink-0 dark:bg-gray-800 dark:border-gray-700">
                  {form.posterUrl
                    ? <img src={form.posterUrl} alt="poster" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500"><Film className="w-6 h-6" /></div>}
                </div>
                <div className="flex-1 space-y-2">
                  <Field label="Poster Image" required>
                    <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 hover:border-[#00a8cc] text-[11px] text-gray-500 cursor-pointer transition-colors dark:border-gray-700 dark:text-gray-400 ${uploadingPoster ? 'opacity-60 pointer-events-none' : ''}`}>
                      {uploadingPoster ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00a8cc]" /> : <Plus className="w-3.5 h-3.5" />}
                      {uploadingPoster ? 'Uploading...' : 'Upload poster from device'}
                      <input type="file" accept="image/*" className="hidden" onChange={handlePosterUpload} disabled={uploadingPoster} />
                    </label>
                  </Field>
                </div>
              </div>

              {/* Banner image upload - used as hero slide background */}
              <div className="space-y-2">
                <Field label="Hero Banner Image">
                  <p className="text-[10px] text-gray-400 mb-1.5 dark:text-gray-500">Wide landscape image (1920×600 recommended) shown in the homepage hero slideshow. Falls back to poster if not set.</p>
                  {form.bannerUrl ? (
                    <div className="relative w-full aspect-[21/6] rounded-xl overflow-hidden border border-gray-200 bg-gray-100 group mb-2 dark:border-gray-700 dark:bg-gray-800">
                      <img src={form.bannerUrl} alt="banner preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => set('bannerUrl', '')}
                        className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove banner"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full aspect-[21/6] rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-gray-300 mb-2 dark:border-gray-700 dark:bg-gray-800">
                      <Film className="w-8 h-8" />
                    </div>
                  )}
                  <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 hover:border-[#00a8cc] text-[11px] text-gray-500 cursor-pointer transition-colors dark:border-gray-700 dark:text-gray-400 ${uploadingBanner ? 'opacity-60 pointer-events-none' : ''}`}>
                    {uploadingBanner ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00a8cc]" /> : <Plus className="w-3.5 h-3.5" />}
                    {uploadingBanner ? 'Uploading banner...' : 'Upload banner from device'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} disabled={uploadingBanner} />
                  </label>
                </Field>
              </div>

              {/* Trailer URL - used for the poster play button */}
              <Field label="Trailer URL (YouTube)">
                <p className="text-[10px] text-gray-400 mb-1.5 dark:text-gray-500">YouTube embed link shown when clicking the play button on the movie poster. Leave empty to hide the play button.</p>
                <input
                  className={inputCls}
                  value={form.trailerUrl}
                  onChange={e => set('trailerUrl', e.target.value)}
                  placeholder="https://www.youtube.com/embed/VIDEO_ID"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Field label="Title" required>
                    <input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Movie title" />
                  </Field>
                </div>

                <Field label="Language" required>
                  <input className={inputCls} value={form.language} onChange={e => set('language', e.target.value)} placeholder="English, Nepali…" />
                </Field>

                <Field label="Rating">
                  <select className={inputCls} value={form.rating} onChange={e => set('rating', e.target.value)}>
                    {['U','PG','PG-13','R','Adult'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </Field>

                <Field label="Runtime (min)">
                  <input type="number" min="1" max="600" className={inputCls} value={form.runtimeMins || ''} onChange={e => set('runtimeMins', e.target.value === '' ? '' : Number(e.target.value))} />
                </Field>

                <Field label="Release Date">
                  <input type="date" className={inputCls} value={form.releaseDate} onChange={e => set('releaseDate', e.target.value)} />
                </Field>

                <div className="col-span-2">
                  <Field label="Director">
                    <input className={inputCls} value={form.director} onChange={e => set('director', e.target.value)} placeholder="e.g. Christopher Nolan" />
                  </Field>
                </div>

                <div className="col-span-2">
                  <Field label="Genres (comma-separated)">
                    <input className={inputCls} value={form.genre.join(', ')} onChange={e => set('genre', e.target.value.split(',').map((g: string) => g.trim()).filter(Boolean))} placeholder="Action, Drama, Thriller" />
                  </Field>
                </div>

                <div className="col-span-2">
                  <Field label="Formats (comma-separated)">
                    <input className={inputCls} value={form.format.join(', ')} onChange={e => set('format', e.target.value.split(',').map((f: string) => f.trim()).filter(Boolean))} placeholder="2D, 3D, IMAX" />
                  </Field>
                </div>

                <div className="col-span-2">
                  <Field label="Synopsis" required>
                    <textarea rows={3} className={inputCls} value={form.synopsis} onChange={e => set('synopsis', e.target.value)} placeholder="Short description…" />
                  </Field>
                </div>

                {/* Status toggle */}
                <div className="col-span-2">
                  <Field label="Status">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => set('isShowing', true)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-xs font-semibold transition-colors ${form.isShowing ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-600 dark:bg-emerald-900/40 dark:border-emerald-800 dark:text-emerald-300' : 'bg-gray-100 border-gray-300 text-gray-500 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                        <Eye className="w-3.5 h-3.5" /> Now Showing
                      </button>
                      <button type="button" onClick={() => set('isShowing', false)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-xs font-semibold transition-colors ${!form.isShowing ? 'bg-amber-500/15 border-amber-500/50 text-amber-600 dark:bg-amber-900/40 dark:border-amber-800 dark:text-amber-300' : 'bg-gray-100 border-gray-300 text-gray-500 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                        <EyeOff className="w-3.5 h-3.5" /> Coming Soon
                      </button>
                    </div>
                  </Field>
                </div>

                {/* Cast editor */}
                <div className="col-span-2">
                  <Field label={`Cast (${form.cast.length} member${form.cast.length !== 1 ? 's' : ''})`}>
                    <CastEditor cast={form.cast} onChange={c => set('cast', c)} />
                  </Field>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 flex gap-2.5 px-5 py-4 border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
              <button onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#00a8cc] hover:bg-[#0096c7] text-white font-extrabold text-xs rounded-xl transition-all active:scale-95 disabled:opacity-60">
                {(createMut.isPending || updateMut.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editId ? 'Save Changes' : 'Create Movie'}
              </button>
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-colors dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
