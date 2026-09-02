import React, { useState, useRef, useEffect } from 'react';
import {
  Search, ChevronLeft, ChevronRight, Shield, Loader2, Users,
  MoreVertical, Eye, Trash2, ShieldOff, ShieldCheck, Ban,
  X, Pencil, Ticket, AlertTriangle, CheckCircle, Clock,
} from 'lucide-react';
import {
  useAdminUsers, useAdminUser, useAdminUserBookings,
  useUpdateUserRole, useUpdateUserStatus, useUpdateUserProfile, useDeleteUser,
  AdminUser, AdminUserBooking,
} from '../../features/admin/useAdmin';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt     = (d: string) => new Date(d).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
const fmtTime = (d: string) => new Date(d).toLocaleString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:    'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  SUSPENDED: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  BANNED:    'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800',
};

const BOOKING_STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  PENDING:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  CANCELLED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  EXPIRED:   'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar: React.FC<{ user: Pick<AdminUser, 'name' | 'avatarUrl'>; size?: 'sm' | 'md' | 'lg' }> = ({ user, size = 'sm' }) => {
  const cls = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' }[size];
  return user.avatarUrl
    ? <img src={user.avatarUrl} alt={user.name} className={`${cls} rounded-full object-cover border border-gray-200 shrink-0 dark:border-gray-700`} />
    : <div className={`${cls} rounded-full bg-[#00a8cc] flex items-center justify-center text-white font-bold shrink-0`}>
        {user.name.charAt(0).toUpperCase()}
      </div>;
};

