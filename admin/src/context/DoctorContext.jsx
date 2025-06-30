import { createContext } from "react";
import { useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';


export const DoctorContext = createContext();

const DoctorContextProvider = ( props ) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [dToken, setDToken] = useState(localStorage.getItem('dToken') ? localStorage.getItem('dToken') : "");
    const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState(false);
    const [profileData, setProfileData] = useState(false);

    const getAppointments = async (docId) => {

        try{

            const {data} = await axios.get(backendUrl + '/api/doctor/appointments', {headers: {dToken}});
            if(data.success){
                setAppointments(data.appointments.reverse());
                console.log("Appointments fetched successfully:", data.appointments.reverse());
            }
            else{
                console.error("Failed to fetch appointments:", data.message);
            }

        }
        catch(error){
            console.log("Error fetching appointments:", error);
            toast.error("Failed to fetch appointments. Please try again later.");
        }

    }

    const completeAppointment = async (appointmentId) => {

        try{

            const {data} = await axios.post(backendUrl + '/api/doctor/complete-appointment', {appointmentId}, {headers: {dToken}});
            if(data.success){
                toast.success(data.message);
                getAppointments();
            }
            else{
                toast.error(data.message);
            }

        }
        catch(error){
            console.error("Error completing appointment:", error);
            toast.error("Failed to complete appointment. Please try again later.");
        }

    }

    const cancelAppointment = async (appointmentId) => {

        try{

            const {data} = await axios.post(backendUrl + '/api/doctor/cancel-appointment', {appointmentId}, {headers: {dToken}});
            if(data.success){
                toast.success(data.message);
                getAppointments();
            }
            else{
                toast.error(data.message);
            }

        }
        catch(error){
            console.error("Error cancelling appointment:", error);
            toast.error("Failed to cancel appointment. Please try again later.");
        }

    }

    const getDashData = async () => {

        try{

            const {data} = await axios.get(backendUrl + '/api/doctor/dashboard', {headers: {dToken}});
            if(data.success){
                setDashData(data.dashData);
                console.log("Dashboard data fetched successfully:", data.dashData);
            }
            else{
                console.error("Failed to fetch dashboard data:", data.message);
                toast.error(data.message);
            }

        }
        catch(error){
            console.error("Error fetching dashboard data:", error);
            toast.error(error.message);
        }

    }

    const getProfileData = async () => {

        try{

            const {data} = await axios.get(backendUrl + '/api/doctor/profile', {headers: {dToken}});
            if(data.success){
                setProfileData(data.profileData);
                console.log("Profile data fetched successfully:", data.profileData);
            }
            else{
                console.error("Failed to fetch profile data:", data.message);
                toast.error(data.message);
            }

        }
        catch(error){
            console.error("Error fetching profile data:", error);
            toast.error(error.message);
        }

    }
    
    const value = {
        dToken,
        setDToken,
        backendUrl,
        appointments,
        setAppointments,
        getAppointments,
        completeAppointment,
        cancelAppointment,
        getDashData,
        dashData,
        setDashData,
        getProfileData,
        profileData,
        setProfileData
    }

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )

}

export default DoctorContextProvider;