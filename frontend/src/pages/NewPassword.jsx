import React, { useState } from "react";
import axios from "axios";
import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const NewPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { backendUrl } = useContext(AppContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔐 validation
    if (newPassword.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setError("");
    setLoading(true);

    try {
        const email = location.state?.email || localStorage.getItem("email");
        if (!email) {
            setError("Session expired. Please request reset again.");
            setLoading(false);
            navigate('/reset-password');
            return;
        }

        const { data } = await axios.post(backendUrl + '/api/user/set-new-password', {email, password:newPassword});

        if (data.success) {
            toast.success("Password updated successfully");
            localStorage.removeItem("email");
            navigate("/login");
        } else {
            setError(data.message || "Something went wrong");
        }
    } 
    catch (err) {
        setError("Server error");
        toast.error("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">

        <h2 className="text-2xl font-semibold text-center mb-4">
          Set New Password
        </h2>

        <p className="text-gray-500 text-center mb-6 text-sm">
          Enter your new password below
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* New Password */}
          <div>
            <p className="text-sm">New Password</p>
            <input
              type="password"
              className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <p className="text-sm">Confirm Password</p>
            <input
              type="password"
              className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default NewPassword;