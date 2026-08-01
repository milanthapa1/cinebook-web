import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Camera, User, Mail, Phone, Ticket, Edit3, Check, X, Calendar, MapPin, Shield } from 'lucide-react';
import { useAuthStore } from '../features/auth/useAuthStore';
import { useUserBookings } from '../features/booking/useBookings';
import apiClient from '../lib/apiClient';

type Tab = 'profile' | 'tickets';

const SidebarButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all text-left ${
      active
        ? 'bg-[#00a8cc]/10 text-[#00a8cc]'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`}
  >
    <span className={active ? 'text-[#00a8cc]' : 'text-gray-400'}>{icon}</span>
    {label}
  </button>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    CONFIRMED: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    CANCELLED:  'bg-rose-50 text-rose-600 border-rose-200',
    PENDING:    'bg-amber-50 text-amber-600 border-amber-200',
    EXPIRED:    'bg-gray-100 text-gray-500 border-gray-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${map[status] ?? map.PENDING}`}>
      {status}
    </span>
  );
};

// Shared read-only field display
const DisplayField: React.FC<{ icon?: React.ReactNode; value: string }> = ({ icon, value }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-700 font-medium flex items-center gap-2">
    {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
    <span>{value}</span>
  </div>
);

export const UserProfilePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = (searchParams.get('tab') as Tab) || 'profile';

  const { user, updateUser } = useAuthStore();
  const { data: bookings, isLoading: bookingsLoading } = useUserBookings();

  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('');
  const [dob, setDob]             = useState('');
  const [gender, setGender]       = useState('');

  useEffect(() => {
    if (user) {
      const parts = user.name?.split(' ') || [];
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      apiClient.get('/users/me').then((res) => {
        const profile = res.data?.data;
        if (profile) { setDob(profile.dob || ''); setGender(profile.gender || ''); }
      }).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    const t = searchParams.get('tab') as Tab;
    if (t) setActiveTab(t);
  }, [searchParams]);

  if (!user) return null;

  const initials = user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setSaveMsg('');
    try {
      const sigRes = await apiClient.post('/uploads/signature?folder=cinebook/avatars');
      const { timestamp, signature, apiKey, cloudName, folder } = sigRes.data.data;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', folder);
      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
      const cloudData = await cloudRes.json();
      if (cloudData.secure_url) {
        await apiClient.patch('/users/me', { avatarUrl: cloudData.secure_url });
        updateUser({ avatarUrl: cloudData.secure_url });
        setSaveMsg('Avatar updated');
        setTimeout(() => setSaveMsg(''), 3000);
      }
    } catch { setSaveMsg('Avatar upload failed'); }
    finally { setUploading(false); }
  };

  const handleSaveProfile = async () => {
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      await apiClient.patch('/users/me', {
        name: fullName,
        phone: phone || undefined,
        dob: dob || undefined,
        gender: gender || undefined,
      });
      updateUser({ name: fullName, phone });
      setSaveMsg('Profile saved');
      setEditing(false);
      setTimeout(() => setSaveMsg(''), 3000);
    } catch { setSaveMsg('Failed to save profile'); }
  };

  const inputCls = 'w-full bg-white border border-gray-300 focus:border-[#00a8cc] focus:outline-none text-gray-900 text-xs rounded-lg px-3 py-2.5 transition-colors';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">

      {/* Page Header */}
      <div className="border-b border-gray-200 bg-white py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group shrink-0">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                {user.avatarUrl
                  ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  : <span className="text-xl font-bold text-[#00a8cc]">{initials}</span>
                }
              </div>
              <label className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Camera className="w-4 h-4 text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{user.name}</h1>
              <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
            </div>
          </div>
          {uploading && <span className="text-xs text-[#00a8cc] animate-pulse">Uploading photo...</span>}
          {saveMsg && !uploading && (
            <span className={`text-xs font-semibold ${saveMsg.includes('fail') ? 'text-rose-500' : 'text-emerald-600'}`}>
              {saveMsg}
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row gap-8">

        {/* Sidebar */}
        <aside className="md:w-52 shrink-0 space-y-1">
          <SidebarButton icon={<User className="w-4 h-4" />} label="Account Settings" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          <SidebarButton icon={<Ticket className="w-4 h-4" />} label="My Bookings" active={activeTab === 'tickets'} onClick={() => setActiveTab('tickets')} />
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* TAB: Account Settings */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Personal Information</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Manage your personal profile details</p>
                </div>

                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors border border-gray-200"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#00a8cc]" /> Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#00a8cc] hover:bg-[#0096c7] text-white text-xs font-semibold transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" /> Save Changes
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors border border-gray-200"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">First Name</label>
                  {editing
                    ? <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls} />
                    : <DisplayField value={firstName || 'Not set'} />
                  }
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Last Name</label>
                  {editing
                    ? <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} />
                    : <DisplayField value={lastName || 'Not set'} />
                  }
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                  <DisplayField icon={<Mail className="w-3.5 h-3.5" />} value={email} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number</label>
                  {editing
                    ? <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 9801234567" className={inputCls} />
                    : <DisplayField icon={<Phone className="w-3.5 h-3.5" />} value={phone || 'No phone added'} />
                  }
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date of Birth</label>
                  {editing
                    ? <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputCls} />
                    : <DisplayField icon={<Calendar className="w-3.5 h-3.5" />} value={dob || 'Not set'} />
                  }
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Gender</label>
                  {editing ? (
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className={`${inputCls} appearance-none`}>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <DisplayField value={gender || 'Not specified'} />
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center gap-2.5 text-xs text-gray-500">
                <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Your personal account data is encrypted and secure.</span>
              </div>
            </div>
          )}

          {/* TAB: My Bookings */}
          {activeTab === 'tickets' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-base font-bold text-gray-900">My Cinema Tickets</h2>
                <p className="text-xs text-gray-500 mt-0.5">Your ticket history and active reservations</p>
              </div>

              {bookingsLoading ? (
                <div className="space-y-3">{[1,2].map((n) => <div key={n} className="h-16 shimmer rounded-lg" />)}</div>
              ) : bookings && bookings.length > 0 ? (
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div key={b.id} className="p-4 bg-white rounded-xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-gray-300 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <h3 className="font-semibold text-gray-900 text-sm">{b.showtime?.movie?.title || 'Movie'}</h3>
                          <StatusBadge status={b.status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#00a8cc]" />
                            {b.showtime?.hall?.name || 'Cinema Hall'}
                          </span>
                          <span>&bull;</span>
                          <span>
                            {b.showtime?.startsAt
                              ? new Date(b.showtime.startsAt).toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                              : 'Showtime'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block text-[10px] text-gray-400 font-mono">REF #{b.id.slice(-6).toUpperCase()}</span>
                        <span className="text-sm font-bold text-[#00a8cc]">NPR {Number(b.totalAmount).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Ticket className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No ticket records found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
