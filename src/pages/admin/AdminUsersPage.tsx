import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Shield, Loader2, Users } from 'lucide-react';
import { useAdminUsers, useUpdateUserRole } from '../../features/admin/useAdmin';

export const AdminUsersPage: React.FC = () => {
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState('');
  const [input, setInput]     = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { data, isLoading }   = useAdminUsers(page, search || undefined);
  const roleMut               = useUpdateUserRole();
  const fmt = (d: string) => new Date(d).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });

  const toggle = async (id: string, role: 'USER' | 'ADMIN') => {
    setUpdatingId(id);
    try { await roleMut.mutateAsync({ id, role: role === 'ADMIN' ? 'USER' : 'ADMIN' }); }
    finally { setUpdatingId(null); }
  };

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage accounts and roles · <span className="font-semibold text-gray-700">{data?.total ?? 0}</span> total</p>
        </div>
        <form onSubmit={e => { e.preventDefault(); setSearch(input); setPage(1); }} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              value={input} onChange={e => setInput(e.target.value)}
              placeholder="Search name or email..."
              className="pl-9 pr-3 py-2 bg-white border border-gray-200 focus:border-[#00a8cc] focus:ring-2 focus:ring-[#00a8cc]/10 text-gray-900 text-xs rounded-xl focus:outline-none w-56 transition-all"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-[#00a8cc] hover:bg-[#0096c7] text-white font-semibold text-xs rounded-xl transition-colors">Search</button>
        </form>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">{[1,2,3,4].map(n => <div key={n} className="h-16 shimmer rounded-xl" />)}</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                {['User', 'Phone', 'Joined', 'Bookings', 'Role'].map(h => (
                  <th key={h} className={`text-left px-5 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400 ${h === 'Phone' || h === 'Joined' ? 'hidden sm:table-cell' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.users?.map((u, i) => (
                <tr key={u.id} className={`hover:bg-[#00a8cc]/5 transition-colors border-b border-gray-50 last:border-0 ${i % 2 === 1 ? 'bg-gray-50/30' : ''}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {u.avatarUrl
                        ? <img src={u.avatarUrl} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0" />
                        : <div className="w-8 h-8 rounded-full bg-[#00a8cc] flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                      }
                      <div>
                        <p className="font-bold text-gray-900">{u.name}</p>
                        <p className="text-gray-400 mt-0.5">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 hidden sm:table-cell">{u.phone || '—'}</td>
                  <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell">{fmt(u.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#00a8cc]/10 text-[#00a8cc] font-black text-xs">
                      {u._count?.bookings ?? 0}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {updatingId === u.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#00a8cc]" />
                    ) : (
                      <button onClick={() => toggle(u.id, u.role)}
                        title={`Click to change role to ${u.role === 'ADMIN' ? 'USER' : 'ADMIN'}`}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          u.role === 'ADMIN'
                            ? 'bg-[#00a8cc]/10 text-[#00a8cc] hover:bg-[#00a8cc]/20 border border-[#00a8cc]/20'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
                        }`}>
                        <Shield className="w-3 h-3" />{u.role}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.users?.length && (
            <div className="py-16 text-center">
              <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-400">No users found</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Page <span className="font-bold text-gray-700">{data.page}</span> of <span className="font-bold text-gray-700">{data.totalPages}</span> · {data.total} users</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 font-semibold disabled:opacity-40 hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <button disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 font-semibold disabled:opacity-40 hover:bg-gray-50 transition-colors">
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