// ─── Action Menu ──────────────────────────────────────────────────────────────
const ActionMenu: React.FC<{
  user: AdminUser;
  onView: () => void;
  onDelete: () => void;
}> = ({ user, onView, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const statusMut = useUpdateUserStatus();
  const roleMut   = useUpdateUserRole();

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      // If less than 220px below the button to the bottom of the viewport, open upward
      setOpenUpward(window.innerHeight - rect.bottom < 220);
    }
    setOpen(o => !o);
  };

  const setStatus = (status: 'ACTIVE' | 'SUSPENDED' | 'BANNED') => {
    statusMut.mutate({ id: user.id, status });
    setOpen(false);
  };
  const toggleRole = () => {
    roleMut.mutate({ id: user.id, role: user.role === 'ADMIN' ? 'USER' : 'ADMIN' });
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button ref={btnRef} onClick={handleToggle}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className={`absolute right-0 z-50 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-1 text-xs ${openUpward ? 'bottom-8' : 'top-8'}`}>
          <button onClick={() => { onView(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
            <Eye className="w-3.5 h-3.5 text-[#00a8cc]" /> View Details
          </button>
          <button onClick={toggleRole}
            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
            {user.role === 'ADMIN'
              ? <><ShieldOff className="w-3.5 h-3.5 text-gray-400" /> Remove Admin</>
              : <><ShieldCheck className="w-3.5 h-3.5 text-[#00a8cc]" /> Make Admin</>}
          </button>
          <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
          {user.status !== 'ACTIVE' && (
            <button onClick={() => setStatus('ACTIVE')}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" /> Activate
            </button>
          )}
          {user.status !== 'SUSPENDED' && (
            <button onClick={() => setStatus('SUSPENDED')}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-amber-600 dark:text-amber-400">
              <Clock className="w-3.5 h-3.5" /> Suspend
            </button>
          )}
          {user.status !== 'BANNED' && (
            <button onClick={() => setStatus('BANNED')}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-rose-600 dark:text-rose-400">
              <Ban className="w-3.5 h-3.5" /> Ban
            </button>
          )}
          <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
          <button onClick={() => { onDelete(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400">
            <Trash2 className="w-3.5 h-3.5" /> Delete User
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Booking History Tab ──────────────────────────────────────────────────────
const BookingsTab: React.FC<{ userId: string }> = ({ userId }) => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminUserBookings(userId, page);

  if (isLoading) return (
    <div className="space-y-2 p-1">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="skeleton h-16 rounded-xl" />
      ))}
    </div>
  );

  if (!data?.bookings?.length) return (
    <div className="py-10 text-center">
      <Ticket className="w-8 h-8 text-gray-300 mx-auto mb-2" />
      <p className="text-sm text-gray-400">No bookings yet</p>
    </div>
  );

  return (
    <div className="space-y-2">
      {data.bookings.map((b: AdminUserBooking) => (
        <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          <img src={b.showtime.movie.posterUrl} alt={b.showtime.movie.title}
            className="w-10 h-14 object-cover rounded-lg shrink-0 border border-gray-200 dark:border-gray-700" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-xs truncate">{b.showtime.movie.title}</p>
            <p className="text-gray-400 text-[10px] mt-0.5">{fmtTime(b.showtime.startsAt)} · {b.showtime.hall.name}</p>
            <p className="text-gray-400 text-[10px]">{b.seats.length} seat{b.seats.length !== 1 ? 's' : ''} · Rs. {Number(b.totalAmount).toLocaleString()}</p>
          </div>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold shrink-0 ${BOOKING_STATUS_STYLES[b.status] ?? ''}`}>
            {b.status}
          </span>
        </div>
      ))}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
          <span>Page {data.page} of {data.totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Edit Profile Tab ─────────────────────────────────────────────────────────
const EditProfileTab: React.FC<{ user: AdminUser; onSaved: () => void }> = ({ user, onSaved }) => {
  const updateMut = useUpdateUserProfile();
  const [form, setForm] = useState({
    name:   user.name,
    phone:  user.phone  ?? '',
    dob:    user.dob    ?? '',
    gender: user.gender ?? '',
  });
  const [saved, setSaved] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMut.mutateAsync({
      id:     user.id,
      name:   form.name   || undefined,
      phone:  form.phone  || null,
      dob:    form.dob    || null,
      gender: form.gender || null,
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); onSaved(); }, 1200);
  };

  const inputCls = 'w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#00a8cc] focus:ring-2 focus:ring-[#00a8cc]/10 transition-all';

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Name</label>
        <input value={form.name} onChange={set('name')} required className={inputCls} />
      </div>
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Phone</label>
        <input value={form.phone} onChange={set('phone')} placeholder="Optional" className={inputCls} />
      </div>
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Date of Birth</label>
        <input value={form.dob} onChange={set('dob')} placeholder="e.g. 1995-08-20" className={inputCls} />
      </div>
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Gender</label>
        <select value={form.gender} onChange={set('gender')} className={inputCls}>
          <option value="">Not specified</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <button type="submit" disabled={updateMut.isPending}
        className="w-full py-2.5 rounded-xl bg-[#00a8cc] hover:bg-[#0096c7] text-white font-bold text-xs transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
        {updateMut.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCircle className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
        {updateMut.isPending ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
      </button>
    </form>
  );
};

// ─── User Detail Drawer ───────────────────────────────────────────────────────
const UserDrawer: React.FC<{ userId: string; onClose: () => void }> = ({ userId, onClose }) => {
  const [tab, setTab] = useState<'info' | 'bookings' | 'edit'>('info');
  const { data: user, isLoading } = useAdminUser(userId);
  const statusMut = useUpdateUserStatus();
  const roleMut   = useUpdateUserRole();

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full z-50 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">User Details</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isLoading || !user ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#00a8cc]" />
          </div>
        ) : (
          <>
            {/* Profile hero */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-3">
                <Avatar user={user} size="lg" />
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${STATUS_STYLES[user.status]}`}>
                      {user.status}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                      user.role === 'ADMIN'
                        ? 'bg-[#00a8cc]/10 text-[#00a8cc] border-[#00a8cc]/20'
                        : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                    }`}>
                      <Shield className="w-2.5 h-2.5" /> {user.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex gap-2 mt-3 flex-wrap">
                {user.status !== 'ACTIVE' && (
                  <button onClick={() => statusMut.mutate({ id: user.id, status: 'ACTIVE' })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 transition-colors">
                    <CheckCircle className="w-3 h-3" /> Activate
                  </button>
                )}
                {user.status !== 'SUSPENDED' && (
                  <button onClick={() => statusMut.mutate({ id: user.id, status: 'SUSPENDED' })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 transition-colors">
                    <Clock className="w-3 h-3" /> Suspend
                  </button>
                )}
                {user.status !== 'BANNED' && (
                  <button onClick={() => statusMut.mutate({ id: user.id, status: 'BANNED' })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400 transition-colors">
                    <Ban className="w-3 h-3" /> Ban
                  </button>
                )}
                <button onClick={() => roleMut.mutate({ id: user.id, role: user.role === 'ADMIN' ? 'USER' : 'ADMIN' })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#00a8cc]/10 text-[#00a8cc] hover:bg-[#00a8cc]/20 transition-colors">
                  <Shield className="w-3 h-3" /> {user.role === 'ADMIN' ? 'Remove Admin' : 'Make Admin'}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-800 shrink-0">
              {(['info', 'bookings', 'edit'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 text-[11px] font-bold capitalize transition-colors ${
                    tab === t
                      ? 'text-[#00a8cc] border-b-2 border-[#00a8cc]'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}>
                  {t === 'info' ? 'Profile' : t === 'bookings' ? `Bookings (${user._count?.bookings ?? 0})` : 'Edit'}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {tab === 'info' && (
                <dl className="space-y-3 text-xs">
                  {[
                    { label: 'Full Name',  value: user.name },
                    { label: 'Email',      value: user.email },
                    { label: 'Phone',      value: user.phone   || '—' },
                    { label: 'Date of Birth', value: user.dob  || '—' },
                    { label: 'Gender',     value: user.gender  || '—' },
                    { label: 'Joined',     value: fmt(user.createdAt) },
                    { label: 'Updated',    value: fmt(user.updatedAt) },
                    { label: 'Total Bookings', value: String(user._count?.bookings ?? 0) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-4 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                      <dt className="text-gray-400 font-medium shrink-0">{label}</dt>
                      <dd className="text-gray-900 dark:text-gray-100 font-semibold text-right">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {tab === 'bookings' && <BookingsTab userId={user.id} />}
              {tab === 'edit' && <EditProfileTab user={user} onSaved={() => setTab('info')} />}
            </div>
          </>
        )}
      </div>
    </>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteModal: React.FC<{ user: AdminUser; onConfirm: () => void; onCancel: () => void; isPending: boolean }> = ({
  user, onConfirm, onCancel, isPending,
}) => (
  <>
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 max-w-sm w-full p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Delete User</h3>
            <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          You are about to permanently delete <span className="font-bold text-gray-900 dark:text-gray-100">{user.name}</span> ({user.email}).
          All their pending and confirmed bookings will be cancelled.
        </p>
        <div className="flex gap-2 pt-1">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isPending}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            {isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  </>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export const AdminUsersPage: React.FC = () => {
  const [page, setPage]         = useState(1);
  const [input, setInput]       = useState('');
  const [search, setSearch]     = useState('');
  const [roleFilter, setRole]   = useState('');
  const [statusFilter, setStatus] = useState('');
  const [drawerUserId, setDrawerUserId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const { data, isLoading } = useAdminUsers(page, search || undefined, roleFilter || undefined, statusFilter || undefined);
  const deleteMut = useDeleteUser();

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearch(input); setPage(1); };
  const handleFilter = (key: 'role' | 'status', val: string) => {
    key === 'role' ? setRole(val) : setStatus(val);
    setPage(1);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteMut.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
    if (drawerUserId === deleteTarget.id) setDrawerUserId(null);
  };

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5 dark:text-gray-400">
            Manage accounts, roles &amp; access ·{' '}
            <span className="font-semibold text-gray-700 dark:text-gray-300">{data?.total ?? 0}</span> total
          </p>
        </div>
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input value={input} onChange={e => setInput(e.target.value)}
              placeholder="Search name or email..."
              className="pl-9 pr-3 py-2 bg-white border border-gray-200 focus:border-[#00a8cc] focus:ring-2 focus:ring-[#00a8cc]/10 text-gray-900 text-xs rounded-xl focus:outline-none w-52 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500" />
          </div>
          <button type="submit" className="px-4 py-2 bg-[#00a8cc] hover:bg-[#0096c7] text-white font-semibold text-xs rounded-xl transition-colors">
            Search
          </button>
        </form>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">

          {/* Role group */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 shrink-0">Role</span>
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-0.5 gap-0.5">
              {([
                { value: '',      label: 'All'   },
                { value: 'USER',  label: 'User'  },
                { value: 'ADMIN', label: 'Admin' },
              ] as const).map(({ value, label }) => (
                <button
                  key={value || 'all-roles'}
                  onClick={() => handleFilter('role', value)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    roleFilter === value
                      ? 'bg-white dark:bg-gray-700 text-[#00a8cc] shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-5 bg-gray-200 dark:bg-gray-700" />

          {/* Status group */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 shrink-0">Status</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {([
                { value: '',          label: 'All',       active: 'bg-gray-700 text-white',                               inactive: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700' },
                { value: 'ACTIVE',    label: 'Active',    active: 'bg-emerald-500 text-white',                            inactive: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40' },
                { value: 'SUSPENDED', label: 'Suspended', active: 'bg-amber-500 text-white',                              inactive: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40' },
                { value: 'BANNED',    label: 'Banned',    active: 'bg-rose-500 text-white',                               inactive: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40' },
              ] as const).map(({ value, label, active, inactive }) => (
                <button
                  key={value || 'all-status'}
                  onClick={() => handleFilter('status', value)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${statusFilter === value ? active : inactive}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear — only when something is active */}
          {(search || roleFilter || statusFilter) && (
            <button
              onClick={() => { setSearch(''); setInput(''); setRole(''); setStatus(''); setPage(1); }}
              className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}

        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-visible shadow-sm dark:bg-gray-900 dark:border-gray-800">
        {isLoading ? (
          <>
            <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50 px-5 py-3.5 flex gap-4">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-2.5 w-16 rounded flex-1" />)}
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
                <div className="skeleton w-8 h-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5"><div className="skeleton h-2.5 w-28 rounded" /><div className="skeleton h-2 w-36 rounded" /></div>
                <div className="skeleton h-5 w-16 rounded-lg hidden sm:block" />
                <div className="skeleton h-5 w-14 rounded-lg hidden sm:block" />
                <div className="skeleton h-5 w-12 rounded-lg" />
                <div className="skeleton w-6 h-6 rounded-lg" />
              </div>
            ))}
          </>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-800/50">
                {['User', 'Phone', 'Joined', 'Bookings', 'Status', 'Role', ''].map((h, i) => (
                  <th key={i} className={`text-left px-5 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400 ${
                    h === 'Phone' || h === 'Joined' ? 'hidden sm:table-cell' : ''
                  } ${h === '' ? 'w-10' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.users?.map((u, i) => (
                <tr key={u.id} className={`hover:bg-[#00a8cc]/5 transition-colors border-b border-gray-50 last:border-0 dark:border-gray-800 ${i % 2 === 1 ? 'bg-gray-50/30 dark:bg-gray-800/20' : ''}`}>
                  {/* User */}
                  <td className="px-5 py-3">
                    <button onClick={() => setDrawerUserId(u.id)} className="flex items-center gap-3 group text-left">
                      <Avatar user={u} size="sm" />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-[#00a8cc] transition-colors">{u.name}</p>
                        <p className="text-gray-400 mt-0.5 dark:text-gray-500">{u.email}</p>
                      </div>
                    </button>
                  </td>
                  {/* Phone */}
                  <td className="px-5 py-3 text-gray-500 hidden sm:table-cell dark:text-gray-400">{u.phone || '—'}</td>
                  {/* Joined */}
                  <td className="px-5 py-3 text-gray-500 hidden sm:table-cell dark:text-gray-400">{fmt(u.createdAt)}</td>
                  {/* Bookings */}
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#00a8cc]/10 text-[#00a8cc] font-black text-xs">
                      {u._count?.bookings ?? 0}
                    </span>
                  </td>
                  {/* Status */}
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border ${STATUS_STYLES[u.status]}`}>
                      {u.status}
                    </span>
                  </td>
                  {/* Role */}
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                      u.role === 'ADMIN'
                        ? 'bg-[#00a8cc]/10 text-[#00a8cc] border-[#00a8cc]/20'
                        : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                    }`}>
                      <Shield className="w-2.5 h-2.5" /> {u.role}
                    </span>
                  </td>
                  {/* Actions */}
                  <td className="px-3 py-3">
                    <ActionMenu user={u} onView={() => setDrawerUserId(u.id)} onDelete={() => setDeleteTarget(u)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && !data?.users?.length && (
          <div className="py-16 text-center">
            <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-400 dark:text-gray-500">No users found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Page <span className="font-bold text-gray-700 dark:text-gray-300">{data.page}</span> of{' '}
            <span className="font-bold text-gray-700 dark:text-gray-300">{data.totalPages}</span> · {data.total} users
          </span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 font-semibold disabled:opacity-40 hover:bg-gray-50 transition-colors dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-800">
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <button disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 font-semibold disabled:opacity-40 hover:bg-gray-50 transition-colors dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-800">
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* User Detail Drawer */}
      {drawerUserId && <UserDrawer userId={drawerUserId} onClose={() => setDrawerUserId(null)} />}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <DeleteModal
          user={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          isPending={deleteMut.isPending}
        />
      )}
    </div>
  );
};
