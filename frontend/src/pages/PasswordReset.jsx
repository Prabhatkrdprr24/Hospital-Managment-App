import React, { useState } from "react";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        const { data } = await axios.post(backendUrl + '/api/user/password-reset', {
            email
        });
        console.log("data in passwordreset", data);
        // setMessage("Password reset email sent successfully.");
        if(!data.success){
            setMessage(data.message || "Error sending password reset email.");
        }

        if(data.success){
            toast.success("Password reset email sent successfully");
            localStorage.setItem("email", email);
            setLoading(false);
            navigate('/verify-reset-otp',{
                state: {
                    email: email
                }
            })
        }
        
    }
    catch (error) {
        console.error("Error sending password reset email:", error);
        setMessage("An error occurred. Please try again.");
        setLoading(false);
    }
    
    
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-4">
          Reset Password
        </h2>

        <p className="text-gray-600 text-center mb-6">
          Enter your email to receive a password reset link
        </p>

        <form onSubmit={handleResetSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "Sending..." : "Reset Password"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-green-600">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
