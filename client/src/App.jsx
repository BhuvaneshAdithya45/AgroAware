import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Advisory from "./pages/Advisory";
import ProtectedRoute from "./components/ProtectedRoute";
import Awareness from "./pages/Awareness";
import Schemes from "./pages/Schemes";
import Voice from "./pages/Voice";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Advisory />
          </ProtectedRoute>
        }
      />

      {/* Optional placeholders */}
      <Route path="/awareness" element={<Awareness />} />
      <Route path="/schemes" element={<Schemes />} />
      <Route path="/voice" element={<Voice />} />

      <Route path="*" element={<Home />} />
    </Routes>
  );
}