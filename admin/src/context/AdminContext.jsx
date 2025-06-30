import { createContext } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";

export const AdminContext = createContext();

const AdminContextProvider = ( props ) => {

    const [aToken, setAToken] = useState(localStorage.getItem('aToken') ? localStorage.getItem('aToken') : "");
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

    const getAllDoctors = async () => {
        try{

            const {data} = await axios.post(backendUrl + '/api/admin/all-doctors', {}, {headers: {aToken}});
            if(data.success){
                setDoctors(data.doctors);
                console.log(data.doctors);
            }
            else{
                console.error(data.message);
                toast.error(data.message);
            }

        }
        catch(err){
            toast.error(err.message);
        }
    }

    const changeAvailability = async (docId) => {
        
        try{

            const {data} = await axios.post(backendUrl + '/api/admin/change-availability', {docId}, {headers: {aToken}});
            if(data.success){
                toast.success(data.message);
                getAllDoctors();
            }
            else{
                console.error(data.message);
                toast.error(data.message);
            }

        }
        catch(err){
            console.error(err);
            toast.error(err.message);
        }

    }

    const getAllAppointments = async () => {

        try{
            const {data} = await axios.get(backendUrl + '/api/admin/appointments', {headers: {aToken}});
            if(data.success){
                setAppointments(data.appointments);
                console.log(data.appointments);
            }
            else{
                console.error(data.message);
                toast.error(data.message);
            }

        }
        catch(err){
            console.error(err);
            toast.error(err.message);
        }
    }

    const cancelAppointment = async (appointmentId) => {

        try{

            const {data} = await axios.post(backendUrl + '/api/admin/cancel-appointment', {appointmentId}, {headers: {aToken}});
            if(data.success){
                toast.success("Appointment cancelled successfully");
                getAllAppointments();
            }
            else{
                console.error(data.message);
                toast.error(data.message);
            }

        }
        catch(err){
            console.error(err);
            toast.error(err.message);
        }

    }
    
    const value = {
        aToken,
        setAToken,
        backendUrl,
        doctors,
        getAllDoctors,
        changeAvailability,
        appointments,
        getAllAppointments,
        setAppointments,
        cancelAppointment
    }

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )

}

export default AdminContextProvider;