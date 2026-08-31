import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-rose-600/20 text-rose-500 flex items-center justify-center border border-rose-500/40">
        <Film className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-gray-900">404 - Page Not Found</h1>
      <p className="text-sm text-gray-600 max-w-sm">The cinema page or showtime URL you requested could not be located.</p>
      <Link
        to="/"
        className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-gray-900 font-bold text-sm transition-all flex items-center gap-2"
      >
        <Home className="w-4 h-4" /> Return to Homepage
      </Link>
    </div>
  );
};
