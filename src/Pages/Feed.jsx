import React, { useState, useEffect } from "react";
import {
  MessageCircle,
  Share2,
  ArrowBigDown,
  User,
  MapPin,
  ArrowBigUp,
  Search,
  Filter,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// A custom class for the fade-in animation using Tailwind's keyframes
const fadeInAnimation = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Feed = () => {
  const navigate = useNavigate();
  const [likes, setLikes] = useState(247);
  const [downVotes, setDownVotes] = useState(20);
  const [isLiked, setIsLiked] = useState(false);
  const [isDownvoted, setIsDownvoted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [displayedPosts, setDisplayedPosts] = useState([]);
  const [filteredAndSortedPosts, setFilteredAndSortedPosts] = useState([]);
  // Dummy data for the posts
  useEffect(() => {
    const FetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/posts");
        setFilteredAndSortedPosts(res.data);
        console.log(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    FetchData();
  }, []);

  useEffect(() => {
    const finalPosts = filteredAndSortedPosts
      .filter((post) => {
        if (selectedFilter === "all") return true;
        return post.type.toLowerCase() === selectedFilter;
      })
      .filter(
        (post) =>
          post.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
      .sort((a, b) => {
        if (sortBy === "recent") return new Date(b.time) - new Date(a.time);
        if (sortBy === "popular")
          return b.likes - b.downVotes - (a.likes - a.downVotes);
        if (sortBy === "views") return b.views - a.views;
        return 0;
      });

    // Set the posts to be displayed after filtering + sorting
    setDisplayedPosts(finalPosts);
  }, [searchQuery, selectedFilter, sortBy, filteredAndSortedPosts]);

  const handleLike = (postId) => {
    setDisplayedPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id === postId) {
          const isAlreadyLiked = post.isLiked || false;
          const isAlreadyDownvoted = post.isDownvoted || false;

          return {
            ...post,
            likes: isAlreadyLiked ? post.likes - 1 : post.likes + 1,
            downVotes:
              isAlreadyDownvoted && !isAlreadyLiked
                ? post.downVotes - 1
                : post.downVotes,
            isLiked: !isAlreadyLiked,
            isDownvoted:
              isAlreadyDownvoted && !isAlreadyLiked
                ? false
                : isAlreadyDownvoted,
          };
        }
        return post;
      })
    );
  };

  const handleDownvote = (postId) => {
    setDisplayedPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id === postId) {
          const isAlreadyLiked = post.isLiked || false;
          const isAlreadyDownvoted = post.isDownvoted || false;

          return {
            ...post,
            downVotes: isAlreadyDownvoted
              ? post.downVotes - 1
              : post.downVotes + 1,
            likes:
              isAlreadyLiked && !isAlreadyDownvoted
                ? post.likes - 1
                : post.likes,
            isDownvoted: !isAlreadyDownvoted,
            isLiked:
              isAlreadyLiked && !isAlreadyDownvoted ? false : isAlreadyLiked,
          };
        }
        return post;
      })
    );
  };

  const handleShare = async (id, text = "Check this post") => {
  const shareUrl = `${window.location.origin}/post/${encodeURIComponent(id)}`;

  // Prefer Web Share API
  if (navigator.share) {
    try {
      await navigator.share({
        title: "Community Post",
        text,
        url: shareUrl,
      });
      // optionally show a success toast
      // toast.success("Shared!");
      return;
    } catch (err) {
      // user cancelled or share failed — fall through to copy fallback
      console.warn("Web Share failed:", err);
    }
  }

  // Fallback 1: copy to clipboard
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
      // toast.success("Link copied to clipboard!");
      return;
    } catch (err) {
      console.warn("Clipboard write failed:", err);
    }
  }

  // Fallback 2: open in new tab (guaranteed)
  window.open(shareUrl, "_blank", "noopener,noreferrer");
};


  return (
    <>
      <style>{fadeInAnimation}</style>

      {/* Page background (matches AddPost theme) */}
      <div className="min-h-screen min-w-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 relative overflow-hidden">
        {/* subtle overlay like AddPost */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-emerald-900/10 pointer-events-none" />

        {/* Mobile-First Header styled like AddPost header */}
        <div className="backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0 z-50">
          <div className="px-3 py-3 md:min-w-screen w-full">
            {/* Top Row - Search */}
            <div className="relative md:flex md:max-w-1/2 md:mx-auto mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-12 py-3 text-base border border-white/10 rounded-xl bg-white/5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-white/60 hover:text-emerald-400"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Pills with slide and fade transition */}
            <div
              className={`flex gap-2 overflow-x-auto md:justify-center pb-2 scrollbar-hide transition-all duration-500 ease-in-out ${
                showFilters ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {["all", "alert", "update", "notice"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setSelectedFilter(filter);
                    // The filter container will auto-hide when a filter is selected
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 capitalize ${
                    selectedFilter === filter
                      ? "bg-emerald-500 text-white shadow-md"
                      : "bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex mb-0 p-2 relative z-10">
          <div className="w-full max-w-3xl mx-auto">
            {displayedPosts.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Search className="w-12 h-12 text-white/40 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white/70 mb-2">
                  No posts found
                </h3>
                <p className="text-white/50 text-sm">
                  Try adjusting your search
                </p>
              </div>
            ) : (
              displayedPosts.map((post) => (
                <div
                  key={post._id}
                  onClick={() => navigate(`/post/${post._id}#Top`)}
                  className="block mx-auto w-full max-w-2xl animate-[fadeIn_0.5s_ease-in-out_forwards]"
                >
                  <div
                    className="backdrop-blur-xl bg-white/6 border border-white/10 rounded-3xl overflow-hidden my-6
          transition-all duration-300 ease-out 
          hover:shadow-xl hover:shadow-emerald-100/20 hover:-translate-y-1
          group cursor-pointer relative"
                  >
                    {/* Gradient background */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-600/10 to-emerald-400/6 -z-10 pointer-events-none" />

                    {/* User Info */}
                    <div className="flex items-center p-4 pb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-lime-400 rounded-full flex items-center justify-center">
                        <User className="w-7 h-7 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-bold text-lg text-white">
                          {post.user?.name} {/* ✅ user is an object */}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(post.createdAt).toLocaleString()}
                          </span>{" "}
                          {/* ✅ show real time */}
                          <span className="text-emerald-500">•</span>
                          <span className="text-emerald-300">
                            {post.ver ? "Verified User" : "Unverified"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content Image */}
                    <div className="relative">
                      <div className="bg-gradient-to-br from-gray-800/20 to-gray-700/10 aspect-[16/9] flex items-center justify-center overflow-hidden">
                        {post.images?.length > 0 && (
                          <img
                            src={post.images[0]} // ✅ use first image from array
                            alt="Post"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                      </div>
                      <div
                        className="absolute top-3 right-3 text-xs font-medium uppercase px-3 py-1 rounded-full"
                        style={{
                          background:
                            post.type.toLowerCase() === "alert"
                              ? "rgba(220, 38, 38, 0.95)"
                              : post.type.toLowerCase() === "update"
                              ? "rgba(249, 115, 22, 0.95)"
                              : "rgba(59,130,246,0.95)",
                          color: "#fff",
                        }}
                      >
                        {post.type}
                      </div>
                    </div>
                    {/* Post Text */}
                    <div className="p-4 pt-3">
                      <p className="text-white/90 leading-relaxed">
                        {post.text}
                        <br />
                        <span className="text-emerald-300 font-medium text-sm">
                          {post.tags.map((tag) => `#${tag}`).join(", ")}
                        </span>
                      </p>
                    </div>

                    {/* Location and Actions */}
                    <div className="px-4 pb-4">
                      <div className="flex items-center gap-2 text-sm md:text-base mb-4">
                        <span className="text-emerald-400">
                          <MapPin className="w-5 h-5" />
                        </span>
                        <span className="font-semibold text-emerald-300">
                          Location:
                        </span>
                        <span className="text-white/85 hover:text-emerald-300 transition-colors duration-200">
                          {post.location}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          {/* Likes */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLike(post._id);
                              }}
                              className="p-1 rounded-full transition-colors duration-200"
                            >
                              <ArrowBigUp
                                className={`w-6 h-6 transition-colors ${
                                  isLiked
                                    ? "fill-green-500 text-green-500"
                                    : "text-white/70 hover:text-green-400"
                                }`}
                              />
                            </button>
                            <span className="text-sm font-medium text-white/80">
                              {post.likes}
                            </span>
                          </div>

                          {/* Downvotes */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownvote(post._id);
                              }}
                              className="p-1 rounded-full transition-colors duration-200"
                            >
                              <ArrowBigDown
                                className={`w-6 h-6 transition-colors ${
                                  isDownvoted
                                    ? "fill-orange-500 text-orange-500"
                                    : "text-white/70 hover:text-orange-400"
                                }`}
                              />
                            </button>
                            <span className="text-sm font-medium text-white/80">
                              {post.downVotes}
                            </span>
                          </div>

                          {/* Comments */}
                          <div className="flex items-center space-x-2">
                            <Link to={`/post/${post._id}`}>
                              <button className="p-1 rounded-full transition-colors duration-200">
                                <MessageCircle className="w-6 h-6 text-white/70 hover:text-emerald-400" />
                              </button>
                            </Link>
                            <span className="text-sm font-medium text-white/80">
                              {post.comments.length}
                            </span>
                          </div>
                        </div>

                        <button onClick={(e)=>{
                          e.stopPropagation();
                          handleShare(post._id , post.text)
                        }} className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full transition-colors text-sm font-medium">
                          <Share2 className="w-4 h-4" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Feed;
