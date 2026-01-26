import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router";
import {
  Camera,
  X,
  Save,
  User,
  Sparkles,
  Check,
  ArrowLeft,
  Edit3,
  Image,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router";
import { getUserProfile, editProfile } from "../controllers/Profile.controller";
import { Link } from "react-router";
import toast from "react-hot-toast";
const ProfileEditForm = () => {
  const [profileData, setProfileData] = useState({
    _id: "",
    name: "",
    username: "",
    bio: "",
    profilePicUrl:
      "https://img.freepik.com/premium-vector/user-profile-icon-circle_1256048-12499.jpg?semt=ais_hybrid&w=740&q=80",
  });

  const navigate = useNavigate()
  const [editData, setEditData] = useState({ ...profileData });
  const [isHovering, setIsHovering] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const fileInputRef = useRef(null);
  const { id } = useParams();
  useEffect(() => {
    const fetchData = async () => {
      const res = await getUserProfile(id);
      const user = res.data.user;
      const newProfile = {
        _id: user._id,
        name: user.name,
        username: user.userId,
        bio: user.bio,
        profilePicUrl: user.profilePic,
      };
      setProfileData(newProfile);
      setEditData(newProfile);
    };
    fetchData();
  }, []);

  // subtle floating particles for background
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.25 + 0.05,
    }));
    setParticles(newParticles);
  }, []);

  // handle image selection
  const [selectedFile, setSelectedFile] = useState(null);
  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImageLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setTimeout(() => {
          setEditData({ ...editData, profilePicUrl: e.target.result });
          setImageLoading(false);
        }, 650);
      };
      reader.readAsDataURL(file);
    }
  };

  // save simulation
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await editProfile(editData, selectedFile);
      if (res?.data?.success) {
        // update local state from returned user (server has canonical URL)
        const serverUser = res.data.user;
        const newProfile = {
          _id: serverUser._id,
          name: serverUser.name,
          username: serverUser.userId || serverUser.username,
          bio: serverUser.bio || "",
          profilePicUrl:
            serverUser.profilePic || serverUser.profilePicUrl || "", // matches backend field
        };
        setProfileData(newProfile);
        setEditData(newProfile);
        toast.success("Profile updated");
        navigate('/profile')
      } else {
        toast.error(res?.data?.message || "Update failed");
      }
    } catch (err) {
      console.error("save error:", err);
      toast.error(err?.response?.data?.message || "Server error");
    } finally {
      setIsSaving(false);
    }
  };
  const handleCancel = () => {
    setEditData({ ...profileData });
  };

  const hasChanges = JSON.stringify(editData) !== JSON.stringify(profileData);

  return (
    <div className="min-h-screen min-w-screen  bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 relative overflow-hidden">
      {/* background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-emerald-500/30 animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              animation: `float ${
                particle.speed + 3
              }s ease-in-out infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-emerald-900/10" />

      <div className="relative z-10 min-h-screen flex items-center justify-center md:p-4">
        <div className="w-full max-w-md">
          {/* glass card */}
          <div className="backdrop-blur-xl bg-white/6 border border-white/10 md:rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            {/* card glow (theme colors) */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-600/15 to-emerald-400/10 blur-xl" />

            {/* header */}
            <div className="relative flex items-center justify-between mb-8">
              <Link
                to="/profile"
                className="p-3 rounded-2xl bg-white/6 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10 active:scale-95 transition-all duration-200 group"
              >
                <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </Link>

              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-100">
                  Edit Profile
                </h1>
              </div>

              <div className="w-11" />
            </div>

            {/* profile picture */}
            <div className="flex flex-col items-center mb-10">
              <div
                className="relative group cursor-pointer"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="relative w-32 h-32">
                  {/* animated ring in theme */}
                  <div
                    className="absolute inset-0 rounded-full p-1"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(16,185,129,0.12), rgba(16,185,129,0.06))",
                    }}
                  >
                    <div className="w-full h-full rounded-full bg-slate-900" />
                  </div>

                  <div className="absolute inset-2 rounded-full overflow-hidden border-4 border-white/10 backdrop-blur-sm">
                    {imageLoading ? (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-500/8">
                        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    ) : (
                      <img
                        src={editData.profilePicUrl}
                        alt="Profile"
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://placehold.co/150x150/0f172a/white?text=User";
                        }}
                      />
                    )}
                  </div>

                  <div
                    className={`absolute inset-2 rounded-full bg-black/50 flex items-center justify-center transition-all duration-300 ${
                      isHovering ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <div className="text-center text-white">
                      <Camera className="w-8 h-8 mx-auto mb-2" />
                      <span className="text-sm font-medium">Change Photo</span>
                    </div>
                  </div>

                  <button className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-3 shadow-2xl hover:shadow-emerald-500/50 hover:scale-110 active:scale-95 transition-all duration-200 group">
                    <Camera className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              <div className="text-center mt-4">
                <div className="flex items-center gap-2 justify-center mb-2">
                  <Image className="w-4 h-4 text-emerald-400" />
                  <span className="text-white/80 font-medium">
                    Profile Photo
                  </span>
                </div>
                <p className="text-white/60 text-sm">
                  Click to update your profile picture
                </p>
              </div>
            </div>

            {/* form */}
            <div className="space-y-6">
              {/* name */}
              <div className="relative">
                <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-4 bg-white/5 backdrop-blur-sm border-2 rounded-2xl text-white placeholder-white/50 focus:outline-none transition-all duration-300 ${
                      focusedField === "name"
                        ? "border-emerald-400 ring-1 ring-emerald-300/10 shadow-sm bg-white/5"
                        : "border-white/10 hover:border-white/20"
                    }`}
                    placeholder="Enter your full name"
                  />
                  {focusedField === "name" && (
                    <div className="absolute inset-0 rounded-2xl bg-emerald-500/6 blur-sm -z-10" />
                  )}
                </div>
              </div>

              {/* username */}
              <div className="relative">
                <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-emerald-400" />
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={editData.username}
                    onChange={(e) =>
                      setEditData({ ...editData, username: e.target.value })
                    }
                    onFocus={() => setFocusedField("username")}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-4 bg-white/5 backdrop-blur-sm border-2 rounded-2xl text-white placeholder-white/50 focus:outline-none transition-all duration-300 ${
                      focusedField === "username"
                        ? "border-emerald-400 ring-1 ring-emerald-300/10 shadow-sm bg-white/5"
                        : "border-white/10 hover:border-white/20"
                    }`}
                    placeholder="Choose a username"
                  />
                  {focusedField === "username" && (
                    <div className="absolute inset-0 rounded-2xl bg-emerald-500/6 blur-sm -z-10" />
                  )}
                </div>
              </div>

              {/* bio */}
              <div className="relative">
                <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  Bio
                </label>
                <div className="relative">
                  <textarea
                    value={editData.bio}
                    onChange={(e) =>
                      setEditData({ ...editData, bio: e.target.value })
                    }
                    onFocus={() => setFocusedField("bio")}
                    onBlur={() => setFocusedField(null)}
                    rows={4}
                    className={`w-full px-4 py-4 bg-white/5 backdrop-blur-sm border-2 rounded-2xl text-white placeholder-white/50 focus:outline-none resize-none transition-all duration-300 ${
                      focusedField === "bio"
                        ? "border-emerald-400 ring-1 ring-emerald-300/10 shadow-sm bg-white/5"
                        : "border-white/10 hover:border-white/20"
                    }`}
                    placeholder="Tell us about yourself..."
                  />
                  {focusedField === "bio" && (
                    <div className="absolute inset-0 rounded-2xl bg-emerald-500/6 blur-sm -z-10" />
                  )}
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span className="text-white/50 text-sm">
                    Make it memorable
                  </span>
                  <span
                    className={`text-sm ${
                      editData.bio.length > 100
                        ? "text-emerald-400"
                        : "text-white/50"
                    }`}
                  >
                    {editData.bio.length}/500
                  </span>
                </div>
              </div>
            </div>

            {/* actions */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className={`flex-1 py-4 px-6 rounded-2xl font-medium transition-all duration-300 relative overflow-hidden ${
                  hasChanges && !isSaving
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-sm hover:shadow-sm hover:scale-[1.02] active:scale-95"
                    : "bg-white/8 border border-white/10 text-white/50 cursor-not-allowed"
                }`}
              >
                {isSaving ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </div>
                )}

                {hasChanges && !isSaving && (
                  <div className="absolute inset-0 bg-emerald-500/10 blur-sm -z-10" />
                )}
              </button>
            </div>

            {hasChanges && !isSaving && (
              <div className="mt-4 flex items-center justify-center gap-2 text-emerald-400 text-sm">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span>You have unsaved changes</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* custom animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(180deg);
          }
        }
        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ProfileEditForm;
