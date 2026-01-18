import React from "react";
import { Compass, Heart, Github, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="border-t border-emerald-500/20 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* 1. Brand Section - Takes more space on desktop */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Compass className="w-6 h-6 text-emerald-400" />
              <span className="text-xl font-bold tracking-tight">Rakshak</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Empowering communities through real-time safety awareness and
              collaborative reporting. Built to make our neighborhoods safer for
              everyone.
            </p>
          </div>

          {/* 2. Quick Links - Centered on desktop */}
          <div className="flex flex-col md:items-center">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 mb-4">
                Navigation
              </h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link
                    to="/"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/map"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Safety Map
                  </Link>
                </li>
                <li>
                  <Link
                    to="/post/add"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Add Report
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profile"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    My Profile
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* 3. Connect/Socials - Right aligned on desktop */}
          <div className="flex flex-col md:items-end">
            {/* Socials/Newsletter */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 mb-4">
                Connect
              </h3>
              <div className="flex gap-4">
                <a
                  href="https://www.linkedin.com/in/mohammed-kadiwal-527971320/"
                  className="p-2 bg-slate-800 rounded-full hover:bg-emerald-500 transition-all"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://github.com/Mychad"
                  className="p-2 bg-slate-800 rounded-full hover:bg-emerald-500 transition-all"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href="mailto:mkadiwal3004@gmail.com"
                  className="p-2 bg-slate-800 rounded-full hover:bg-emerald-500 transition-all"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 justify-center   pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Rakshak Platform. Built for public
            awareness.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
