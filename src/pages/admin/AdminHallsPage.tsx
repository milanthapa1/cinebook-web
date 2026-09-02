import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, MonitorPlay, Loader2, Grid3X3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminHalls, useCreateHall, useUpdateHall, useDeleteHall, AdminHall } from '../../features/admin/useAdmin';

const inputCls = 'w-full bg-white border border-gray-200 focus:border-[#00a8cc] focus:ring-2 focus:ring-[#00a8cc]/10 text-gray-900 text-xs rounded-xl px-3 py-2.5 focus:outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500';
const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div>
    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 dark:text-gray-400">{label}</label>
    {children}
    {hint && <p className="text-[10px] text-gray-400 mt-1 dark:text-gray-500">{hint}</p>}
  </div>
);

const BLANK = { name: '', capacity: 60, screenType: '', soundSystem: '', rows: 'A,B,C,D,E,F', seatsPerRow: 10 };

export const AdminHallsPage: React.FC = () => {
  const { data: halls, isLoading } = useAdminHalls();
  const createMut = useCreateHall();
  const updateMut = useUpdateHall();
  const deleteMut = useDeleteHall();

  const [showForm, setShowForm]       = useState(false);
  const [editId, setEditId]           = useState<string | null>(null);
  const [form, setForm]               = useState(BLANK);
  const [confirmDelete, setConfirm]   = useState<AdminHall | null>(null);
  const [error, setError]             = useState('');

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const openCreate = () => { setForm(BLANK); setEditId(null); setError(''); setShowForm(true); };
  const openEdit = (h: AdminHall) => {
    setForm({ name: h.name, capacity: h.capacity, screenType: h.screenType, soundSystem: h.soundSystem, rows: 'A,B,C,D,E,F', seatsPerRow: 10 });
    setEditId(h.id); setError(''); setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.screenType || !form.soundSystem) { setError('Name, screen type, and sound system are required.'); return; }
    setError('');
    try {
      if (editId) {
        await updateMut.mutateAsync({ id: editId, name: form.name, capacity: form.capacity, screenType: form.screenType, soundSystem: form.soundSystem });
      } else {
        await createMut.mutateAsync({
          name: form.name, capacity: form.capacity,
          screenType: form.screenType, soundSystem: form.soundSystem,
          rows: form.rows.split(',').map(r => r.trim().toUpperCase()).filter(Boolean),
          seatsPerRow: form.seatsPerRow,
        } as any);
      }
      setShowForm(false);
    } catch (e: any) { setError(e.response?.data?.message || 'Save failed'); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try { await deleteMut.mutateAsync(confirmDelete.id); setConfirm(null); }
    catch (e: any) { setError(e.response?.data?.message || 'Delete failed'); }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Halls</h1>
          <p className="text-sm text-gray-500 mt-0.5 dark:text-gray-400">Cinema auditoriums · <span className="font-semibold text-gray-700 dark:text-gray-300">{halls?.length ?? 0}</span> total</p>
        </div>
        <button onClick={openCreate} className="flex items-center justify-center gap-2 px-4 py-2 bg-[#00a8cc] hover:bg-[#0096c7] text-white font-bold text-xs rounded-xl transition-all active:scale-95 shrink-0 w-full sm:w-auto">
          <Plus className="w-3.5 h-3.5" /> Add Hall
        </button>
      </div>

      {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-500">{error}</div>}

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm dark:bg-gray-900 dark:border-gray-800">
          {/* Table header */}
          <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
            <div className="flex items-center px-5 py-3.5">
              {['Hall', 'Screen Type', 'Sound System', 'Seats / Shows', 'Actions'].map(h => (
                <div key={h} className={`flex-1 ${h === 'Actions' ? 'text-right' : ''}`}>
                  <div className="skeleton h-2.5 w-16 rounded" />
                </div>
              ))}
            </div>
          </div>
          {/* Table rows */}
          {Array.from({ length: 3 }).map((_, n) => (
            <div key={n} className="flex items-center px-5 py-4 border-b border-gray-50 dark:border-gray-800 last:border-0">
              <div className="flex-1 flex items-center gap-3">
                <div className="skeleton w-9 h-9 rounded-xl shrink-0" />
                <div className="space-y-1">
                  <div className="skeleton h-2.5 w-24 rounded" />
                  <div className="skeleton h-2 w-20 rounded" />
                </div>
              </div>
              <div className="flex-1"><div className="skeleton h-5 w-24 rounded-lg" /></div>
              <div className="flex-1"><div className="skeleton h-5 w-28 rounded-lg" /></div>
              <div className="flex-1 flex items-center gap-2">
                <div className="skeleton h-3 w-6 rounded" />
                <div className="skeleton h-2 w-8 rounded" />
                <div className="skeleton h-3 w-6 rounded" />
                <div className="skeleton h-2 w-8 rounded" />
              </div>
              <div className="flex-1 flex items-center justify-end gap-1.5">
                <div className="skeleton w-7 h-7 rounded-lg" />
                <div className="skeleton w-7 h-7 rounded-lg" />
                <div className="skeleton w-7 h-7 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : halls?.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl py-14 text-center dark:bg-gray-900 dark:border-gray-800">
          <MonitorPlay className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">No halls yet</p>
          <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Add your first auditorium to get started</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-800/50">
                {['Hall','Screen Type','Sound System','Seats / Shows','Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400 last:text-right">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {halls?.map((h, i) => (
                <tr key={h.id} className={`hover:bg-[#00a8cc]/5 transition-colors border-b border-gray-50 last:border-0 dark:border-gray-800 ${i % 2 === 1 ? 'bg-gray-50/30 dark:bg-gray-800/30' : ''}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#00a8cc]/10 flex items-center justify-center shrink-0">
                        <MonitorPlay className="w-4 h-4 text-[#00a8cc]" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-gray-100">{h.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 dark:text-gray-500">{h.capacity}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-semibold rounded-lg dark:bg-gray-800 dark:text-gray-400">{h.screenType}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-semibold rounded-lg dark:bg-gray-800 dark:text-gray-400">{h.soundSystem}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-black text-gray-900 dark:text-gray-100">{h._count?.seats ?? 0}</span>
                      <span className="text-gray-400 dark:text-gray-500">seats</span>
                      <span className="text-gray-300 dark:text-gray-600">·</span>
                      <span className="font-black text-gray-900 dark:text-gray-100">{h._count?.showtimes ?? 0}</span>
                      <span className="text-gray-400 dark:text-gray-500">shows</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link to="/admin/seats" title="Edit seat map"
                        className="p-1.5 rounded-lg bg-[#00a8cc]/10 hover:bg-[#00a8cc]/20 text-[#00a8cc] transition-colors">
                        <Grid3X3 className="w-3.5 h-3.5" />
                      </Link>
                      <button onClick={() => openEdit(h)} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setConfirm(h)} className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 transition-colors dark:bg-rose-900/40 dark:hover:bg-rose-900/60 dark:text-rose-300">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-rose-500/10 rounded-xl flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4 text-rose-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Delete "{confirmDelete.name}"?</h3>
                <p className="text-xs text-gray-600 mt-1 dark:text-gray-400">
                  This will permanently remove this hall along with{' '}
                  <span className="text-gray-900 font-bold dark:text-gray-100">{confirmDelete._count?.seats ?? 0} seats</span> and{' '}
                  <span className="text-gray-900 font-bold dark:text-gray-100">{confirmDelete._count?.showtimes ?? 0} showtimes</span>.
                  This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={deleteMut.isPending}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors">
                {deleteMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Delete Hall'}
              </button>
              <button onClick={() => setConfirm(null)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-colors dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md shadow-2xl dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 dark:text-gray-100">
                <MonitorPlay className="w-4 h-4 text-[#00a8cc]" />
                {editId ? 'Edit Hall' : 'Add New Hall'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 dark:hover:bg-gray-800 dark:text-gray-400"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-6 space-y-4">
      {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-500 dark:bg-rose-900/40 dark:border-rose-800 dark:text-rose-300">{error}</div>}

              <Field label="Hall Name *">
                <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Audi 1 (IMAX Laser)" />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Capacity">
                  <input type="number" className={inputCls} value={form.capacity} onChange={e => set('capacity', Number(e.target.value))} min={1} />
                </Field>
                {!editId && (
                  <Field label="Seats per Row">
                    <input type="number" className={inputCls} value={form.seatsPerRow} onChange={e => set('seatsPerRow', Number(e.target.value))} min={1} max={30} />
                  </Field>
                )}
              </div>

              <Field label="Screen Type *">
                <input className={inputCls} value={form.screenType} onChange={e => set('screenType', e.target.value)} placeholder="e.g. 4K Dual Laser 3D" />
              </Field>

              <Field label="Sound System *">
                <input className={inputCls} value={form.soundSystem} onChange={e => set('soundSystem', e.target.value)} placeholder="e.g. Dolby Atmos 12.1" />
              </Field>

              {!editId && (
                <Field label="Rows (comma-separated)" hint="e.g. A,B,C,D,E,F - rows are auto-populated with seats">
                  <input className={inputCls} value={form.rows} onChange={e => set('rows', e.target.value)} placeholder="A,B,C,D,E,F" />
                </Field>
              )}

              {editId && (
                <div className="p-3 bg-[#00a8cc]/5 border border-[#00a8cc]/20 rounded-lg text-[11px] text-gray-600 flex items-start gap-2 dark:text-gray-400">
                  <Grid3X3 className="w-3.5 h-3.5 text-[#00a8cc] shrink-0 mt-0.5" />
                  To edit individual seats, use the <Link to="/admin/seats" className="text-[#00a8cc] font-bold hover:underline ml-0.5" onClick={() => setShowForm(false)}>Seat Maps</Link> page.
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
              <button onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#00a8cc] hover:bg-[#0096c7] text-white font-extrabold text-xs rounded-xl transition-all disabled:opacity-60">
                {(createMut.isPending || updateMut.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editId ? 'Save Changes' : 'Create Hall'}
              </button>
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-colors dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
