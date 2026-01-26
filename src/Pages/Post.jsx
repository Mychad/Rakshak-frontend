import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Link, useParams } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Share2,
  ArrowBigDown,
  User,
  MapPin,
  Clock,
  ArrowLeft,
  Send,
  Loader,
  Trash2,
  MoreVertical,
  Pencil,
} from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import {
  getAllPosts,
  getPostById,
  downVotePost,
  likePost,
  removeComment,
  removePost,
} from "../controllers/Post.controller";
import { addComment } from "../controllers/Post.controller";
import { toast } from "react-hot-toast";
import { getUserProfileWithUser } from "../controllers/Profile.controller";
const getPostTypeColor = (type) => {
  const t = (type || "").toLowerCase();
  switch (t) {
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

export default function Post() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [user, setUser] = useState({
    _id: "",
    name: "",
    userId: "",
    profilePic: "",
  });
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [isDownvoted, setIsDownvoted] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [likes, setLikes] = useState(0);
  const [downVotes, setDownVotes] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSame, setIsSame] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  // recommendations (all posts from backend)
  const [recommendations, setRecommendations] = useState([]);
  const [openCommentMenu, setOpenCommentMenu] = useState(null);

  // fetch single post
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await getPostById(id);
        setIsSame(res.data.data.isSame);
        if (res.data.data) {
          const p = res.data.data.resp;
          setPost(p);
          setLikes(p.likes?.count || 0);
          setDownVotes(p.downVotes?.count || 0);
          setComments(p.comments || []);

          // derive whether current user liked/downvoted (if user in localStorage)
          try {
            const stored = localStorage.getItem("user");
            if (stored) {
              const currentUser = JSON.parse(stored);
              const uid = currentUser?.id || currentUser?._id;
              if (uid) {
                const likeUsers = (p.likes && p.likes.users) || [];
                const downUsers = (p.downVotes && p.downVotes.users) || [];
                // compare as strings
                setIsLiked(likeUsers.some((u) => String(u) === String(uid)));
                setIsDownvoted(
                  downUsers.some((u) => String(u) === String(uid))
                );
              }
            }
          } catch (e) {
            // ignore parsing errors
          }
        } else {
          setPost(null);
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    const fetchUser = async () => {
      const res = await getUserProfileWithUser();
      const { user } = res.data;
      setUser({
        _id: user._id,
        name: user.name,
        userId: user.userId,
        profilePic: user.profilePic,
      });
    };

    fetchData();
    fetchUser();
  }, [id]);

  // fetch all posts for recommendations
  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await getAllPosts();
        if (Array.isArray(res.data.data)) {
          setRecommendations(res.data.data);
        } else {
          setRecommendations([]);
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
        // don't set global error state here to avoid clobbering post error UI
      }
    };
    fetchRecs();
  }, []);

  // Filter recommendations by same type as current post (case-insensitive)
  const filteredRecommendations =
    post && Array.isArray(recommendations)
      ? recommendations.filter(
          (r) =>
            (r.type || "").toLowerCase() === (post.type || "").toLowerCase() &&
            // exclude the current post itself
            (r._id || r.id) !== (post._id || post.id)
        )
      : [];

  const pendingRef = useRef({ like: false, downvote: false });
  const lastTapRef = useRef(0);

  // actions (local optimistic)
  const handleLike = async (postId) => {
    if (pendingRef.current.like) return; // prevent concurrent requests
    pendingRef.current.like = true;

    // snapshot for rollback
    const snapshot = { likes, downVotes, isLiked, isDownvoted };

    // optimistic UI update
    if (isLiked) {
      setLikes((s) => Math.max(0, s - 1));
      setIsLiked(false);
    } else {
      setLikes((s) => s + 1);
      setIsLiked(true);
      if (isDownvoted) {
        setDownVotes((s) => Math.max(0, s - 1));
        setIsDownvoted(false);
      }
    }

    try {
      const res = await likePost(postId); // your API call
      // API wrapper returns { success: true, data: <backend response> }
      if (res?.success && res.data) {
        const srv = res.data; // backend: { success, liked, likesCount, downVotesCount }
        if (srv.likesCount != null) setLikes(srv.likesCount);
        if (srv.downVotesCount != null) setDownVotes(srv.downVotesCount);
        if (typeof srv.liked === "boolean") setIsLiked(srv.liked);
        if (typeof srv.downVoted === "boolean") setIsDownvoted(srv.downVoted);
      }
    } catch (err) {
      console.error("Like API failed:", err);
      // rollback UI
      setLikes(snapshot.likes);
      setDownVotes(snapshot.downVotes);
      setIsLiked(snapshot.isLiked);
      setIsDownvoted(snapshot.isDownvoted);
      alert("Could not update like. Try again.");
    } finally {
      pendingRef.current.like = false;
    }
  };

  const handleShare = () => {
    if (!post) return;
    if (navigator.share) {
      navigator.share({
        title: "Community Post",
        text: post.text,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleDownvote = async (postId) => {
    if (pendingRef.current.downvote) return;
    pendingRef.current.downvote = true;

    const snapshot = { likes, downVotes, isLiked, isDownvoted };

    // optimistic UI update
    if (isDownvoted) {
      setDownVotes((s) => Math.max(0, s - 1));
      setIsDownvoted(false);
    } else {
      setDownVotes((s) => s + 1);
      setIsDownvoted(true);
      if (isLiked) {
        setLikes((s) => Math.max(0, s - 1));
        setIsLiked(false);
      }
    }

    try {
      const res = await downVotePost(postId); // your API call
      if (res?.success && res.data) {
        const srv = res.data; // backend: { success, downVoted, likesCount, downVotesCount }
        if (srv.likesCount != null) setLikes(srv.likesCount);
        if (srv.downVotesCount != null) setDownVotes(srv.downVotesCount);
        if (typeof srv.liked === "boolean") setIsLiked(srv.liked);
        if (typeof srv.downVoted === "boolean") setIsDownvoted(srv.downVoted);
      }
    } catch (err) {
      console.error("Downvote API failed:", err);
      // rollback UI
      setLikes(snapshot.likes);
      setDownVotes(snapshot.downVotes);
      setIsLiked(snapshot.isLiked);
      setIsDownvoted(snapshot.isDownvoted);
      alert("Could not update downvote. Try again.");
    } finally {
      pendingRef.current.downvote = false;
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    if (isSending) return;

    try {
      setIsSending(true);

      const payload = {
        user: { _id: user._id },
        text: newComment,
        post: id,
      };

      const res = await addComment(payload);

      // backend se jo aaya wahi truth hai
      setComments((prev) => [...prev, res.data.comment]);
      setNewComment("");

      toast.success("Comment added");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to add comment");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAddComment();
  };

  const handleDoubleTap = (postId) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // trigger like (use optimistic handler)
      handleLike(postId);
    }
    lastTapRef.current = now;
  };

  const handleDeletePost = async (id) => {
    try {
      const res = await removePost(id);

      if (res?.success) {
        toast.success("Post deleted successfully");
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete post");
    }
  };

  const handleEditPost = (id) => {
    navigate(`/post/edit/${id}`);
  };
  const handleDeleteComment = async (commentId, postId) => {
    try {
      const res = await removeComment(commentId, postId);
      if (res?.success) {
        setComments((prev) =>
          prev.filter((comment) => comment._id !== commentId)
        );
        toast.success("Comment deleted");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete comment");
    }
  };

  const ImageCarousel = ({ images = [], type }) => {
  const [index, setIndex] = useState(0);
  const startX = useRef(0);

  const next = () => {
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prev = () => {
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // 📱 swipe handlers
  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    const diff = startX.current - e.changedTouches[0].clientX;
    if (diff > 50) next();
    if (diff < -50) prev();
  };

  return (
    <div className="relative mt-3 rounded-xl overflow-hidden bg-black/20">
      {/* Image */}
      <div
        className="aspect-square md:aspect-[4/3] overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={images[index]}
          alt={`post-${index}`}
          className="w-full h-full object-cover transition-all duration-300"
          onError={(e) => {
            e.target.src =
              "https://placehold.co/1200x900/1e293b/fff?text=Image+Not+Found";
          }}
        />
      </div>

      {/* Desktop Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 p-2 rounded-full text-white"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={next}
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 p-2 rounded-full text-white"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Indicator Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition ${
                i === index ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}

      {/* Post Type Badge */}
      <div
        className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${getPostTypeColor(
          type
        )} text-white`}
      >
        {type}
      </div>
    </div>
  );
};


  // loading / error UI
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white text-xl">
        <Loader className="w-8 h-8 animate-spin mr-3" />
        Loading post...
      </div>
    );
  }
  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="backdrop-blur-xl bg-slate-900/60 p-8 rounded-2xl border border-white/10 max-w-lg w-full">
          <h1 className="text-2xl font-bold text-red-500 mb-2">
            Post Not Found 😔
          </h1>
          <p className="text-white/80 mb-6">
            It looks like this post doesn't exist or was deleted.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  // main render
  return (
    <div id="Top">
      <div className="min-h-screen min-w-screen relative font-sans text-white overflow-hidden">
        <div className="absolute inset-0" />

        {/* Desktop Header */}
        <div className="hidden md:block p-6 pb-0 relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-emerald-300 hover:text-emerald-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-emerald-300" />
            <span className="font-medium text-white/90">Back to Feed</span>
          </Link>
        </div>

        {/* Mobile Header */}
        <div className="sticky top-0 z-50 bg-slate-900/60 border-b border-white/10 md:hidden shadow-sm backdrop-blur-xl">
          <div className="flex items-center p-4">
            <Link
              to="/"
              className="p-2 -ml-2 rounded-full transition-colors duration-200 ease-in-out hover:bg-white/6 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-30"
            >
              <ArrowLeft className="w-6 h-6 text-emerald-300" />
            </Link>
            <h1 className="font-bold text-lg text-white flex-1 text-center truncate">
              Post
            </h1>
            <div className="w-6 h-6 -mr-2" />
          </div>
        </div>

        <div className="md:flex mb-5">
          <div className="flex flex-col md:flex-row max-w-6xl mx-auto gap-6 mt-5 mb-5 px-4 md:px-0">
            <div className="flex-1">
              {/* Post Container */}
              <div className="backdrop-blur-xl bg-slate-900/60 rounded-2xl border border-white/10 transition-all duration-300 ease-out">
                {/* User Info */}
                <div className="flex items-center p-4 pb-3">
                  {/* Profile Pic */}
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      src={
                        post.user.profilePic ||
                        "https://img.freepik.com/premium-vector/user-profile-icon-circle_1256048-12499.jpg"
                      }
                      alt="user"
                    />
                  </div>

                  {/* User + Time */}
                  <div
                    onClick={() => navigate(`/profile/${post.user._id}#Top`)}
                    className="ml-3 cursor-pointer"
                  >
                    <h3 className="font-semibold text-white">
                      {post.user?.userId || "Unknown"}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(post.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </div>
                  </div>

                  {/* 3 Dots Menu (ONLY OWNER) */}
                  {isSame && (
                    <div className="ml-auto relative">
                      <button
                        onClick={() => setShowMenu((v) => !v)}
                        className="p-2 rounded-full hover:bg-white/10 transition"
                      >
                        <MoreVertical className="w-5 h-5 text-white/70" />
                      </button>

                      {showMenu && (
                        <div className="absolute right-[-46%]  mt-2 w-44 rounded-xl bg-slate-800 border border-white/10 shadow-xl z-50">
                          <button
                            onClick={() => {
                              setShowMenu(false);
                              handleDeletePost(post._id);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Post
                          </button>
                          <button
                            onClick={() => {
                              setShowMenu(false);
                              handleEditPost(post._id);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-gray-400 hover:bg-red-500/10 rounded-xl"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit Post
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Content Images */}
                {post.images?.length > 0 && (
                  <ImageCarousel images={post.images} type={post.type} />
                )}

                {/* Post Text */}
                <div className="p-4 pt-3">
                  <p className="text-white/90 leading-relaxed">
                    {post.text}
                    <br />
                    <span className="text-emerald-300 font-medium">
                      {Array.isArray(post.tags)
                        ? post.tags.join(", ")
                        : post.tags}
                    </span>
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm md:text-base mb-6 mx-4 p-3 bg-white/5 rounded-lg border border-white/6">
                    <MapPin className="w-5 h-5 text-emerald-300" />
                    <span className="font-medium text-white/90">Location:</span>
                    <span className="text-emerald-300 hover:text-emerald-200 cursor-pointer font-medium">
                      {post.location}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={() => handleLike(post._id)}
                        className="flex items-center space-x-2 group"
                      >
                        <Heart
                          className={`w-6 h-6 ${
                            isLiked
                              ? "fill-red-500 text-red-500"
                              : "text-white/70 group-hover:text-red-400"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            isLiked ? "text-red-400" : "text-white/80"
                          }`}
                        >
                          {likes}
                        </span>
                      </button>

                      <button
                        onClick={() => handleDownvote(post._id)}
                        className="flex items-center space-x-2 group"
                      >
                        <ArrowBigDown
                          className={`w-6 h-6 ${
                            isDownvoted
                              ? "text-orange-400"
                              : "text-white/70 group-hover:text-orange-400"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            isDownvoted ? "text-orange-400" : "text-white/80"
                          }`}
                        >
                          {downVotes}
                        </span>
                      </button>

                      <button className="flex items-center space-x-2 group">
                        <MessageCircle className="w-6 h-6 text-white/70 group-hover:text-emerald-300" />
                        <span className="text-sm font-medium text-white/80 group-hover:text-emerald-300">
                          {comments.length}
                        </span>
                      </button>
                    </div>

                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Share</span>
                    </button>
                  </div>
                </div>

                {/* Comments */}
                {showComments && (
                  <div className="border-t border-white/10 bg-slate-900/50">
                    <div className="p-4 border-b border-white/6">
                      <div className="flex space-x-3 items-center">
                        <div className="w-12 h-12  rounded-full flex items-center justify-center">
                          <img
                            className="rounded-full"
                            src={
                              user.profilePic ||
                              "https://img.freepik.com/premium-vector/user-profile-icon-circle_1256048-12499.jpg?semt=ais_hybrid&w=740&q=80"
                            }
                            alt=""
                          />
                        </div>
                        <div className="flex-1 flex space-x-2">
                          <input
                            type="text"
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isSending}
                            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white/90 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                          />
                          <button
                            onClick={handleAddComment}
                            disabled={!newComment.trim() || isSending}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium"
                          >
                            {isSending ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {comments.map((comment) => {
                        const isCommentOwner =
                          comment.user?._id?.toString() === user._id;

                        return (
                          <div
                            key={comment._id}
                            className="p-4 border-b border-white/6 last:border-b-0"
                          >
                            <div className="flex space-x-3">
                              {/* Avatar */}
                              <div className="w-12 h-12 rounded-full overflow-hidden">
                                <img
                                  className="w-full h-full object-cover rounded-full"
                                  src={
                                    comment.user.profilePic ||
                                    "https://img.freepik.com/premium-vector/user-profile-icon-circle_1256048-12499.jpg"
                                  }
                                  alt="user"
                                />
                              </div>

                              {/* Content */}
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-sm text-white">
                                      {comment.user.userId}
                                    </span>
                                    <span className="text-xs text-white/60">
                                      {new Date(
                                        comment.createdAt
                                      ).toLocaleString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      })}
                                    </span>
                                  </div>

                                  {/* 3 dots menu (ONLY comment owner) */}
                                  {isCommentOwner && (
                                    <div className="relative">
                                      <button
                                        onClick={() =>
                                          setOpenCommentMenu(
                                            openCommentMenu === comment._id
                                              ? null
                                              : comment._id
                                          )
                                        }
                                        className="p-1 rounded-full hover:bg-white/10 transition"
                                      >
                                        <MoreVertical className="w-4 h-4 text-white/70" />
                                      </button>

                                      {openCommentMenu === comment._id && (
                                        <div className="absolute right-[-50%] top-[80%] w-40  rounded-xl bg-slate-800 border border-white/10 shadow-xl z-50">
                                          <button
                                            onClick={() => {
                                              setOpenCommentMenu(null);
                                              handleDeleteComment(
                                                comment._id,
                                                post._id
                                              );
                                            }}
                                            className="flex items-center gap-2 w-full px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-xl"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <p className="text-sm text-white/80">
                                  {comment.text}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="w-full md:w-80 flex-shrink-0 space-y-4 px-4 md:px-0">
              <h2 className="text-lg font-semibold text-white mt-4 md:mt-0">
                Recommended for You
              </h2>

              {filteredRecommendations.length > 0 ? (
                filteredRecommendations.map((rec) => (
                  <Link to={`/post/${rec._id}`} key={rec._id}>
                    <div className="group backdrop-blur-sm bg-slate-900/60 mb-5 rounded-lg border border-white/10 overflow-hidden transition-all duration-300 ease-in-out hover:scale-[1.03] hover:shadow-xl hover:border-emerald-500/40">
                      <div className="relative">
                        <div className="aspect-[4/3] bg-slate-800/60 overflow-hidden">
                          <img
                            src={rec.images?.[0] || ""}
                            alt=""
                            className="w-full h-full object-cover transition-all duration-300 ease-in-out group-hover:brightness-110 group-hover:scale-105"
                            onError={(e) =>
                              (e.target.src =
                                "https://placehold.co/1200x900/1e293b/fff?text=Image+Not+Found")
                            }
                          />
                        </div>
                        <div
                          className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${getPostTypeColor(
                            rec.type
                          )} text-white`}
                        >
                          {rec.type}
                        </div>
                      </div>
                      <div className="p-3 transition-colors duration-300 group-hover:bg-slate-800/50">
                        <h3 className="text-sm font-medium text-white">
                          {rec.user?.name || rec.user || "Unknown"}
                        </h3>
                        <p className="text-xs text-white/60">
                          {new Date(
                            rec.createdAt || rec.time || Date.now()
                          ).toLocaleString()}
                        </p>
                        <p className="text-sm text-white/80 mt-2 line-clamp-3">
                          {rec.text}
                        </p>
                        <p className="text-xs text-emerald-300 mt-1">
                          {Array.isArray(rec.tags)
                            ? rec.tags.join(", ")
                            : rec.tags}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-white/60 text-sm">No similar posts found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
