// Components/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Compass,
  Menu,
  X,
  Home,
  Map,
  FileText,
  Plus,
  User,
  LogOut,
  LogIn,
  Search as SearchIcon,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [isLogged, setIsLogged] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);

  const navItems = [
    { to: "/", icon: <Home className="w-5 h-5" />, label: "Home" },
    { to: "/map", icon: <Map className="w-5 h-5" />, label: "Map" },
    { to: "/post/add", icon: <Plus className="w-5 h-5" />, label: "Add Post" },
    { to: "/profile", icon: <User className="w-5 h-5" />, label: "Profile" },
    { to: "/crime", icon: <FileText className="w-5 h-5" />, label: "Crime Reports" },
  ];

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  const handleAuth = () => {
    // 1. token hatao
    localStorage.removeItem("token");
    // ya sessionStorage.removeItem("token");

    // 2. login state false
    setIsLogged(false);

    // 3. sidebar band
    setSidebarOpen(false);

    // 4. auth page pe bhejo
    navigate("/auth");
  };

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const navbarStyle = {
    background:
      "linear-gradient(90deg, rgba(6,95,70,0.9), rgba(16,185,129,0.3)), #064f46",
    backdropFilter: "blur(8px)",
  };

  return (
    <>
      {/* Top navbar with gradient (applies to all screens) */}
      <nav className="sticky top-0 z-50 border-b " style={navbarStyle}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Brand always visible (mobile + desktop) */}
            <div className="flex items-center gap-3">
              <Compass className="w-7 h-7 text-emerald-200" />
              <div>
                <h1 className="text-lg font-bold text-white">Rakshak</h1>
                <p className="text-xs text-emerald-100 -mt-0.5">
                  Community Safety
                </p>
              </div>
            </div>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex-shrink-0 px-3 py-2 rounded-full text-sm flex items-center gap-2 transition-colors ${
                    isActive(item.to)
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-800/50 text-white/90 hover:bg-emerald-500 hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Right side: search + auth + mobile toggle */}
            <div className="flex items-end justify-end">

              <button
                onClick={handleAuth}
                className="hidden md:inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition-colors text-white/90"
              >
                {isLogged ? (
                  <LogOut className="w-4 h-4" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span className="text-sm">{isLogged ? "Logout" : "Login"}</span>
              </button>

              <button
                onClick={() => setSidebarOpen((s) => !s)}
                className="md:hidden p-2 rounded-lg text-white/90 hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile slide-over starts BELOW the navbar (no duplicate header) */}
      <div
        className={`fixed inset-x-0 top-0 z-[9999] md:hidden ${
          sidebarOpen ? "" : ""
        }`}
        aria-hidden={!sidebarOpen}
      >
        {/* keep navbar visible by placing top area transparent, backdrop starts below navbar height */}
        {/* Backdrop (covers page and blocks clicks) */}
        <div
          className={`absolute inset-x-0 top-14 bottom-0 bg-black/60 transition-opacity duration-300 ease-in-out ${
            sidebarOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden={!sidebarOpen}
        />

        {/* Panel — sits above backdrop */}
        <aside
          ref={sidebarRef}
          className={`absolute top-14 left-0 h-[calc(100vh-56px)] w-72 transform transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } bg-slate-900/95 border-r border-white/6 shadow-xl z-[10000]`}
          role="dialog"
          aria-modal="true"
        >
          {/* close area / handle (optional) */}
          <div className="p-3 flex justify-end">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-white/80 hover:bg-white/6"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex-shrink-0 px-3 py-2 rounded-full text-sm flex items-center gap-3 transition-colors ${
                  isActive(item.to)
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-800/50 text-white/90 hover:bg-emerald-500 hover:text-white"
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}

            <div className="border-t border-white/6 my-3" />

            <button
              onClick={() => {
                handleAuth();
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 w-full p-3 rounded-full text-left transition-colors ${
                isLogged
                  ? "text-rose-400 hover:bg-rose-700/6"
                  : "text-emerald-300 hover:bg-emerald-600/6"
              }`}
            >
              {isLogged ? (
                <LogOut className="w-5 h-5" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              <span className="font-medium">
                {isLogged ? "Logout" : "Login"}
              </span>
            </button>
          </nav>
        </aside>
      </div>
    </>
  );
}
