import React, { use, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Eye,
  EyeOff,
  Info,
  Lock,
  Shield,
  BookOpen,
  GraduationCap,
  Users,
  Play,
  Monitor,
  Smartphone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ApiClient from "../ApiClient";
function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [samepassword, setSamepassword] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginType, setLoginType] = useState("Student Login");
  const navigate = useNavigate()
  const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // userId allows lowercase letters, numbers and underscore (same as schema match)
  const userIdRegex = /^[a-z0-9_]+$/;

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setName("");
    setUserId("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setSamepassword(true);
  };

  const isFormValid = isLogin
    ? email.trim() !== "" && password.trim() !== ""
    : name.trim() !== "" &&
      userId.trim() !== "" &&
      email.trim() !== "" &&
      password.trim() !== "" &&
      confirmPassword.trim() !== "";

 const HandleLogin = async (e) => {
  e.preventDefault();

  if (!strictEmailRegex.test(email)) {
    toast.error("Please enter a valid email");
    return;
  }

  try {
    const res = await ApiClient.post("/auth/login", {
      email: email.trim().toLowerCase(),
      password,
    });

    // backend return format:
    // { token, user: { id, name, email, role } }
    const { token, user } = res.data;

    // store token for future requests
    localStorage.setItem("token", token);
    // optionally store user info
    localStorage.setItem("user", JSON.stringify(user));

    toast.success("Successfully logged in!");
    navigate("/")

    setEmail(""); 
    setPassword("");
  } catch (err) {
    toast.error(err.response?.data?.message || "Login failed");
  }
};

