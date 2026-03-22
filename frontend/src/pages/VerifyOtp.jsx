import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";


const VerifyOtp = () => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timeLeft, setTimeLeft] = useState(600); // 10 min in seconds
    const inputsRef = useRef([]);
    const { backendUrl, setToken, setUserData } = useContext(AppContext);
    const navigate = useNavigate();
    const location = useLocation();



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
            const passedToken = location.state?.token || localStorage.getItem('token');

            if (!passedToken) {
                toast.error("Session expired. Please login again.");
                navigate('/login');
                return;
            }

            const { data } = await axios.post(
                backendUrl + '/api/user/verify-otp',
                { otp: enteredOtp },
                { headers: { token: passedToken } }
            );

            if (data.success) {
                toast.success("OTP verified successfully");
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

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
        <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md text-center">
            <h2 className="text-xl font-semibold mb-4">Enter OTP</h2>

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

            <p className="text-gray-600 mb-4">
            Time remaining: <span className="font-semibold">{formatTime(timeLeft)}</span>
            </p>

            <button
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
            disabled={otp.includes("") || timeLeft === 0}
            onClick={handleVerifyOtp}
            >
            Verify OTP
            </button>

            {timeLeft === 0 && (
            <button
                className="mt-3 text-blue-500 underline"
                onClick={() => {
                setTimeLeft(600);
                setOtp(["", "", "", "", "", ""]);
                inputsRef.current[0].focus();
                }}
            >
                Resend OTP
            </button>
            )}
        </div>
        </div>
    );
}

export default VerifyOtp;