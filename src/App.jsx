import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./ProtectedRoute";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Auth from "./Pages/Auth";
import Feed from "./Pages/Feed";
import Home from "./Pages/Home";
import MyProfile from "./Pages/MyProfile";
import Post from "./Pages/Post";
import AddPost from "./Pages/AddPost";
import ProfileEditForm from "./Pages/ProfileEdit";
import EditPost from "./Pages/EditPost";
import Map from "./Pages/Map"
import CrimeReports from "./Pages/CrimeReports";

function AppLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
      </Routes>
    );
  }

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Navbar />

      <div className="flex flex-1 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
        <div className="flex-1 md:p-4 p-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<Map />} />
            <Route
              path="/profile/:id?"
              element={<ProtectedRoute><MyProfile /></ProtectedRoute>}
            />
            <Route path="/posts" element={<Feed />} />
            <Route
              path="/post/add"
              element={<ProtectedRoute><AddPost /></ProtectedRoute>}
            />
            <Route
              path="/post/:id"
              element={<ProtectedRoute><Post /></ProtectedRoute>}
            />
            <Route
              path="/post/edit/:id"
              element={<ProtectedRoute><EditPost /></ProtectedRoute>}
            />
            <Route
              path="/profile/edit/:id?"
              element={<ProtectedRoute><ProfileEditForm /></ProtectedRoute>}
            />
            <Route
              path="/crime"
              element={<CrimeReports />}
            />
          </Routes>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <>
      <AppLayout />
      <Toaster position="top-center" />
    </>
  );
}
