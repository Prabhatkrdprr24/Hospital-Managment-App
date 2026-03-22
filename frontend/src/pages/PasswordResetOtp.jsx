import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function PasswordResetOtp() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [resendTimeLeft, setResendTimeLeft] = useState(60);
  const inputsRef = useRef([]);
  const { backendUrl } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();

  // ⏳ Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (resendTimeLeft <= 0) return;

    const timer = setTimeout(() => {
      setResendTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendTimeLeft]);

  // 🔢 Handle input
  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  // ⌫ Backspace handling
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  // ⏱ Format time
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  // ✅ Verify OTP
  const handleVerifyOtp = async () => {
    try{
        const enteredOtp = otp.join("");
        const email = location.state?.email || localStorage.getItem("email");
        const { data } = await axios.post(backendUrl + '/api/user/verify-reset-otp', {
          email,
          otp: enteredOtp
        });
        
        if(!data.success){
            toast.error(data.message || "Invalid OTP");
            return;
        }

        if(data.success){
            navigate('/new-password', {
                state: {
                    email: email
                }
            })
        }
    }
    catch(error){
        toast.error("Invalid OTP. Please try again.");
        console.log(error.message)
    }
  };

  // 🔄 Resend OTP
  const handleResendOtp = () => {
    setTimeLeft(300);
    setResendTimeLeft(60);
    setOtp(["", "", "", "", "", ""]);
    inputsRef.current[0].focus();

  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md text-center">

        <h2 className="text-2xl font-semibold mb-2">
          Reset Password OTP
        </h2>

        <p className="text-gray-500 mb-4 text-sm">
          Enter the 6-digit OTP sent to your email
        </p>

        {/* OTP Inputs */}
        <div className="flex justify-between gap-2 mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              ref={(el) => (inputsRef.current[index] = el)}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 md:w-14 md:h-14 text-center text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </div>

        {/* Timer */}
        <p className="text-gray-600 mb-4">
          Time remaining:{" "}
          <span className="font-semibold">{formatTime(timeLeft)}</span>
        </p>

        {/* Verify Button */}
        <button
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          disabled={otp.includes("") || timeLeft === 0}
          onClick={handleVerifyOtp}
        >
          Verify OTP
        </button>

        {/* Resend */}
        {resendTimeLeft > 0 ? (
          <button
            className="mt-3 text-gray-400 cursor-not-allowed"
            disabled
          >
            Resend OTP in {formatTime(resendTimeLeft)}
          </button>
        ) : (
          <button
            className="mt-3 text-blue-500 underline"
            onClick={handleResendOtp}
          >
            Resend OTP
          </button>
        )}

      </div>
    </div>
  );
}