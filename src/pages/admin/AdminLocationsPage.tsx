import React, { useState } from 'react';
import {
  MapPin, Building2, Plus, Pencil, Trash2, X, Check,
  Loader2, ChevronDown, ChevronRight, Phone, Globe,
  ToggleLeft, ToggleRight, MonitorPlay,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  useAdminLocations, useCreateLocation, useUpdateLocation, useDeleteLocation,
  useAdminCinemas, useCreateCinema, useUpdateCinema, useDeleteCinema,
  useAssignHallToCinema, useAdminHalls,
  AdminLocation, AdminCinema,
} from '../../features/admin/useAdmin';

const inputCls = 'w-full bg-white border border-gray-200 focus:border-[#00a8cc] focus:ring-2 focus:ring-[#00a8cc]/10 text-gray-900 text-xs rounded-xl px-3 py-2.5 focus:outline-none transition-all';
const Lbl: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div><label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>{children}</div>
);

// ─── Delete confirm modal ─────────────────────────────────────────────────────
const DeleteModal: React.FC<{
  title: string; description: string; loading: boolean;
  onConfirm: () => void; onCancel: () => void;
}> = ({ title, description, loading, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
    <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-rose-500/10 rounded-xl flex items-center justify-center shrink-0">
          <Trash2 className="w-4 h-4 text-rose-500" />
        </div>
        <div><h3 className="text-sm font-bold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-600 mt-1">{description}</p></div>
      </div>
      <div className="flex gap-3">
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
        </button>
        <button onClick={onCancel} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-colors">Cancel</button>
      </div>
    </div>
  </div>
);

// ─── Location form modal ──────────────────────────────────────────────────────
const LocationForm: React.FC<{
  initial?: AdminLocation; onClose: () => void;
}> = ({ initial, onClose }) => {
  const createMut = useCreateLocation();
  const updateMut = useUpdateLocation();
  const [name, setName] = useState(initial?.name ?? '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!name.trim()) { setError('Name is required.'); return; }
    setError('');
    try {
      if (initial) await updateMut.mutateAsync({ id: initial.id, name, isActive });
      else await createMut.mutateAsync({ name, isActive });
      onClose();
    } catch (e: any) { setError(e.response?.data?.message || 'Save failed'); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#00a8cc]" />{initial ? 'Edit Location' : 'Add Location'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-500">{error}</div>}
          <Lbl label="City / Region Name *">
            <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Kathmandu, Pokhara" />
          </Lbl>
          <button onClick={() => setIsActive(v => !v)}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-semibold transition-colors ${isActive ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600' : 'bg-gray-50 border-gray-300 text-gray-600'}`}>
            {isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            {isActive ? 'Active — visible to customers' : 'Inactive — hidden from customers'}
          </button>
        </div>
        <div className="flex gap-3 px-5 py-4 border-t border-gray-200">
          <button onClick={submit} disabled={createMut.isPending || updateMut.isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#00a8cc] hover:bg-[#0096c7] text-white font-extrabold text-xs rounded-xl disabled:opacity-60 transition-all">
            {(createMut.isPending || updateMut.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {initial ? 'Save Changes' : 'Add Location'}
          </button>
          <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
};

// ─── Cinema form modal ────────────────────────────────────────────────────────
const CinemaForm: React.FC<{
  initial?: AdminCinema; locationId: string; locationName: string; onClose: () => void;
}> = ({ initial, locationId, locationName, onClose }) => {
  const createMut = useCreateCinema();
  const updateMut = useUpdateCinema();
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    address: initial?.address ?? '',
    phone: initial?.phone ?? '',
    mapUrl: initial?.mapUrl ?? '',
    isActive: initial?.isActive ?? true,
  });
  const [error, setError] = useState('');
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name.trim()) { setError('Cinema name is required.'); return; }
    setError('');
    try {
      if (initial) await updateMut.mutateAsync({ id: initial.id, ...form });
      else await createMut.mutateAsync({ ...form, locationId });
      onClose();
    } catch (e: any) { setError(e.response?.data?.message || 'Save failed'); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#00a8cc]" />
            {initial ? 'Edit Cinema' : `Add Cinema in ${locationName}`}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-3">
          {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-500">{error}</div>}
          <Lbl label="Cinema Name *">
            <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Civil Mall Cinemas" />
          </Lbl>
          <Lbl label="Address">
            <input className={inputCls} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full street address" />
          </Lbl>
          <div className="grid grid-cols-2 gap-3">
            <Lbl label="Phone">
              <input className={inputCls} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+977-1-..." />
            </Lbl>
            <Lbl label="Google Maps URL">
              <input className={inputCls} value={form.mapUrl} onChange={e => set('mapUrl', e.target.value)} placeholder="https://maps.google.com/..." />
            </Lbl>
          </div>
          <button onClick={() => set('isActive', !form.isActive)}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-semibold transition-colors ${form.isActive ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600' : 'bg-gray-50 border-gray-300 text-gray-600'}`}>
            {form.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            {form.isActive ? 'Active — visible to customers' : 'Inactive — hidden from customers'}
          </button>
        </div>
        <div className="flex gap-3 px-5 py-4 border-t border-gray-200">
          <button onClick={submit} disabled={createMut.isPending || updateMut.isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#00a8cc] hover:bg-[#0096c7] text-white font-extrabold text-xs rounded-xl disabled:opacity-60 transition-all">
            {(createMut.isPending || updateMut.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {initial ? 'Save Changes' : 'Add Cinema'}
          </button>
          <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export const AdminLocationsPage: React.FC = () => {
  const { data: locations, isLoading } = useAdminLocations();
  const { data: halls } = useAdminHalls();
  const delLocation = useDeleteLocation();
  const delCinema   = useDeleteCinema();
  const assignHall  = useAssignHallToCinema();
  const updateLoc   = useUpdateLocation();
  const updateCin   = useUpdateCinema();

  const [expandedLocs, setExpandedLocs] = useState<Set<string>>(new Set());
  const [locForm, setLocForm]           = useState<AdminLocation | null | 'new'>(null);
  const [cinForm, setCinForm]           = useState<{ cinema?: AdminCinema; locationId: string; locationName: string } | null>(null);
  const [confirmDel, setConfirmDel]     = useState<{ type: 'location' | 'cinema'; item: AdminLocation | AdminCinema } | null>(null);
  const [error, setError]               = useState('');

  const toggleExpand = (id: string) =>
    setExpandedLocs(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleDelete = async () => {
    if (!confirmDel) return;
    setError('');
    try {
      if (confirmDel.type === 'location') await delLocation.mutateAsync((confirmDel.item as AdminLocation).id);
      else await delCinema.mutateAsync((confirmDel.item as AdminCinema).id);
      setConfirmDel(null);
    } catch (e: any) { setError(e.response?.data?.message || 'Delete failed'); setConfirmDel(null); }
  };

  const toggleLocationActive = async (loc: AdminLocation) => {
    await updateLoc.mutateAsync({ id: loc.id, isActive: !loc.isActive });
  };

  const toggleCinemaActive = async (cin: AdminCinema) => {
    await updateCin.mutateAsync({ id: cin.id, isActive: !cin.isActive });
  };

  const unassignedHalls = halls?.filter(h => !(h as any).cinemaId) ?? [];

  if (isLoading) return (
    <div className="space-y-4 max-w-4xl">
      <div className="h-8 shimmer rounded-lg w-48" />
      {[1,2,3].map(n => <div key={n} className="h-24 shimmer rounded-xl" />)}
    </div>
  );

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Locations & Cinemas</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage cities · <span className="font-semibold text-gray-700">{locations?.length ?? 0}</span> locations ·{' '}
            <span className="font-semibold text-gray-700">{locations?.reduce((s,l) => s + (l._count?.cinemas ?? 0), 0) ?? 0}</span> cinemas
          </p>
        </div>
        <button onClick={() => setLocForm('new')}
          className="flex items-center gap-2 px-4 py-2 bg-[#00a8cc] hover:bg-[#0096c7] text-white font-bold text-xs rounded-xl transition-all active:scale-95">
          <Plus className="w-3.5 h-3.5" /> Add Location
        </button>
      </div>

      {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-500">{error}</div>}

      {/* Unassigned halls banner */}
      {unassignedHalls.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-xs">
          <MonitorPlay className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-600">{unassignedHalls.length} hall{unassignedHalls.length !== 1 ? 's' : ''} not assigned to any cinema</p>
            <p className="text-gray-600 mt-0.5">
              {unassignedHalls.map(h => h.name).join(', ')} — expand a cinema below to assign them.
            </p>
          </div>
        </div>
      )}

      {/* Locations list */}
      <div className="space-y-3">
        {locations?.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl py-14 text-center">
            <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-600">No locations yet</p>
            <p className="text-xs text-gray-500 mt-1">Add your first city to get started</p>
          </div>
        )}

        {locations?.map(loc => {
          const expanded = expandedLocs.has(loc.id);
          return (
            <div key={loc.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Location header */}
              <div className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(loc.id)}>
                <div className={`w-2 h-2 rounded-full shrink-0 ${loc.isActive ? 'bg-emerald-400' : 'bg-gray-300'}`} />
                <MapPin className="w-4 h-4 text-[#00a8cc] shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-gray-900">{loc.name}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    {loc._count?.cinemas ?? 0} cinema{(loc._count?.cinemas ?? 0) !== 1 ? 's' : ''}
                    {!loc.isActive && <span className="ml-2 text-amber-500 font-bold">· Inactive</span>}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                  {/* Add cinema */}
                  <button onClick={() => setCinForm({ locationId: loc.id, locationName: loc.name })}
                    title="Add cinema" className="p-1.5 rounded-lg bg-[#00a8cc]/10 hover:bg-[#00a8cc]/20 text-[#00a8cc] transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  {/* Toggle active */}
                  <button onClick={() => toggleLocationActive(loc)} title={loc.isActive ? 'Deactivate' : 'Activate'}
                    className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                    {loc.isActive ? <ToggleRight className="w-3.5 h-3.5 text-emerald-500" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                  </button>
                  {/* Edit */}
                  <button onClick={() => setLocForm(loc)} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  {/* Delete */}
                  <button onClick={() => setConfirmDel({ type: 'location', item: loc })}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {expanded ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
              </div>

              {/* Cinemas list */}
              {expanded && (
                <div className="border-t border-gray-200 divide-y divide-gray-100">
                  {loc.cinemas?.length === 0 && (
                    <div className="px-8 py-6 text-xs text-gray-500 text-center">
                      No cinemas in {loc.name} yet.{' '}
                      <button onClick={() => setCinForm({ locationId: loc.id, locationName: loc.name })} className="text-[#00a8cc] hover:underline font-bold">Add one</button>
                    </div>
                  )}
                  {loc.cinemas?.map(cin => (
                    <div key={cin.id} className="px-6 py-3.5 bg-gray-50/60">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${cin.isActive ? 'bg-emerald-400' : 'bg-gray-300'}`} />
                          <Building2 className="w-4 h-4 text-[#00a8cc] shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{cin.name}
                              {!cin.isActive && <span className="ml-2 text-[10px] text-amber-500 font-bold">Inactive</span>}
                            </p>
                            {cin.address && <p className="text-[11px] text-gray-500 truncate mt-0.5">{cin.address}</p>}
                            <div className="flex flex-wrap gap-3 mt-1.5 text-[11px] text-gray-500">
                              {cin.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{cin.phone}</span>}
                              {cin.mapUrl && <a href={cin.mapUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#00a8cc] hover:underline"><Globe className="w-3 h-3" />Map</a>}
                              <span className="flex items-center gap-1"><MonitorPlay className="w-3 h-3" />{cin._count?.halls ?? 0} hall{(cin._count?.halls ?? 0) !== 1 ? 's' : ''}</span>
                            </div>
                            {/* Halls assigned to this cinema */}
                            {(cin as any).halls?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {(cin as any).halls.map((h: any) => (
                                  <Link key={h.id} to="/admin/halls"
                                    className="px-2 py-0.5 bg-[#00a8cc]/10 text-[#00a8cc] rounded text-[10px] font-bold hover:bg-[#00a8cc]/20 transition-colors">
                                    {h.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                            {/* Assign unassigned halls */}
                            {unassignedHalls.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {unassignedHalls.map(h => (
                                  <button key={h.id} onClick={() => assignHall.mutate({ hallId: h.id, cinemaId: cin.id })}
                                    title={`Assign "${h.name}" to this cinema`}
                                    className="px-2 py-0.5 bg-white border border-dashed border-gray-300 hover:border-[#00a8cc] text-gray-500 hover:text-[#00a8cc] rounded text-[10px] font-bold transition-colors">
                                    + {h.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button onClick={() => updateCin.mutateAsync({ id: cin.id, isActive: !cin.isActive })} title={cin.isActive ? 'Deactivate' : 'Activate'}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                            {cin.isActive ? <ToggleRight className="w-3.5 h-3.5 text-emerald-500" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => setCinForm({ cinema: cin, locationId: loc.id, locationName: loc.name })}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setConfirmDel({ type: 'cinema', item: cin })}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {locForm && (
        <LocationForm
          initial={locForm === 'new' ? undefined : locForm}
          onClose={() => setLocForm(null)}
        />
      )}
      {cinForm && (
        <CinemaForm
          initial={cinForm.cinema}
          locationId={cinForm.locationId}
          locationName={cinForm.locationName}
          onClose={() => setCinForm(null)}
        />
      )}
      {confirmDel && (
        <DeleteModal
          title={`Delete ${confirmDel.type === 'location' ? 'Location' : 'Cinema'}?`}
          description={
            confirmDel.type === 'location'
              ? `"${(confirmDel.item as AdminLocation).name}" and all its cinemas will be permanently removed.`
              : `"${(confirmDel.item as AdminCinema).name}" will be removed. Halls assigned to it will become unassigned.`
          }
          loading={delLocation.isPending || delCinema.isPending}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </div>
  );
};
