import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 text-gray-500 mt-20 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-[#00a8cc]">CINEBOOK</span>
              <span className="text-[10px] text-gray-400 uppercase font-semibold border-l border-gray-200 pl-2">cinemas</span>
            </Link>
            <p className="text-xs leading-relaxed text-gray-400">
              Nepal's premier cinema chain. IMAX Laser projection and Dolby Atmos sound systems for an unmatched big-screen experience.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-gray-700 font-semibold uppercase text-[10px] tracking-widest mb-3">Quick Navigation</h4>
            <ul className="space-y-2">
              <li><Link to="/movies" className="hover:text-[#00a8cc] transition-colors">Now Showing</Link></li>
              <li><Link to="/showtimes" className="hover:text-[#00a8cc] transition-colors">Schedules &amp; Showtimes</Link></li>
              <li><Link to="/about" className="hover:text-[#00a8cc] transition-colors">Cinema Auditoriums</Link></li>
              <li><Link to="/faq" className="hover:text-[#00a8cc] transition-colors">Customer Service &amp; FAQ</Link></li>
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h4 className="text-gray-700 font-semibold uppercase text-[10px] tracking-widest mb-3">Cinema Locations</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#00a8cc] shrink-0" /> Civil Mall, Kathmandu</li>
              <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#00a8cc] shrink-0" /> Labim Mall, Lalitpur</li>
              <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#00a8cc] shrink-0" /> Chhaya Center, Thamel</li>
              <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#00a8cc] shrink-0" /> Pokhara Trade Mall, Pokhara</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-gray-700 font-semibold uppercase text-[10px] tracking-widest mb-3">Contact Us</h4>
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

        <div className="border-t border-gray-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-gray-400">
          <p>© 2026 CineBook Cinemas. All rights reserved.</p>
          <div className="flex gap-4 mt-3 sm:mt-0">
            <Link to="/terms" className="hover:text-gray-600 transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