const HandleRegister = async (e) => {
  e.preventDefault();
  setSamepassword(true);

  // Password match check
  if (password !== confirmPassword) {
    setSamepassword(false);
    return;
  }

  // UserId validation
  if (!userIdRegex.test(userId.trim().toLowerCase())) {
    toast.error("UserId invalid. Use lowercase letters, numbers and underscore only");
    return;
  }

  // Email validation
  if (!strictEmailRegex.test(email)) {
    toast.error("Please enter a valid email");
    return;
  }

  try {
    const payload = {
      name: name.trim(),
      userId: userId.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      password,
      role: "user", // public register ke liye default role user
    };

    // 🔹 CHANGE: point to public register route
    const res = await ApiClient.post("/auth/register", payload);

    // backend return format:
    // { message, user: { id, name, email, role, userId, createdAt } }
    const { user } = res.data;

    toast.success("Successfully registered!");
    console.log("Signup response:", res.data);

    // Clear form
    setName("");
    setUserId("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setIsLogin(true); // switch to login
  } catch (err) {
    toast.error(err.response?.data?.message || "Registration failed");
  }
};


  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex">
        {/* Toast Notification */}
        {toast.show && (
          <div
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl ${
              toast.type === "success"
                ? "bg-emerald-500 text-white border border-emerald-400"
                : "bg-red-500 text-white border border-red-400"
            } transition-all duration-300 backdrop-blur-sm`}
          >
            <div className="flex items-center space-x-2">
              {toast.type === "success" ? (
                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
              ) : (
                <Info className="w-4 h-4" />
              )}
              <span className="font-medium">{toast.message}</span>
            </div>
          </div>
        )}

        {/* Left Side - Educational Content with Floating Elements */}
        <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-emerald-50 via-lime-50 to-green-100 hidden lg:flex">
          {/* Floating Background Elements (Large Screens) */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Large decorative circles */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-200/30 rounded-full animate-pulse blur-xl"></div>
            <div className="absolute top-20 left-40 w-32 h-32 bg-lime-200/40 rounded-full animate-bounce-slow"></div>
            <div className="absolute top-60 left-20 w-24 h-24 bg-green-200/50 rounded-full animate-float"></div>
            <div className="absolute bottom-40 left-60 w-28 h-28 bg-emerald-300/25 rounded-full animate-pulse-slow"></div>
            <div className="absolute bottom-10 left-40 w-36 h-36 bg-lime-100/60 rounded-full blur-lg"></div>

            {/* Small floating circles */}
            <div className="absolute top-40 left-60 w-8 h-8 bg-emerald-300/60 rounded-full animate-float-delayed"></div>
            <div className="absolute top-80 left-40 w-6 h-6 bg-lime-400/50 rounded-full animate-bounce-slow"></div>
            <div className="absolute bottom-60 left-80 w-4 h-4 bg-green-400/70 rounded-full animate-pulse"></div>

            {/* Security themed floating icons moved from the right side */}
            <div className="absolute top-32 right-10 p-4 bg-white/80 backdrop-blur-sm rounded-full shadow-lg animate-float border border-emerald-200/50">
              <Lock className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="absolute top-60 right-32 p-3 bg-white/70 backdrop-blur-sm rounded-full shadow-md animate-float-delayed border border-lime-200/50">
              <Shield className="w-5 h-5 text-lime-600" />
            </div>
            <div className="absolute bottom-60 left-20 p-3 bg-white/75 backdrop-blur-sm rounded-full shadow-lg animate-float border border-green-200/50">
              <GraduationCap className="w-5 h-5 text-green-600" />
            </div>
            <div className="absolute bottom-32 right-20 p-4 bg-white/60 backdrop-blur-sm rounded-full shadow-md animate-float-delayed border border-emerald-300/50">
              <BookOpen className="w-6 h-6 text-emerald-700" />
            </div>

            {/* Additional floating elements */}
            <div className="absolute top-96 right-20 p-2 bg-emerald-100/80 backdrop-blur-sm rounded-lg shadow-sm animate-float border border-emerald-200">
              <Users className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="absolute top-72 left-80 p-2 bg-lime-100/70 backdrop-blur-sm rounded-lg shadow-sm animate-float-delayed border border-lime-200">
              <Play className="w-4 h-4 text-lime-700" />
            </div>
            <div className="absolute bottom-80 right-40 p-3 bg-green-100/60 backdrop-blur-sm rounded-full shadow-sm animate-bounce-slow border border-green-200">
              <Monitor className="w-4 h-4 text-green-600" />
            </div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 flex flex-col justify-center px-16 py-20">
            <div className="max-w-lg">
              <h1 className="text-5xl font-bold text-gray-600 mb-6 leading-tight">
                Stay Safe, Stay Informed with Rakshak
              </h1>
              <p className="text-xl text-gray-600 mb-12">
                Explore Mumbai crime hotspots on an interactive map and read
                public-reported issues in one place
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full lg:w-[480px] flex flex-col justify-center bg-white/10 relative">
          {/* Mobile floating elements (also moved to the left) */}
          <div className="lg:hidden absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-20 h-20 bg-emerald-400/20 rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 right-8 w-16 h-16 bg-lime-400/15 rounded-full animate-bounce-slow"></div>
            <div className="absolute top-32 right-6 p-2 bg-white/10 backdrop-blur-sm rounded-full">
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="absolute bottom-40 left-8 p-2 bg-white/10 backdrop-blur-sm rounded-full">
              <Shield className="w-4 h-4 text-lime-400" />
            </div>
          </div>
          <div className="relative z-10 px-8 py-8 lg:px-12">
            {/* Form Header */}
            <div className="text-center mb-10">
              <h2 className="text-2xl font-semibold text-black/60 mb-2">
                {isLogin ? "Log in to your account" : "Create your account"}
              </h2>
              <p className="text-slate-400">
                {isLogin
                  ? "Welcome back! Please sign in to continue"
                  : "Join our educational platform today"}
              </p>
            </div>

            {/* Auth Form */}
            <div className="space-y-6">
              {!isLogin && (
                <>
                  <div>
                    <input
                      className="w-full p-4 border-b-2 border-emerald-500 bg-white/10 text-gray-700 focus:outline-none placeholder-slate-400 transition-all duration-200"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      required
                    />
                  </div>

                  {/* UserId input */}
                  <div>
                    <input
                      className="w-full p-4 border-b-2 border-emerald-500 bg-white/10 text-gray-700 focus:outline-none placeholder-slate-400 transition-all duration-200"
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="UserId (lowercase, numbers and underscore)"
                      required
                    />
                  </div>
                </>
              )}

              <div className="relative w-full">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" " // keep an empty placeholder so peer-placeholder-shown works
                  required
                  className="peer w-full p-3 pt-5 border-0 border-b-2 border-emerald-500 bg-white/10 text-gray-500 focus:outline-none placeholder-transparent"
                />

                <label
                  htmlFor="email"
                  className={`absolute left-3 top-3 text-slate-400 text-base transition-all duration-200
            peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
            peer-focus:top-0 peer-focus:text-sm peer-focus:text-emerald-500
            peer-focus:opacity-100 peer-focus:translate-y-0
            ${
              email.trim().length > 1
                ? "opacity-0 translate-y-1"
                : "opacity-100 translate-y-0"
            }
          `}
                >
                  Email address
                </label>
              </div>

              <div className="relative">
                <input
                  id="password"
                  className="peer w-full p-3 pt-5 border-0 border-b-2 border-emerald-500  bg-white/10 text-gray-700 focus:outline-none  placeholder-transparent pr-14 transition-all duration-200"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  required
                  aria-label="Password"
                />

                <label
                  htmlFor="password"
                  className={`absolute left-4 top-4 text-slate-400 text-base transition-all duration-200 pointer-events-none
        peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
        peer-focus:top-0 peer-focus:text-sm peer-focus:text-emerald-500 peer-focus:opacity-100
        ${password.trim().length > 1 ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"}`}
                >
                  Password
                </label>

                <button
                  type="button"
                  className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Confirm password (only when not login) */}
              {!isLogin && (
                <div>
                  <div className="relative mt-4">
                    <input
                      id="confirmPassword"
                      className={`peer w-full p-3 pt-5 border-0 border-b-2 border-emerald-500  bg-white/10 text-gray-700 focus:outline-none  placeholder-transparent pr-14 transition-all duration-200
          ${!samepassword ? "border-b-red-500 bg-red-500/10" : "border-b-emerald-500"}`}
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder=" "
                      required
                      aria-label="Confirm password"
                    />

                    <label
                      htmlFor="confirmPassword"
                      className={`absolute left-4 top-4 text-slate-400 text-base transition-all duration-200 pointer-events-none
          peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
          peer-focus:top-0 peer-focus:text-sm peer-focus:text-emerald-500 peer-focus:opacity-100
          ${confirmPassword.trim().length > 1 ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"}`}
                    >
                      Confirm Password
                    </label>

                    <button
                      type="button"
                      className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {!samepassword && (
                    <p className="flex items-center text-red-400 mt-2 text-sm">
                      <Info className="w-4 h-4 mr-2" />
                      Passwords don't match
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={isLogin ? HandleLogin : HandleRegister}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                  isFormValid
                    ? "bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    : "bg-slate-600 text-slate-400 cursor-not-allowed"
                }`}
                disabled={!isFormValid}
              >
                {isLogin ? "Log in" : "Create Account"}
              </button>
            </div>

            {/* Divider */}
            <div className="my-8 flex items-center">
              <div className="flex-1 border-t border-slate-600"></div>
              <span className="px-4 text-sm text-slate-400">or</span>
              <div className="flex-1 border-t border-slate-600"></div>
            </div>
            {/* Toggle Mode */}
            <div className="mt-8 text-center">
              <span className="text-slate-400">
                {isLogin ? "New Here? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline transition-colors"
                >
                  {isLogin ? "Create an Account" : "Sign in"}
                </button>
              </span>
            </div>
          </div>
        </div>
        {/* Custom animations */}
        <style jsx>{`
          @keyframes float {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-15px);
            }
          }
          @keyframes float-delayed {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }
          @keyframes bounce-slow {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          @keyframes pulse-slow {
            0%,
            100% {
              opacity: 0.6;
            }
            50% {
              opacity: 0.9;
            }
          }
          .animate-float {
            animation: float 4s ease-in-out infinite;
          }
          .animate-float-delayed {
            animation: float-delayed 5s ease-in-out infinite;
          }
          .animate-bounce-slow {
            animation: bounce-slow 6s ease-in-out infinite;
          }
          .animate-pulse-slow {
            animation: pulse-slow 4s ease-in-out infinite;
          }
        `}</style>
      </div>
    </>
  );
}

export default Auth;
