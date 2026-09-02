import React, { useState } from 'react';
import { Plus, Trash2, Loader2, Check, MonitorPlay, Info, X } from 'lucide-react';
import {
  useAdminHalls, useAdminSeats,
  useBulkUpdateSeats, useAddSeatRow, useDeleteSeatRow,
} from '../../features/admin/useAdmin';

// ─── Seat type config ─────────────────────────────────────────────────────────
const TYPES = {
  STANDARD: { label: 'Standard', bg: 'bg-gray-100 dark:bg-gray-800',        border: 'border-gray-300 dark:border-gray-600',        text: 'text-gray-600 dark:text-gray-400',   selBg: 'bg-[#00a8cc]',   selBorder: 'border-[#00a8cc]',   selText: 'text-white',  dot: 'bg-[#00a8cc]' },
  PREMIUM:  { label: 'Premium',  bg: 'bg-amber-50 dark:bg-amber-900/40',         border: 'border-amber-300 dark:border-amber-800',        text: 'text-amber-700 dark:text-amber-300',  selBg: 'bg-amber-500',   selBorder: 'border-amber-400',   selText: 'text-white',  dot: 'bg-amber-400' },
  RECLINER: { label: 'Recliner', bg: 'bg-purple-50 dark:bg-purple-900/40',        border: 'border-purple-300 dark:border-purple-800',       text: 'text-purple-700 dark:text-purple-300', selBg: 'bg-purple-500',  selBorder: 'border-purple-400',  selText: 'text-white',  dot: 'bg-purple-400' },
} as const;

