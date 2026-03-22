import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";


const VerifyOtp = () => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timeLeft, setTimeLeft] = useState(600); // 10 min in seconds
    const [resendTimeLeft, setResendTimeLeft] = useState(60);
    const inputsRef = useRef([]);
    const { backendUrl, setToken, setUserData } = useContext(AppContext);
    const navigate = useNavigate();
    const location = useLocation();



    useEffect(() => {
      if (timeLeft <= 0) return;

      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }, [timeLeft]);

    useEffect(() => {
      if (resendTimeLeft <= 0) return;

      const timer = setTimeout(() => {
        setResendTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }, [resendTimeLeft]);

    const handleChange = (value, index) => {
        if (!/^[0-9]?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
        inputsRef.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
        inputsRef.current[index - 1].focus();
        }
    };

    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec < 10 ? "0" : ""}${sec}`;
    };

    const handleVerifyOtp = async () => {
        try {
            const enteredOtp = otp.join("");
            const pendingToken = location.state?.pendingToken || localStorage.getItem('pendingToken');

            if (!pendingToken) {
                toast.error("Session expired. Please login again.");
                navigate('/login');
                return;
            }

            const { data } = await axios.post(
                backendUrl + '/api/user/verify-otp',
                { otp: enteredOtp },
                { headers: { token: pendingToken } }
            );

            if (data.success) {
                toast.success("OTP verified successfully");
                localStorage.setItem('token', passedToken);
                localStorage.removeItem('pendingToken');
                setToken(passedToken);
                setUserData(data.data);
                navigate('/');
            } else {
                toast.error(data.message || "OTP verification failed");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const handleResendOtp = async () => {
        try{
        const token = location.state?.pendingToken || localStorage.getItem('pendingToken');
            if (!token) {
                toast.error("Session expired. Please login again.");
                navigate('/login');
                return;
            }

            const {data} = await axios.get(backendUrl + '/api/user/resend-otp', {headers: {token}});
            if(data.success){
                toast.success("OTP resent successfully");
                setTimeLeft(600); // reset timer to 10 minutes
                setResendTimeLeft(60);
            }
            else{
                toast.error(data.message || "Error in resending OTP");
            }
        }
        catch(error){
            console.error("Error resending OTP:", error);
            toast.error("Error in resending OTP");
        }
    }

    return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md text-center">
        
        <h2 className="text-xl font-semibold mb-4">Enter OTP</h2>

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

        {/* Resend Button */}
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

export default VerifyOtp;