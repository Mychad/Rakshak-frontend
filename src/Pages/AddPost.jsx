import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Camera,
  ImageIcon,
  MapPin,
  AlertTriangle,
  Info,
  FileText,
  Hash,
  X,
  Plus,
  Send,
  Globe,
  Users,
  Lock,
  Clock,
  Zap,
  Eye,
  User,
  Sparkles,
  Frown,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { addPost } from "../controllers/Post.controller";
const AddPost = () => {
  const [postText, setPostText] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("medium");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [selectedImages, setSelectedImages] = useState([]); // multiple images
  const [imagePreviews, setImagePreviews] = useState([]); // multiple previews
  const [privacy, setPrivacy] = useState("public");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [locationName, setLocationName] = useState("");
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Background particles
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.3 + 0.1,
    }));
    setParticles(newParticles);
  }, []);

  const postTypes = [
    {
      id: "alert",
      label: "Alert",
      icon: AlertTriangle,
      color: "red",
      description: "Safety warnings & emergencies",
    },
    {
      id: "update",
      label: "Update",
      icon: Info,
      color: "orange",
      description: "Traffic, events & infrastructure",
    },
    {
      id: "notice",
      label: "Notice",
      icon: FileText,
      color: "blue",
      description: "Lost & found, announcements",
    },
  ];

  const locationSuggestions = [
    "Mahim",
    "Dadar",
    "Bhiwandi",
    "Jogeshwari",
    "Andheri",
    "Bandra",
    "Kurla",
    "Thane",
  ];

  const commonTags = [
    "Safety",
    "Traffic",
    "Emergency",
    "LostAndFound",
    "Community",
    "Infrastructure",
    "Weather",
    "Events",
    "Crime",
    "Fire",
    "Medical",
    "Transport",
  ];

  // ================= Image Selection =================
  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);

    if (selectedImages.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setSelectedImages((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ================= Tags =================
  const addTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) =>
    setTags(tags.filter((tag) => tag !== tagToRemove));
  const addCommonTag = (tag) => {
    if (!tags.includes(tag) && tags.length < 5) setTags([...tags, tag]);
  };

  // ================= Location =================
  const getLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported.");
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
        );
        const data = await res.json();
        setLocationName(data.address.neighbourhood);
        setLocation(data.display_name);
      } catch (err) {
        console.error(err);
      }
    });
  };
  const navigate = useNavigate();
  // ================= Submit =================
  const handleSubmit = async () => {
    if (!postText.trim() || !selectedType || !location.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (postText.length < 10) {
      toast.error("Enter More Then 10 Letters");
      return;
    }

    if (tags.length === 0) {
      toast.error("Add at least one tag");
      return;
    }
    if (selectedImages.length === 0) {
      toast.error("Select at least one image");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("postText", postText);
    formData.append("selectedType", selectedType);
    formData.append("location", location);
    tags.forEach((tag) => formData.append("tags", tag));
    selectedImages.forEach((img) => formData.append("images", img));

    try {
      const res = await addPost(formData);
      console.log(res);
      toast.success("Post Submitted Successfully");
      navigate("/");
      setPostText("");
      setSelectedType("");
      setLocation("");
      setTags([]);
      setSelectedImages([]);
      setImagePreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      toast.error("Failed to submit post");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================= Render =================
  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 relative overflow-hidden">
      <Toaster position="top-center" />

      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-emerald-500/30 animate-pulse"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animation: `float ${p.speed + 3}s ease-in-out infinite alternate`,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-emerald-900/10" />

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0 z-50">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => navigate("/")}
              className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-100">
                Create Post
              </h1>
            </div>
            <div className="w-11" />
          </div>
        </div>

        {/* Form Card */}
        <div className="max-w-md mx-auto p-4">
          <div className="backdrop-blur-xl bg-white/6 border border-white/10 rounded-3xl shadow-2xl relative overflow-visible">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-600/15 to-emerald-400/10 blur-xl -z-10 pointer-events-none" />
            <div className="relative divide-y divide-white/10">
              {/* Post Type */}
              <section className="p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-400" /> Post Type *
                </h2>
                <div className="space-y-3">
                  {postTypes.map((type) => {
                    const IconComponent = type.icon;
                    const isSelected = selectedType === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                          isSelected
                            ? "border-emerald-400/50 bg-emerald-500/10 backdrop-blur-sm"
                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-full ${
                            isSelected
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-white/10 text-white/70"
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div
                            className={`font-bold text-base ${
                              isSelected ? "text-emerald-300" : "text-white"
                            }`}
                          >
                            {type.label}
                          </div>
                          <div
                            className={`text-sm ${
                              isSelected
                                ? "text-emerald-400/80"
                                : "text-white/60"
                            }`}
                          >
                            {type.description}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Image Upload */}
              <section className="p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-emerald-400" /> Attach
                  Images (max 5)
                </h2>

                {/* GRID: 2 images per row */}
                <div className="grid grid-cols-2 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10"
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover max-w-full"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        aria-label={`Remove image ${index + 1}`}
                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Upload tile (keeps the grid, acts as last cell) */}
                  {imagePreviews.length < 5 && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Camera className="w-6 h-6 text-white/50" />
                        <span className="text-sm text-white/60">
                          Add images
                        </span>
                      </div>
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </section>

              {/* Post Content */}
              <section className="p-6">
                <h2 className="text-lg font-bold text-white mb-4">
                  What's happening? *
                </h2>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    onFocus={() => setFocusedField("content")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Share important information with your community..."
                    className={`w-full h-32 px-4 py-4 bg-white/5 backdrop-blur-sm border-2 rounded-2xl text-white placeholder-white/50 focus:outline-none resize-none transition-all duration-300 ${
                      focusedField === "content"
                        ? "border-emerald-400 ring-1 ring-emerald-300/20 shadow-lg bg-white/10"
                        : "border-white/10 hover:border-white/20"
                    }`}
                    maxLength={500}
                  />
                  {focusedField === "content" && (
                    <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 blur-sm -z-10" />
                  )}
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-white/60 text-sm">Make it count</span>
                  <span
                    className={`text-sm ${
                      postText.length > 450 ? "text-red-400" : "text-white/60"
                    }`}
                  >
                    {postText.length}/500
                  </span>
                </div>
              </section>

              {/* Location */}
              <section className="p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  Location *
                </h2>
                <div className="relative">
                  <div className="relative">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        setShowLocationSuggestions(e.target.value.length > 0);
                      }}
                      onFocus={() => {
                        setFocusedField("location");
                        setShowLocationSuggestions(location.length > 0);
                      }}
                      onBlur={() => {
                        setFocusedField(null);
                        setTimeout(
                          () => setShowLocationSuggestions(false),
                          200
                        );
                      }}
                      placeholder="Enter your location..."
                      className={`w-full px-4 py-4 bg-white/5 backdrop-blur-sm border-2 rounded-2xl text-white placeholder-white/50 focus:outline-none transition-all duration-300 ${
                        focusedField === "location"
                          ? "border-emerald-400 ring-1 ring-emerald-300/20 shadow-lg bg-white/10"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    />
                    {focusedField === "location" && (
                      <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 blur-sm -z-10" />
                    )}
                  </div>

                  {/* Location Suggestions */}
                  {showLocationSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-emerald-950 border border-emerald-800/40 rounded-2xl shadow-2xl z-30 max-h-40 overflow-y-auto">
                      {locationSuggestions
                        .filter((loc) =>
                          loc.toLowerCase().includes(location.toLowerCase())
                        )
                        .map((loc) => (
                          <button
                            key={loc}
                            onClick={() => {
                              setLocation(loc);
                              setShowLocationSuggestions(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-white/10 active:bg-white/20 transition-colors border-b last:border-b-0 border-white/10"
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-emerald-400" />
                              <span className="text-white">{loc}</span>
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={getLocation}
                  className="mt-4 flex items-center gap-2 text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  Use current location
                </button>
              </section>

              {/* Tags */}
              <section className="p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-emerald-400" />
                  Tags (max 5)
                </h2>

                {/* Selected Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-3 py-2 rounded-full text-sm font-medium backdrop-blur-sm border border-emerald-400/30"
                      >
                        <span>#{tag}</span>
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-emerald-100 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Tag Input */}
                {tags.length < 5 && (
                  <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addTag()}
                        onFocus={() => setFocusedField("tag")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Add a tag..."
                        className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border-2 rounded-2xl text-white placeholder-white/50 focus:outline-none transition-all duration-300 ${
                          focusedField === "tag"
                            ? "border-emerald-400 ring-1 ring-emerald-300/20 shadow-lg bg-white/10"
                            : "border-white/10 hover:border-white/20"
                        }`}
                      />
                      {focusedField === "tag" && (
                        <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 blur-sm -z-10" />
                      )}
                    </div>
                    <button
                      onClick={addTag}
                      disabled={!newTag.trim()}
                      className="px-4 py-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 active:bg-emerald-700 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Quick Tags */}
                <div className="space-y-3">
                  <p className="text-sm text-white/60">Quick tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {commonTags.slice(0, 6).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => addCommonTag(tag)}
                        disabled={tags.includes(tag) || tags.length >= 5}
                        className="px-3 py-1.5 bg-white/10 text-white/80 rounded-full text-sm hover:bg-white/20 active:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors backdrop-blur-sm border border-white/10"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Preview (inside same card) */}
              {(postText.trim() || selectedImages || location.trim()) && (
                <section className="p-6">
                  <div className="bg-emerald-500/20 backdrop-blur-sm px-6 py-4 border-b border-emerald-400/30 rounded-t-2xl">
                    <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Preview
                    </h3>
                  </div>

                  <div className="p-6">
                    {/* Preview User Header */}
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-lime-400 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-white">
                            You
                          </span>
                          <span className="bg-emerald-500/30 text-emerald-300 text-xs px-2 py-0.5 rounded-full font-medium border border-emerald-400/30">
                            ✓
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-white/60">
                          <Clock className="w-3 h-3" />
                          <span>now</span>
                        </div>
                      </div>
                    </div>

                    {/* Preview Image Carousel */}
                    {imagePreviews.length > 0 && (
                      <div className="relative mb-4">
                        <div className="bg-white/5 aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 relative flex items-center justify-center">
                          <img
                            src={imagePreviews[currentImageIndex]}
                            alt={`Preview ${currentImageIndex}`}
                            className="w-full h-full object-cover"
                          />

                          {/* Left Arrow */}
                          {imagePreviews.length > 1 && (
                            <button
                              onClick={() =>
                                setCurrentImageIndex((prev) =>
                                  prev === 0
                                    ? imagePreviews.length - 1
                                    : prev - 1
                                )
                              }
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70"
                            >
                              &#8592;
                            </button>
                          )}

                          {/* Right Arrow */}
                          {imagePreviews.length > 1 && (
                            <button
                              onClick={() =>
                                setCurrentImageIndex((prev) =>
                                  prev === imagePreviews.length - 1
                                    ? 0
                                    : prev + 1
                                )
                              }
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70"
                            >
                              &#8594;
                            </button>
                          )}

                          {/* Post Type Badge */}
                          {selectedType && (
                            <div
                              className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg ${
                                selectedType === "alert"
                                  ? "bg-red-500 text-white"
                                  : selectedType === "update"
                                  ? "bg-orange-500 text-white"
                                  : "bg-blue-500 text-white"
                              }`}
                            >
                              {selectedType}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Preview Text */}
                    {postText.trim() && (
                      <p className="text-white/90 leading-relaxed text-base mb-4">
                        {postText}
                      </p>
                    )}

                    {/* Preview Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full text-xs font-medium border border-emerald-400/30"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Preview Location */}
                    {location && (
                      <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-medium text-white/80">
                          {location}
                        </span>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6 pb-8">
            <button
              onClick={handleSubmit}
              disabled={
                !postText.trim() || !selectedType || !location || isSubmitting
              }
              className={`px-12 py-4 rounded-2xl text-lg font-bold transition-all duration-300 relative overflow-hidden ${
                !postText.trim() || !selectedType || !location
                  ? "bg-white/10 border border-white/20 text-white/50 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-xl hover:shadow-emerald-500/50 hover:scale-105 active:scale-95"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Posting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5" /> Post
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(180deg);
          }
        }
      `}</style>
    </div>
  );
};

export default AddPost;
