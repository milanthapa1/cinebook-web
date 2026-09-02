import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-cinema-darkBg border-t border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-logo text-2xl font-normal text-[#00a8cc] leading-none">CINEBOOK</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-semibold border-l border-gray-200 dark:border-gray-700 pl-2">cinemas</span>
            </Link>
            <p className="text-xs leading-relaxed text-gray-400 dark:text-gray-500">
              Nepal's premier cinema chain. IMAX Laser projection and Dolby Atmos sound systems for an unmatched big-screen experience.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-gray-700 dark:text-gray-200 font-semibold uppercase text-[10px] tracking-widest mb-3">Quick Navigation</h4>
            <ul className="space-y-2">
              <li><Link to="/movies" className="hover:text-[#00a8cc] transition-colors">Now Showing</Link></li>
              <li><Link to="/showtimes" className="hover:text-[#00a8cc] transition-colors">Schedules &amp; Showtimes</Link></li>
              <li><Link to="/about" className="hover:text-[#00a8cc] transition-colors">Cinema Auditoriums</Link></li>
              <li><Link to="/faq" className="hover:text-[#00a8cc] transition-colors">Customer Service &amp; FAQ</Link></li>
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h4 className="text-gray-700 dark:text-gray-200 font-semibold uppercase text-[10px] tracking-widest mb-3">Cinema Locations</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#00a8cc] shrink-0" /> MT Cinemas Kathmandu</li>
              <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#00a8cc] shrink-0" /> MT Cinemas Lalitpur</li>
              <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#00a8cc] shrink-0" /> MT Cinemas Bhaktapur</li>
              
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-gray-700 dark:text-gray-200 font-semibold uppercase text-[10px] tracking-widest mb-3">Contact Us</h4>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 text-[#00a8cc] shrink-0 mt-0.5" />
                <span>+977-9762415657</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 text-[#00a8cc] shrink-0 mt-0.5" />
                <a href="mailto:support@cinebook.com.np" className="hover:text-[#00a8cc] transition-colors">
                  support@cinebook.com.np
                </a>
              </li>
              <li className="pt-1">
                <Link to="/contact" className="hover:text-[#00a8cc] transition-colors">Customer Support</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-[#00a8cc] transition-colors">FAQs</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 mt-8 pt-6 gap-3 flex flex-col sm:flex-row items-center justify-between text-gray-400 dark:text-gray-500">
          <p className="text-center sm:text-left">© 2026 CineBook Cinemas. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Privacy</Link>
          </div>
        </div>

        <p className="text-center text-gray-400 dark:text-gray-500 mt-3">
          Developed by <a href="https://www.milanthapa1.com.np/" target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:text-[#00a8cc] transition-colors dark:text-white">Milan Thapa</a>.
        </p>
      </div>
    </footer>
  );
};
