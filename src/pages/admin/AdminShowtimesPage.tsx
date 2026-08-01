import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, CalendarDays, Loader2, ChevronDown } from 'lucide-react';
import { useAdminShowtimes, useAdminMovies, useAdminHalls, useCreateShowtime, useUpdateShowtime, useDeleteShowtime, useBulkDeleteShowtimes, AdminShowtime } from '../../features/admin/useAdmin';

const inputCls = 'w-full bg-white border border-gray-200 focus:border-[#00a8cc] focus:ring-2 focus:ring-[#00a8cc]/10 text-gray-900 text-xs rounded-xl px-3 py-2.5 focus:outline-none transition-all';
const Lbl: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>
    {children}
  </div>
);
const BLANK = { movieId: '', hallId: '', startsAt: '', basePrice: 450, premiumPrice: 650 };
const fmt = (d: string) => new Date(d).toLocaleString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const AdminShowtimesPage: React.FC = () => {
  const [movieFilter, setMovieFilter] = useState('');
  const { data: showtimes, isLoading } = useAdminShowtimes(movieFilter || undefined);
  const { data: movies } = useAdminMovies();
  const { data: halls }  = useAdminHalls();
  const create   = useCreateShowtime();
  const update   = useUpdateShowtime();
  const del      = useDeleteShowtime();
  const bulkDel  = useBulkDeleteShowtimes();

  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState<string | null>(null);
  const [form, setForm]           = useState(BLANK);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [error, setError]         = useState('');

  const set = (k: keyof typeof form, v: any) => setForm(f => ({ ...f, [k]: v }));
  const openEdit = (s: AdminShowtime) => {
    setForm({ movieId: s.movieId, hallId: s.hallId, startsAt: new Date(s.startsAt).toISOString().slice(0, 16), basePrice: s.basePrice, premiumPrice: s.premiumPrice });
    setEditId(s.id); setShowForm(true); setError('');
  };

  const submit = async () => {
    if (!form.movieId || !form.hallId || !form.startsAt) { setError('All fields required.'); return; }
    setError('');
    try {
      if (editId) await update.mutateAsync({ id: editId, startsAt: form.startsAt, basePrice: form.basePrice, premiumPrice: form.premiumPrice });
      else await create.mutateAsync(form);
      setShowForm(false); setEditId(null);
    } catch (e: any) { setError(e.response?.data?.message || 'Save failed'); }
  };

  const selectedMovieTitle = movies?.find(m => m.id === movieFilter)?.title;

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Showtimes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Schedule screenings per hall · <span className="font-semibold text-gray-700">{showtimes?.length ?? 0}</span> scheduled</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Movie filter */}
          <div className="relative">
            <select
              value={movieFilter}
              onChange={e => setMovieFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-white border border-gray-200 text-gray-700 text-xs rounded-xl focus:outline-none focus:border-[#00a8cc] focus:ring-2 focus:ring-[#00a8cc]/10 transition-all cursor-pointer">
              <option value="">All Movies</option>
              {movies?.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
          {movieFilter && (
            <button
              onClick={() => { if (confirm(`Delete ALL showtimes for "${selectedMovieTitle}"?`)) bulkDel.mutate(movieFilter); }}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl border border-rose-200 transition-colors">
              Bulk Delete
            </button>
          )}
          <button
            onClick={() => { setForm(BLANK); setEditId(null); setShowForm(true); setError(''); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#00a8cc] hover:bg-[#0096c7] text-white font-bold text-xs rounded-xl transition-all active:scale-95">
            <Plus className="w-3.5 h-3.5" /> Add Showtime
          </button>
        </div>
      </div>

      {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600">{error}</div>}

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(n => <div key={n} className="h-16 shimmer rounded-xl" />)}</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  {['Movie', 'Hall', 'Start Time', 'Prices', 'Bookings', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {showtimes?.map((s, i) => (
                  <tr key={s.id} className={`hover:bg-[#00a8cc]/5 transition-colors border-b border-gray-50 last:border-0 ${i % 2 === 1 ? 'bg-gray-50/30' : ''}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <img src={s.movie.posterUrl} alt={s.movie.title} className="w-6 h-9 rounded-lg object-cover border border-gray-200 shrink-0" />
                        <span className="font-bold text-gray-900 truncate max-w-[130px]">{s.movie.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg font-semibold">{s.hall.name}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap font-medium">{fmt(s.startsAt)}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-gray-900">NPR {s.basePrice}</span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-amber-600 font-semibold">{s.premiumPrice}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#00a8cc]/10 text-[#00a8cc] font-black">
                        {s._count?.bookings ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5 justify-end">
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors" title="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setConfirmDel(s.id)} className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!showtimes?.length && (
            <div className="py-16 text-center">
              <CalendarDays className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-400">No showtimes scheduled</p>
              <p className="text-xs text-gray-400 mt-1">Add your first showtime to get started</p>
            </div>
          )}
        </div>
      )}

      {/* Delete confirm */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Delete Showtime?</h3>
              <p className="text-xs text-gray-500 mt-1">Existing bookings for this showtime will be affected. This cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={async () => { await del.mutateAsync(confirmDel); setConfirmDel(null); }} disabled={del.isPending}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors">
                {del.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
              </button>
              <button onClick={() => setConfirmDel(null)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#00a8cc]/10 flex items-center justify-center">
                  <CalendarDays className="w-3.5 h-3.5 text-[#00a8cc]" />
                </div>
                {editId ? 'Edit' : 'Add'} Showtime
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600">{error}</div>}
              {!editId && (
                <>
                  <Lbl label="Movie *">
                    <select className={inputCls} value={form.movieId} onChange={e => set('movieId', e.target.value)}>
                      <option value="">Select a movie...</option>
                      {movies?.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                    </select>
                  </Lbl>
                  <Lbl label="Hall *">
                    <select className={inputCls} value={form.hallId} onChange={e => set('hallId', e.target.value)}>
                      <option value="">Select a hall...</option>
                      {halls?.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                  </Lbl>
                </>
              )}
              <Lbl label="Start Date & Time *">
                <input type="datetime-local" className={inputCls} value={form.startsAt} onChange={e => set('startsAt', e.target.value)} />
              </Lbl>
              <div className="grid grid-cols-2 gap-4">
                <Lbl label="Base Price (NPR)">
                  <input type="number" className={inputCls} value={form.basePrice} onChange={e => set('basePrice', Number(e.target.value))} />
                </Lbl>
                <Lbl label="Premium Price (NPR)">
                  <input type="number" className={inputCls} value={form.premiumPrice} onChange={e => set('premiumPrice', Number(e.target.value))} />
                </Lbl>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={submit} disabled={create.isPending || update.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#00a8cc] hover:bg-[#0096c7] text-white font-bold text-xs rounded-xl disabled:opacity-60 transition-colors">
                {(create.isPending || update.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editId ? 'Save Changes' : 'Create Showtime'}
              </button>
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
