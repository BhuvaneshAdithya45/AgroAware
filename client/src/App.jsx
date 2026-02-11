import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CropAdvisory from "./pages/CropAdvisory";
import ProtectedRoute from "./components/ProtectedRoute";
import Awareness from "./pages/Awareness";
import Schemes from "./pages/Schemes";
import Voice from "./pages/Voice";
import RagUpload from "./pages/RagUpload";
import AdvisoryChat from "./components/AdvisoryChat";
import FloatingChat from "./components/FloatingChat";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Main Dashboard Hub */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Crop Advisory Tool (formerly Dashboard) */}
        <Route
          path="/crop-advisory"
          element={
            <ProtectedRoute>
              <CropAdvisory />
            </ProtectedRoute>
          }
        />

        {/* Feature pages */}
        {/* Feature pages - Protected */}
        <Route
          path="/advisory-chat"
          element={
            <ProtectedRoute>
              <AdvisoryChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/awareness"
          element={
            <ProtectedRoute>
              <Awareness />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schemes"
          element={
            <ProtectedRoute>
              <Schemes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/voice"
          element={
            <ProtectedRoute>
              <Voice />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rag"
          element={
            <ProtectedRoute>
              <RagUpload />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Home />} />
      </Routes>

      {/* Floating Chat Button - appears on all pages */}
      <FloatingChat />
    </>
  );
}