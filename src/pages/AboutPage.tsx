import React from 'react';

export const AboutPage: React.FC = () => {
  const halls = [
    {
      name: 'Audi 1 (IMAX Laser)',
      capacity: 60,
      screenType: '4K Dual Laser 3D Projection',
      soundSystem: 'Dolby Atmos 12.1 Custom Array',
      description:
        'Our flagship auditorium featuring edge-to-edge curved screen with high-frame-rate laser projection.',
    },
    {
      name: 'Audi 2 (Dolby Cinema)',
      capacity: 48,
      screenType: 'Laser HDR Projection',
      soundSystem: 'Dolby Atmos Surround',
      description:
        'Engineered for exceptional HDR visuals and immersive surround sound across every seat.',
    },
    {
      name: 'Audi 3 (VIP Lounge)',
      capacity: 32,
      screenType: 'MicroLED HDR Screen',
      soundSystem: 'Bowers & Wilkins Custom Audio',
      description:
        'Private luxury cinema with premium recliners and personalized hospitality.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          The CineBook Experience
        </h1>

        <p className="mt-5 text-base leading-7 text-gray-600">
          Experience premium cinema with cutting-edge laser projection,
          immersive Dolby Atmos audio, and thoughtfully designed auditoriums
          built for comfort and entertainment.
        </p>
      </div>

      {/* Auditoriums */}
      <div>
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Our Auditoriums
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Premium technology and luxury seating across every screen.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {halls.map((hall) => (
            <div
              key={hall.name}
              className="rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:border-gray-300 hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {hall.name}
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                {hall.description}
              </p>

              <div className="mt-6 border-t border-gray-100 pt-5 space-y-4">
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-500">Screen</span>
                  <span className="text-sm font-medium text-right text-gray-900">
                    {hall.screenType}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-500">Audio</span>
                  <span className="text-sm font-medium text-right text-gray-900">
                    {hall.soundSystem}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-500">Capacity</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {hall.capacity} Seats
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};