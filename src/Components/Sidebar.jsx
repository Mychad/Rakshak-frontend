import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Map, FileText, Plus, User, Home, Menu, X } from "lucide-react";

const Sidebar = () => {
  // State to control the open/closed status of the sidebar.
  // Set the initial state based on the screen size for better mobile experience.
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 768);

  // A list of navigation items with their properties.
  const navItems = [
    { to: "/", icon: <Home className="w-5 h-5" />, label: "Home" },
    { to: "/map", icon: <Map className="w-5 h-5" />, label: "Map" },
    {
      to: "/posts",
      icon: <FileText className="w-5 h-5" />,
      label: "Posts",
    },
    {
      to: "/post/add",
      icon: <Plus className="w-5 h-5" />,
      label: "Add Post",
    },
    {
      to: "/profile",
      icon: <User className="w-5 h-5" />,
      label: "Profile",
    },
  ];

  // Function to handle link clicks and close the sidebar on smaller screens.
  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <div
      // Main container with a transition for width and overflow-hidden for a smooth animation.
      className={`hidden md:flex flex-col bg-slate-900 p-4 text-white border-r border-gray-300  min-h-screen
        transition-all duration-500 ease-in-out overflow-hidden flex-shrink-0
        ${isOpen ? "w-64" : "w-18"}`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex ml-auto w-fit mb-6 p-2 rounded-lg ${
          isOpen ? "bg-emerald-600" : ""
        } hover:bg-emerald-600 transition`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Navigation Links */}
      <div className="space-y-2 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setIsOpen(false)}
            className={`flex items-center py-3 px-1 rounded-xl text-gray-200 hover:text-emerald-700 hover:bg-emerald-50
              transition-all duration-500 ease-in-out transform hover:scale-105
              ${isOpen ? "justify-start space-x-3" : "justify-center"}`}
          >
            {item.icon}
            <span
              // Span for the label text with its own transition for opacity and width.
              // The `whitespace-nowrap` prevents the text from wrapping when the sidebar collapses.
              className={`font-medium transition-all duration-300 whitespace-nowrap
                ${isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"}`}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
