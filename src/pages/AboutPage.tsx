import React from 'react';
import { Film, Sparkles, Tv, Volume2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const halls = [
    {
      name: 'Audi 1 (IMAX Laser)',
      capacity: 60,
      screenType: '4K Dual Laser 3D Projection',
      soundSystem: 'Dolby Atmos 12.1 Custom Array',
      description: 'Our flagship auditorium featuring edge-to-edge floor curved glass screen and high-frame-rate laser projection.',
    },
    {
      name: 'Audi 2 (Dolby Cinema)',
      capacity: 48,
      screenType: 'Laser HDR Projection',
      soundSystem: 'Dolby Atmos Surround',
      description: 'Mastered for deep dynamic contrast and crystal clear acoustic tuning across all seat rows.',
    },
    {
      name: 'Audi 3 (VIP Lounge)',
      capacity: 32,
      screenType: 'MicroLED HDR Screen',
      soundSystem: 'Bowers & Wilkins Custom Audio',
      description: 'Ultra-exclusive private cinema room with motor recliners and complimentary gourmet butler service.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center mx-auto shadow-xl shadow-rose-950/50">
          <Film className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">The CineBook Experience</h1>
        <p className="text-gray-600 text-sm leading-relaxed">
          Redefining cinema projection in Nepal. Equipped with next-generation laser projection and Dolby Atmos multidimensional soundscapes.
        </p>
      </div>

      {/* Auditoriums Specs Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-extrabold text-gray-900">Our Auditoriums & Tech Specs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {halls.map((hall) => (
            <div key={hall.name} className="glass-panel p-6 rounded-3xl border border-gray-200 bg-white space-y-4 hover:border-rose-500/40 transition-colors">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-500" /> {hall.name}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">{hall.description}</p>

              <div className="space-y-2 pt-2 border-t border-gray-200 text-xs">
                <div className="flex items-center justify-between text-gray-700">
                  <span className="flex items-center gap-1.5 text-gray-500"><Tv className="w-3.5 h-3.5 text-rose-400" /> Screen Spec</span>
                  <span className="font-semibold">{hall.screenType}</span>
                </div>
                <div className="flex items-center justify-between text-gray-700">
                  <span className="flex items-center gap-1.5 text-gray-500"><Volume2 className="w-3.5 h-3.5 text-rose-400" /> Sound System</span>
                  <span className="font-semibold">{hall.soundSystem}</span>
                </div>
                <div className="flex items-center justify-between text-gray-700">
                  <span className="text-gray-500">Total Capacity</span>
                  <span className="font-bold text-rose-400">{hall.capacity} Plush Seats</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
