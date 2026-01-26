import React, { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, Grid, Eye, Plus, Edit3 } from "lucide-react";
import { Link } from "react-router";
import { useParams } from "react-router";
import { getUserProfile , getUserProfileWithUser } from "../controllers/Profile.controller.js";
import { useNavigate } from "react-router";
const App = () => {
  const [profileData, setProfileData] = useState({
    _id : "",
    name: "",
    username: "",
    bio: "",
    profilePicUrl:
      "https://img.freepik.com/premium-vector/user-profile-icon-circle_1256048-12499.jpg?semt=ais_hybrid&w=740&q=80",
  });

  const isVerified = true;
  const [posts, setPosts] = useState([]);
  const [isSame, setIsSame] = useState(null);
  // Subtle particles for background animation
  const [particles, setParticles] = useState([]);
  const { id } = useParams();
  useEffect(() => {
    const fetchUserData = async () => {
      let res = {}
      if(id){
         res = await getUserProfile(id);
      }
      if(!id){
        res = await getUserProfileWithUser()
      }
      const user = res.data.user;
      setProfileData({
        _id : user._id,
        name: user.name,
        username: user.userId,
        bio: user.bio,
        profilePicUrl:
          user.profilePic && user.profilePic.trim() !== ""
            ? user.profilePic
            : "https://img.freepik.com/premium-vector/user-profile-icon-circle_1256048-12499.jpg?semt=ais_hybrid&w=740&q=80",
        length: user.posts.length || 0,
      });
      setIsSame(res.data.isSame);
      setPosts(res.data.user.posts);
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const arr = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 15 + 10,
      opacity: Math.random() * 0.15 + 0.05,
    }));
    setParticles(arr);
  }, []);

  const navigate = useNavigate()

  const handleBackClick = () => {
    // Mock navigation - replace with actual navigation logic
    console.log("Navigate back");
  };

  const handleEditProfile = () => {
    // Mock navigation - replace with actual navigation logic
    console.log("Navigate to edit profile");
  };

  const handleAddPost = () => {
    // Mock navigation - replace with actual navigation logic
    console.log("Navigate to add post");
  };

  const handlePostClick = (postId) => {
    // Mock navigation - replace with actual navigation logic
    navigate(`/post/${postId}`)
  };

  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-emerald-400/20 animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              animationDuration: `${particle.speed}s`,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-emerald-900/10" />

      <div className="relative min-h-screen md:p-4 ">
        <div className="w-full max-w-4xl mx-auto md:space-y-4">
          {/* Main Profile Card */}
          <div className="backdrop-blur-xl bg-white/8 border border-white/20 md:rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-emerald-400/5" />

            {/* Header */}
            <div className="relative flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Link
                  to="/"
                  className="p-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-200 touch-manipulation"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-100">
                  My Profile
                </h1>
              </div>
            </div>

            {/* Profile Info */}
            <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className={"w-30 h-30 sm:w-28 sm:h-28 rounded-full overflow-hidden p-1"}>
                    <img
                      src={profileData.profilePicUrl}
                      alt="Profile"
                      className="object-cover rounded-full w-full h-full"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150";
                      }}
                    />
                  </div>
                  {isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1  sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {profileData.name}
                  </h2>
                  <div className="text-sm text-emerald-300 font-medium">
                    @{profileData.username}
                  </div>
                </div>

                <p className="text-white/80 text-sm sm:text-base mb-4 leading-relaxed max-w-md">
                  {profileData.bio}
                </p>

                <div className="flex  sm:justify-start">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20">
                    <div className="text-lg font-bold text-white">
                      {profileData.length}
                    </div>
                    <div className="text-sm text-white/70">posts</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Profile Button */}
            {isSame && (
              <div className="relative flex sm:justify-start">
                <Link
                  to={`/profile/edit/${profileData._id}`}
                  className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium shadow-lg hover:shadow-emerald-500/25 hover:scale-105 transition-all duration-200 touch-manipulation"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </Link>
              </div>
            )}
          </div>

          {/* Posts Grid Card */}
          <div className="backdrop-blur-xl bg-white/8 border border-white/20 md:rounded-2xl p-4 px-2 sm:p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-emerald-400/3" />

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                  <Grid className="w-5 h-5 text-emerald-400" />
                  Posts
                </h3>
                {isSame && (
                  <Link
                    to="/post/add"
                    className="p-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 hover:bg-emerald-500/30 transition-all duration-200 touch-manipulation"
                  >
                    <Plus className="w-5 h-5" />
                  </Link>
                )}
              </div>

              {posts.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="text-white/60 text-lg mb-2">No posts yet</div>
                  <div className="text-white/40 text-sm">
                    Share your first moment!
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1 sm:gap-2">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="group relative aspect-square overflow-hidden rounded-lg sm:rounded-xl bg-white/5"
                    >
                      <img
                        src={post.images[0]}
                        alt={`Post ${post.id}`}
                        className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://images.pexels.com/photos/258249/pexels-photo-258249.jpeg?auto=compress&cs=tinysrgb&w=400";
                        }}
                      />
                      <button
                        onClick={() => handlePostClick(post._id)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 touch-manipulation"
                      >
                        <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
