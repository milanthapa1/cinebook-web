import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Ticket, Users, TrendingUp, Clock, ArrowRight, CalendarDays } from 'lucide-react';
import { useAdminStats } from '../../features/admin/useAdmin';

// ─── Stat Card ────────────────────────────────────────────────────────────────
const Stat: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
  to: string;
}> = ({ label, value, sub, icon, iconBg, to }) => (
  <Link
    to={to}
    className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3 hover:border-[#00a8cc]/50 hover:shadow-md transition-all duration-200 group"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
      {icon}
    </div>
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
      <p className="text-3xl font-extrabold text-gray-900 mt-1 leading-none">{value}</p>
      {sub && <p className="text-[11px] text-gray-500 mt-1.5">{sub}</p>}
    </div>
  </Link>
);

// ─── Bar Chart ────────────────────────────────────────────────────────────────
const MiniChart: React.FC<{ keys: string[]; vals: number[]; maxVal: number }> = ({ keys, vals, maxVal }) => (
  <div className="flex items-end gap-1.5 h-32">
    {vals.map((v, i) => {
      const pct = maxVal > 0 ? (v / maxVal) * 100 : 0;
      return (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group relative">
          {v > 0 && (
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              NPR {v.toLocaleString()}
            </div>
          )}
          <div className="w-full flex flex-col justify-end" style={{ height: '100px' }}>
            <div
              className="w-full bg-[#00a8cc] rounded-t transition-all duration-500 hover:bg-[#0096c7]"
              style={{ height: `${Math.max(pct, v > 0 ? 4 : 0)}%` }}
            />
          </div>
          <span className="text-[9px] text-gray-400 font-medium">{keys[i]?.slice(5)}</span>
        </div>
      );
    })}
  </div>
);

export const AdminDashboardPage: React.FC = () => {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) return (
    <div className="space-y-6 max-w-6xl">
      <div className="h-8 shimmer rounded-xl w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(n => <div key={n} className="h-36 shimmer rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="h-52 shimmer rounded-2xl" />
        <div className="h-52 shimmer rounded-2xl" />
      </div>
      <div className="h-64 shimmer rounded-2xl" />
    </div>
  );

  const dailyKeys         = Object.keys(stats?.dailyRevenue || {}).sort().slice(-7);
  const dailyVals         = dailyKeys.map(k => stats!.dailyRevenue[k] || 0);
  const maxVal            = Math.max(...dailyVals, 1);
  const totalWeekRevenue  = dailyVals.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Cinema operations overview</p>
        </div>
        <p className="text-xs font-medium text-gray-400 hidden sm:block">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="Movies"
          value={stats?.totalMovies ?? 0}
          sub={`${stats?.nowShowing ?? 0} now showing`}
          icon={<Film className="w-5 h-5 text-[#00a8cc]" />}
          iconBg="bg-[#00a8cc]/10"
          to="/admin/movies"
        />
        <Stat
          label="Bookings"
          value={(stats?.totalBookings ?? 0).toLocaleString()}
          icon={<Ticket className="w-5 h-5 text-amber-500" />}
          iconBg="bg-amber-50"
          to="/admin/bookings"
        />
        <Stat
          label="Users"
          value={(stats?.totalUsers ?? 0).toLocaleString()}
          icon={<Users className="w-5 h-5 text-violet-500" />}
          iconBg="bg-violet-50"
          to="/admin/users"
        />
        <Stat
          label="Revenue"
          value={`NPR ${((stats?.totalRevenue ?? 0) / 1000).toFixed(1)}k`}
          sub="Confirmed bookings only"
          icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
          iconBg="bg-emerald-50"
          to="/admin/bookings"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Revenue chart */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00a8cc]" /> Revenue — Last 7 Days
              </h2>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Total: <span className="font-semibold text-gray-600">NPR {totalWeekRevenue.toLocaleString()}</span>
              </p>
            </div>
            <Link to="/admin/bookings" className="text-[11px] text-[#00a8cc] font-semibold hover:underline flex items-center gap-1">
              Details <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {dailyVals.length > 0
            ? <MiniChart keys={dailyKeys} vals={dailyVals} maxVal={maxVal} />
            : <div className="h-32 flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">No revenue data yet</div>
          }
        </div>

        {/* Top Movies */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Film className="w-4 h-4 text-[#00a8cc]" /> Top Movies
            </h2>
            <Link to="/admin/movies" className="text-[11px] text-[#00a8cc] font-semibold hover:underline">View all</Link>
          </div>
          <div className="flex-1 divide-y divide-gray-50">
            {stats?.topMovies?.length ? stats.topMovies.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <span className="text-[10px] font-bold text-gray-400 w-4 shrink-0 tabular-nums">#{i + 1}</span>
                <img src={m.posterUrl} alt={m.title} className="w-6 h-9 rounded object-cover shrink-0 border border-gray-100" />
                <span className="text-xs font-medium text-gray-800 flex-1 truncate">{m.title}</span>
                <span className="text-[11px] font-semibold text-[#00a8cc] shrink-0 tabular-nums">{m.count}</span>
              </div>
            )) : (
              <div className="flex items-center justify-center py-10">
                <p className="text-xs text-gray-400">No bookings yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#00a8cc]" /> Recent Bookings
          </h2>
          <Link to="/admin/bookings" className="text-[11px] text-[#00a8cc] font-semibold hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {stats?.recentBookings?.length ? (
          <div className="divide-y divide-gray-50">
            {stats.recentBookings.map(b => (
              <div key={b.id} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Ticket className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{(b as any).showtime?.movie?.title ?? 'Movie'}</p>
                    <p className="text-[11px] text-gray-500 truncate">{(b as any).user?.name} · {(b as any).user?.email}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <p className="text-xs font-bold text-gray-900">NPR {Number(b.totalAmount).toFixed(0)}</p>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                    b.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600'
                    : b.status === 'CANCELLED' ? 'bg-rose-50 text-rose-600'
                    : 'bg-amber-50 text-amber-600'
                  }`}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-14 text-center">
            <CalendarDays className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No bookings yet</p>
          </div>
        )}
      </div>

    </div>
  );
};
