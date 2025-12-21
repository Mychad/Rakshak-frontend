import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllPosts, likePost, downVotePost } from "../controllers/Post.controller";
import axios from "axios";
import {
  MapPin,
  User,
  Plus,
  Search,
  Map as MapIcon,
  AlertCircle,
  Bell,
  Heart,
  ArrowRight,
  ArrowBigUp,
  ArrowBigDown,
  MessageCircle,
  Share2,
  Clock,
} from "lucide-react";

// Helper for post type color
const getPostTypeColor = (type) => {
  switch ((type || "").toLowerCase()) {
    case "alert":
      return "bg-red-600";
    case "update":
      return "bg-orange-500";
    case "notice":
      return "bg-blue-600";
    default:
      return "bg-emerald-600";
  }
};

export default function Home() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isDownvoted, setIsDownvoted] = useState(false);
  useEffect(() => {
    let mounted = true;
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getAllPosts();
        if (!mounted) return;
        console.log(res)
        const normalized = (res.data.data || []).map((p) => ({
          ...p,
          id: p.id || p._id || String(Math.random()),
          user:
            typeof p.user === "string"
              ? { name: p.user }
              : p.user || { name: "Unknown" },
          text: p.text || "",
          image:
            (p.images && p.images.length && p.images[0]) ||
            p.image ||
            "https://placehold.co/1200x900/1e293b/fff?text=No+Image",
          type: p.type || p.postType || "Notice",
          tags: p.tags,
          location: p.location || "Unknown",
          likes: p.likes,
          comments: Array.isArray(p.comments)
            ? p.comments
            : typeof p.comments === "number"
            ? p.comments
            : [],
          createdAt: p.createdAt || p.time || new Date().toISOString(),
          isLiked: !!p.isLiked,
          isDownvoted: !!p.isDownvoted,
        }));

        setPosts(normalized);
      } catch (err) {
        console.error(err);
        setError("Failed to load posts. Check server.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLike = async (postId) => {
    // optimistic update
    const prev = posts;
    setPosts((cur) =>
      cur.map((p) =>
        p._id === postId || p.id === postId
          ? {
              ...p,
              likes: { count: p.isLiked ? p.likes.count - 1 : p.likes.count + 1, users: p.likes.users },
              isLiked: !p.isLiked,
              // if we liked, ensure downvote cleared locally
              isDownvoted: p.isDownvoted && !p.isLiked ? false : p.isDownvoted,
            }
          : p
      )
    );

    try {
      const res = await likePost(postId);
      if (!(res && res.success && res.data)) throw new Error("Like API failed");
      const srv = res.data;
      // reconcile server counts
      setPosts((cur) =>
        cur.map((p) =>
          p._id === postId || p.id === postId
            ? {
                ...p,
                likes: { ...(p.likes || {}), count: srv.likesCount ?? (p.likes?.count || 0) },
                downVotes: { ...(p.downVotes || {}), count: srv.downVotesCount ?? (p.downVotes?.count || 0) },
                isLiked: typeof srv.liked === "boolean" ? srv.liked : p.isLiked,
                isDownvoted: typeof srv.downVoted === "boolean" ? srv.downVoted : p.isDownvoted,
              }
            : p
        )
      );
    } catch (err) {
      console.error(err);
      // rollback
      setPosts(prev);
      alert("Could not update like. Try again.");
    }
  };

  const handleDownvote = async (postId) => {
    const prev = posts;
    setPosts((cur) =>
      cur.map((p) =>
        p._id === postId || p.id === postId
          ? {
              ...p,
              downVotes: { count: p.isDownvoted ? p.downVotes.count - 1 : p.downVotes.count + 1, users: p.downVotes.users },
              isDownvoted: !p.isDownvoted,
              isLiked: p.isLiked && !p.isDownvoted ? false : p.isLiked,
            }
          : p
      )
    );

    try {
      const res = await downVotePost(postId);
      if (!(res && res.success && res.data)) throw new Error("Downvote API failed");
      const srv = res.data;
      setPosts((cur) =>
        cur.map((p) =>
          p._id === postId || p.id === postId
            ? {
                ...p,
                likes: { ...(p.likes || {}), count: srv.likesCount ?? (p.likes?.count || 0) },
                downVotes: { ...(p.downVotes || {}), count: srv.downVotesCount ?? (p.downVotes?.count || 0) },
                isLiked: typeof srv.liked === "boolean" ? srv.liked : p.isLiked,
                isDownvoted: typeof srv.downVoted === "boolean" ? srv.downVoted : p.isDownvoted,
              }
            : p
        )
      );
    } catch (err) {
      console.error(err);
      setPosts(prev);
      alert("Could not update downvote. Try again.");
    }
  };

  const handleShare = async (e, id, text = "Check this post") => {
    e?.stopPropagation();
    const shareUrl = `${window.location.origin}/post/${encodeURIComponent(id)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Community Post", text, url: shareUrl });
        return;
      } catch {}
    }
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied!");
        return;
      } catch {}
    }
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const filtered = useMemo(() => {
    const lowerQ = query.trim().toLowerCase();
    return posts.filter((p) => {
      const matchesFilter =
        filter === "All" ||
        (p.type || "").toLowerCase() === filter.toLowerCase();
      const haystack = `${p.text || ""} ${p.tags || ""} ${p.location || ""} ${
        p.user?.name || ""
      }`.toLowerCase();
      return matchesFilter && (lowerQ === "" || haystack.includes(lowerQ));
    });
  }, [posts, filter, query]);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      {/* Search + Filter */}
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:gap-4">
        <div className="flex-1 flex items-center bg-slate-800/50 backdrop-blur-sm rounded-full px-3 py-2">
          <Search className="w-4 h-4 text-white/60 mr-2" />
          <input
            placeholder="Search posts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent outline-none w-full text-sm text-white/90"
          />
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          {["All", "Alert", "Update", "Notice"].map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === c ? "bg-emerald-500" : "bg-slate-800/50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="max-w-6xl mx-auto px-0 space-y-4">
        {loading && (
          <div className="p-6 rounded-2xl bg-slate-800/50 text-center">
            Loading posts...
          </div>
        )}
        {error && (
          <div className="p-6 rounded-2xl bg-red-600/20 text-center text-red-400">
            {error}
          </div>
        )}

        {!loading &&
          filtered.map((post) => (
            <div
              key={post._id}
              className="cursor-pointer transform transition-all hover:scale-[1.01]"
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
                {/* {console.log(post)} */}
                <div
                  onClick={() => navigate(`/profile/${post.user._id}#Top`)}
                  className="flex items-center p-4 pb-3"
                >
                  <div className="w-12 h-12  rounded-full flex items-center justify-center">
                    <img className="rounded-full" src={post.user.profilePic || "https://img.freepik.com/premium-vector/user-profile-icon-circle_1256048-12499.jpg?semt=ais_hybrid&w=740&q=80"} alt="" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-lg text-white">
                      {post.user?.userId || "Unknown"}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(post.createdAt).toLocaleString()}
                      </span>{" "}
                    </div>
                  </div>
                </div>

                {/* Content Image */}
                <div
                  className="relative"
                  onClick={() => navigate(`/post/${post._id}#Top`)}
                >
                  <div className="bg-gradient-to-br from-gray-800/20 to-gray-700/10 aspect-[16/9] flex items-center justify-center overflow-hidden">
                    {post.images?.length > 0 && (
                      <img
                        src={post.images[0]}
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
                {console.log(post)}
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
                                post.isLiked
                                  ? "fill-green-500 text-green-500"
                                  : "text-white/70 hover:text-green-400"
                              }`}
                          />
                        </button>
                        <span className="text-sm font-medium text-white/80">
                          {post.likes.count}
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
                              post.isDownvoted
                                ? "fill-orange-500 text-orange-500"
                                : "text-white/70 hover:text-orange-400"
                            }`}
                          />
                        </button>
                        <span className="text-sm font-medium text-white/80">
                          {post.downVotes.count}
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

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(post._id, post.text);
                      }}
                      className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full transition-colors text-sm font-medium"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

        {!loading && filtered.length === 0 && (
          <div className="p-6 rounded-2xl bg-slate-800/50 text-center">
            <p className="text-white/80">No posts found for your search.</p>
            <Link
              to="/create-post"
              className="inline-flex items-center gap-2 mt-3 bg-emerald-500 px-4 py-2 rounded-full text-sm"
            >
              <Plus className="w-4 h-4" /> Create first post
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