type SeatType = keyof typeof TYPES;

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
const ConfirmModal: React.FC<{
  row: string;
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}> = ({ row, count, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
    <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-rose-500/10 rounded-xl flex items-center justify-center shrink-0">
          <Trash2 className="w-4 h-4 text-rose-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Delete Row {row}?</h3>
          <p className="text-xs text-gray-600 mt-1 dark:text-gray-400">
            This will permanently remove <span className="text-gray-900 font-bold dark:text-gray-100">{count} seat{count !== 1 ? 's' : ''}</span> from this hall.
            Any existing bookings referencing these seats may be affected.
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Delete Row'}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-colors dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export const AdminSeatsPage: React.FC = () => {
  const { data: halls, isLoading: hallsLoading } = useAdminHalls();
  const [hallId, setHallId] = useState('');
  const { data, isLoading: seatsLoading, refetch } = useAdminSeats(hallId);

  const bulkMut = useBulkUpdateSeats();
  const addMut  = useAddSeatRow();
  const delMut  = useDeleteSeatRow();

  // Selection state
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkType, setBulkType] = useState<SeatType>('PREMIUM');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Add row state
  const [newRow, setNewRow]     = useState('');
  const [newCount, setNewCount] = useState(10);
  const [newType, setNewType]   = useState<SeatType>('STANDARD');
  const [addError, setAddError] = useState('');

  // Delete confirm
  const [delRow, setDelRow] = useState<{ row: string; count: number } | null>(null);

  const seats = data?.seats ?? [];
  const hall  = data?.hall;
  const rows  = Array.from(new Set(seats.map(s => s.row))).sort();

  const existingRows = new Set(rows);

  // Stats per type
  const stats = {
    STANDARD: seats.filter(s => s.type === 'STANDARD').length,
    PREMIUM:  seats.filter(s => s.type === 'PREMIUM').length,
    RECLINER: seats.filter(s => s.type === 'RECLINER').length,
  };

  // ── Selection helpers ──────────────────────────────────────────────────────
  const toggleSeat = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleRow = (row: string) => {
    const rowIds = seats.filter(s => s.row === row).map(s => s.id);
    const allSelected = rowIds.every(id => selected.has(id));
    setSelected(prev => {
      const next = new Set(prev);
      rowIds.forEach(id => allSelected ? next.delete(id) : next.add(id));
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(seats.map(s => s.id)));
  const clearAll  = () => setSelected(new Set());

  const selectByType = (type: SeatType) => {
    setSelected(new Set(seats.filter(s => s.type === type).map(s => s.id)));
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleApply = async () => {
    if (!selected.size || !hallId) return;
    setSaveState('saving');
    try {
      await bulkMut.mutateAsync({ hallId, seatIds: Array.from(selected), type: bulkType });
      clearAll();
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch {
      setSaveState('idle');
    }
  };

  const handleAddRow = async () => {
    setAddError('');
    const r = newRow.trim().toUpperCase();
    if (!r) { setAddError('Row letter is required.'); return; }
    if (!/^[A-Z]$/.test(r)) { setAddError('Row must be a single letter A–Z.'); return; }
    if (existingRows.has(r)) { setAddError(`Row ${r} already exists in this hall.`); return; }
    try {
      await addMut.mutateAsync({ hallId, row: r, count: newCount, type: newType });
      setNewRow('');
    } catch (e: any) {
      setAddError(e.response?.data?.message || 'Failed to add row.');
    }
  };

  const handleDeleteRow = async () => {
    if (!delRow) return;
    await delMut.mutateAsync({ hallId, row: delRow.row });
    setDelRow(null);
  };

  // ── Change hall ────────────────────────────────────────────────────────────
  const selectHall = (id: string) => {
    setHallId(id);
    clearAll();
    setAddError('');
    setSaveState('idle');
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (hallsLoading) return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header skeleton */}
      <div className="space-y-1.5">
        <div className="skeleton h-6 w-28 rounded" />
        <div className="skeleton h-3 w-64 rounded" />
      </div>
      {/* Hall picker buttons */}
      <div className="flex flex-wrap gap-2">
        {[1,2,3].map(n => (
          <div key={n} className="skeleton h-10 w-40 rounded-xl" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Seat Maps</h1>
        <p className="text-sm text-gray-500 mt-0.5 dark:text-gray-400">
          Click seats to select · Click row label to select entire row · Apply type change in bulk
        </p>
      </div>

      {/* Hall picker */}
      <div className="flex flex-wrap gap-2">
        {halls?.map(h => (
          <button
            key={h.id}
            onClick={() => selectHall(h.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              hallId === h.id
                ? 'bg-[#00a8cc] border-[#00a8cc] text-white'
                : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:border-gray-600'
            }`}
          >
            <MonitorPlay className={`w-3.5 h-3.5 shrink-0 ${hallId === h.id ? 'text-white' : 'text-gray-400'}`} />
            <span className="truncate">{h.name}</span>
            <span className={`text-[10px] font-semibold ${hallId === h.id ? 'text-white/80' : 'text-gray-400'}`}>
              {h._count?.seats ?? 0} seats
            </span>
          </button>
        ))}
      </div>

      {/* No hall selected */}
      {!hallId && (
        <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center dark:bg-gray-900 dark:border-gray-800">
          <MonitorPlay className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Select a hall above to edit its seat map</p>
        </div>
      )}

      {/* Loading seats */}
      {hallId && seatsLoading && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 dark:bg-gray-900 dark:border-gray-800 space-y-5">
          {/* Screen indicator */}
          <div className="max-w-2xl mx-auto text-center">
            <div className="mx-auto w-full max-w-3xl h-2 bg-[#00a8cc]/30 rounded-t-full" />
            <div className="skeleton h-2.5 w-12 mx-auto rounded mt-1.5 mb-6" />
          </div>
          {/* Seat grid */}
          <div className="flex flex-col items-center gap-2 min-w-max mx-auto">
            {['A','B','C','D','E','F'].map(r => (
              <div key={r} className="flex items-center gap-3 justify-center">
                <div className="skeleton w-6 h-6 rounded" />
                <div className="flex gap-1.5">
                  {Array.from({length: 10}).map((_, i) => (
                    <div key={i} className="w-7 h-7 skeleton rounded" />
                  ))}
                </div>
                <div className="skeleton w-6 h-6 rounded" />
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-5 pt-4 border-t border-gray-200 dark:border-gray-800">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="skeleton w-5 h-5 rounded" />
                <div className="skeleton h-2.5 w-16 rounded" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seat editor */}
      {hallId && !seatsLoading && (
        <div className="space-y-5">

          {/* Hall info strip */}
          {hall && (
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-600 bg-white border border-gray-200 rounded-xl px-4 py-3 items-center dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400">
              <Info className="w-3.5 h-3.5 text-[#00a8cc] shrink-0" />
              <span className="font-bold text-gray-900 dark:text-gray-100">{hall.name}</span>
              <span className="text-gray-400">·</span>
              <span>{hall.screenType}</span>
              <span className="text-gray-400">·</span>
              <span>{hall.soundSystem}</span>
              <span className="text-gray-400">·</span>
              <span>Capacity: <span className="text-gray-900 font-bold dark:text-gray-100">{hall.capacity}</span></span>
              <span className="flex flex-wrap gap-3 lg:ml-auto">
                {(Object.keys(TYPES) as SeatType[]).map(t => (
                  <button key={t} onClick={() => selectByType(t)}
                    className="flex items-center gap-1 hover:text-gray-900 transition-colors dark:hover:text-gray-100">
                    <span className={`w-2 h-2 rounded-full ${TYPES[t].dot}`} />
                    {TYPES[t].label}: <span className="text-gray-900 font-bold ml-0.5 dark:text-gray-100">{stats[t]}</span>
                  </button>
                ))}
              </span>
            </div>
          )}

          {/* Toolbar */}
          <div className={`bg-white border rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 transition-all dark:bg-gray-900 ${selected.size > 0 ? 'border-[#00a8cc]/40' : 'border-gray-200 dark:border-gray-800'}`}>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              <span className="font-black text-gray-900 dark:text-gray-100">{selected.size}</span> seat{selected.size !== 1 ? 's' : ''} selected
            </span>

            <div className="flex gap-1.5 ml-1">
              <button onClick={selectAll} className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 text-[11px] font-bold rounded transition-colors dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-gray-100">All</button>
              <button onClick={clearAll}  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 text-[11px] font-bold rounded transition-colors dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-gray-100">None</button>
            </div>

            {selected.size > 0 && (
              <>
                <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
                <span className="text-xs text-gray-500 font-semibold dark:text-gray-400">Change to:</span>
                <div className="flex gap-1.5">
                  {(Object.keys(TYPES) as SeatType[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setBulkType(t)}
                      className={`px-3 py-1 rounded text-[11px] font-bold border transition-all ${
                        bulkType === t
                          ? `${TYPES[t].selBg} ${TYPES[t].selBorder} ${TYPES[t].selText}`
                          : 'bg-gray-100 border-gray-300 text-gray-600 hover:text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-100'
                      }`}
                    >
                      {TYPES[t].label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleApply}
                  disabled={saveState === 'saving'}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-extrabold transition-all ml-1 ${
                    saveState === 'saved'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#00a8cc] hover:bg-[#0096c7] text-white active:scale-95 disabled:opacity-60'
                  }`}
                >
                  {saveState === 'saving' ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Check className="w-3.5 h-3.5" />}
                  {saveState === 'saved' ? 'Saved!' : 'Apply'}
                </button>
              </>
            )}
          </div>

          {/* Seat grid */}
          {seats.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl py-12 text-center dark:bg-gray-900 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">No seats yet. Add rows below.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 overflow-x-auto dark:bg-gray-900 dark:border-gray-800">
              {/* Screen indicator */}
              <div className="max-w-2xl mx-auto text-center">
                <div className="mx-auto w-full max-w-3xl h-2 bg-[#00a8cc] rounded-t-full opacity-70" />
                <p className="text-center text-[10px] font-semibold text-gray-400 uppercase tracking-[0.3em] mt-1.5 mb-6 dark:text-gray-500">Screen</p>
              </div>

              {/* Rows */}
              <div className="flex flex-col items-center gap-2 min-w-max mx-auto">
                {rows.map(row => {
                  const rowSeats = seats.filter(s => s.row === row).sort((a,b) => a.number - b.number);
                  const allRowSel = rowSeats.every(s => selected.has(s.id));
                  const someRowSel = rowSeats.some(s => selected.has(s.id));

                  return (
                    <div key={row} className="flex items-center gap-3 justify-center w-full">
                      {/* Row label */}
                      <button
                        onClick={() => toggleRow(row)}
                        title={`${allRowSel ? 'Deselect' : 'Select'} row ${row}`}
                        className={`w-6 h-6 rounded flex items-center justify-center text-[11px] font-black shrink-0 transition-all border ${
                          allRowSel
                            ? 'bg-[#00a8cc] border-[#00a8cc] text-white'
                            : someRowSel
                            ? 'bg-[#00a8cc]/20 border-[#00a8cc]/50 text-[#00a8cc]'
                            : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-400 dark:hover:text-gray-200'
                        }`}
                      >
                        {row}
                      </button>

                      {/* Seats */}
                      <div className="flex gap-1.5">
                        {rowSeats.map(seat => {
                          const isSel = selected.has(seat.id);
                          const cfg   = TYPES[seat.type as SeatType];
                          return (
                            <button
                              key={seat.id}
                              onClick={() => toggleSeat(seat.id)}
                              title={`${seat.row}${seat.number} · ${seat.type}`}
                              className={`w-7 h-7 rounded border text-[10px] font-bold transition-all flex items-center justify-center select-none ${
                                isSel
                                  ? `${cfg.selBg} ${cfg.selBorder} ${cfg.selText} scale-110 shadow-sm`
                                  : `${cfg.bg} ${cfg.border} ${cfg.text} hover:opacity-80`
                              }`}
                            >
                              {seat.number}
                            </button>
                          );
                        })}
                      </div>

                      {/* Delete row button */}
                      <button
                        onClick={() => setDelRow({ row, count: rowSeats.length })}
                        title={`Delete row ${row}`}
                        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors shrink-0 rounded hover:bg-rose-500/10 dark:hover:bg-rose-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-5 text-[11px] text-gray-600 pt-4 border-t border-gray-200 dark:text-gray-400 dark:border-gray-800">
                {(Object.keys(TYPES) as SeatType[]).map(t => (
                  <span key={t} className="flex items-center gap-1.5">
                    <span className={`w-5 h-5 rounded border ${TYPES[t].bg} ${TYPES[t].border} inline-block`} />
                    {TYPES[t].label} ({stats[t]})
                  </span>
                ))}
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-[#00a8cc] border border-[#00a8cc] inline-block" />
                  Selected
                </span>
              </div>
            </div>
          )}

          {/* Add row panel */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 dark:bg-gray-900 dark:border-gray-800">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 dark:text-gray-100">
              <Plus className="w-3.5 h-3.5 text-[#00a8cc]" /> Add New Row
            </h3>
            {addError && (
              <div className="flex items-center justify-between p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-500">
                <span>{addError}</span>
                <button onClick={() => setAddError('')}><X className="w-3.5 h-3.5" /></button>
              </div>
            )}
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide dark:text-gray-400">Row Letter</label>
                <input
                  value={newRow}
                  onChange={e => setNewRow(e.target.value)}
                  placeholder={rows.length > 0 ? String.fromCharCode(rows[rows.length - 1].charCodeAt(0) + 1) : 'A'}
                  maxLength={1}
                  className="w-14 bg-gray-50 border border-gray-300 focus:border-[#00a8cc] text-gray-900 text-sm font-black text-center rounded-lg px-3 py-2.5 focus:outline-none uppercase transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide dark:text-gray-400">Seat Count</label>
                <input
                  type="number"
                  value={newCount}
                  onChange={e => setNewCount(Math.max(1, Math.min(30, Number(e.target.value))))}
                  min={1} max={30}
                  className="w-20 bg-gray-50 border border-gray-300 focus:border-[#00a8cc] text-gray-900 text-xs rounded-lg px-3 py-2.5 focus:outline-none transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide dark:text-gray-400">Seat Type</label>
                <div className="flex gap-1.5">
                  {(Object.keys(TYPES) as SeatType[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setNewType(t)}
                      className={`px-3 py-2.5 rounded-lg border text-[11px] font-bold transition-all ${
                        newType === t
                          ? `${TYPES[t].selBg} ${TYPES[t].selBorder} ${TYPES[t].selText}`
                          : 'bg-gray-50 border-gray-300 text-gray-600 hover:text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-100'
                      }`}
                    >
                      {TYPES[t].label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleAddRow}
                disabled={!newRow.trim() || addMut.isPending}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#00a8cc] hover:bg-[#0096c7] disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all active:scale-95 w-full sm:w-auto"
              >
                {addMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Row
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {delRow && (
        <ConfirmModal
          row={delRow.row}
          count={delRow.count}
          onConfirm={handleDeleteRow}
          onCancel={() => setDelRow(null)}
          loading={delMut.isPending}
        />
      )}
    </div>
  );
};
