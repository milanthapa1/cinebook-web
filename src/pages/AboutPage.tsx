import React from 'react';
import { Link } from 'react-router-dom';
import { Clapperboard, Projector, AudioLines, Armchair, Ticket, MapPin, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const halls = [
    {
      name: 'Audi 1',
      capacity: 60,
      screenType: '4K Dual Laser 3D Projection',
      soundSystem: 'Dolby Atmos',
      description:
        'Our flagship auditorium featuring edge-to-edge curved screen with high-frame-rate laser projection.',
      tag: 'Flagship',
    },
    {
      name: 'Audi 2',
      capacity: 60,
      screenType: 'Laser HDR Projection',
      soundSystem: 'Dolby Atmos Surround',
      description:
        'Engineered for exceptional HDR visuals and immersive surround sound across every seat.',
      tag: 'HDR',
    },
    {
      name: 'Audi 3',
      capacity: 60,
      screenType: 'MicroLED HDR Screen',
      soundSystem: 'Bowers & Wilkins Custom Audio',
      description:
        'Private luxury cinema with premium recliners and personalized hospitality.',
      tag: 'Luxury',
    },
  ];

  const features = [
    {
      Icon: Projector,
      title: 'Laser Projection',
      text: '4K dual-laser, HDR-bright picture with edge-to-edge clarity in every auditorium.',
    },
    {
      Icon: AudioLines,
      title: 'Dolby Atmos',
      text: 'Object-based immersive audio calibrated seat-by-seat for even coverage.',
    },
    {
      Icon: Armchair,
      title: 'Designed for Comfort',
      text: 'Extra legroom, premium recliners in Audi 3, and sightlines checked from every row.',
    },
    {
      Icon: Ticket,
      title: 'Easy Booking',
      text: 'Pick seats live, hold in seconds, pay with eSewa and walk in with a QR ticket.',
    },
  ];

  const stats = [
    { value: '3', label: 'Auditoriums' },
    { value: '180', label: 'Seats' },
    { value: '4K', label: 'Laser Projection' },
    { value: '360°', label: 'Dolby Atmos' },
  ];

  return (
    <div className="bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {/* Hero */}
      <div className="relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6 py-16 sm:py-20">
          <p className="text-[#00a8cc] text-xs font-semibold uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
            <Clapperboard className="w-4 h-4" /> About CineBook
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight max-w-2xl">
            The CineBook Experience
          </h1>
          <p className="mt-4 text-sm sm:text-base leading-7 text-gray-300 max-w-2xl">
            Experience premium cinema with cutting-edge laser projection,
            immersive Dolby Atmos audio, and thoughtfully designed auditoriums
            built for comfort and entertainment.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/movies"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#00a8cc] hover:bg-[#0096c7] text-white font-semibold text-sm rounded transition-colors active:scale-95"
            >
              Browse Movies <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/showtimes"
              className="inline-flex items-center gap-2 px-6 py-2.5 border border-white/30 hover:border-white text-white font-semibold text-sm rounded transition-colors"
            >
              View Showtimes
            </Link>
          </div>
          {/* Stats */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl bg-white/10 border border-white/10 backdrop-blur px-4 py-3 text-center"
              >
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-[11px] uppercase tracking-widest text-gray-300 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-14">
        {/* Why */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-semibold">Why CineBook?</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Premium technology and luxury seating across every screen — no bad seats.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-14">
          {features.map(({ Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-gray-200 bg-white p-5 hover:border-[#00a8cc]/40 hover:shadow-md transition-all dark:bg-gray-900 dark:border-gray-800"
            >
              <span className="w-10 h-10 rounded-xl bg-[#00a8cc]/10 text-[#00a8cc] flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </span>
              <h3 className="mt-3 font-semibold text-[15px]">{title}</h3>
              <p className="mt-1.5 text-[13px] leading-6 text-gray-600 dark:text-gray-400">{text}</p>
            </div>
          ))}
        </div>

        {/* Auditoriums */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold">
              Our Auditoriums
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Premium technology and luxury seating across every screen.
            </p>
          </div>
          <Link to="/showtimes" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#00a8cc] hover:underline">
            Book a seat <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {halls.map((hall) => (
            <div
              key={hall.name}
              className="rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-200 hover:border-[#00a8cc]/40 hover:shadow-lg hover:-translate-y-1 dark:bg-gray-900 dark:border-gray-800"
            >
              <div className="bg-[#00a8cc] px-4 py-1.5 flex items-center justify-between">
                <span className="text-white text-[11px] font-extrabold uppercase tracking-widest">{hall.name}</span>
                <span className="text-[10px] bg-black/25 text-white px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                  {hall.tag}
                </span>
              </div>
              <div className="p-6">
                <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
                  {hall.description}
                </p>

                <div className="mt-6 border-t border-gray-100 pt-5 space-y-4 dark:border-gray-800">
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Screen</span>
                    <span className="text-sm font-medium text-right">
                      {hall.screenType}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Audio</span>
                    <span className="text-sm font-medium text-right">
                      {hall.soundSystem}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Capacity</span>
                    <span className="text-sm font-semibold">
                      {hall.capacity} Seats
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Visit CTA */}
        <div className="mt-14 rounded-2xl bg-gray-900 dark:bg-gray-900 border border-gray-800 p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00a8cc]/20 to-transparent pointer-events-none" />
          <div className="relative">
            <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#00a8cc]">
              <MapPin className="w-3.5 h-3.5" /> Visit us
            </p>
            <h3 className="mt-2 text-xl font-bold text-white">Find a cinema near you</h3>
            <p className="mt-1 text-sm text-gray-400">Kathmandu · Lalitpur · Bhaktapur — pick your city and book in seconds.</p>
          </div>
          <div className="relative flex flex-wrap gap-3">
            <Link
              to="/showtimes"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#00a8cc] hover:bg-[#0096c7] text-white font-semibold text-sm rounded transition-colors active:scale-95"
            >
              Book Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-2.5 border border-gray-700 hover:border-gray-500 text-gray-200 font-semibold text-sm rounded transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};