import React, { useEffect } from 'react'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext.jsx'
import { toast } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const MyAppointments = () => {

  const { backendUrl, token, getDoctorsData } = useContext(AppContext);
  const navigate = useNavigate();

  const [appointments, setAppointments] = React.useState([]);
  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('_');
    return dateArray[0] + ' ' + months[parseInt(dateArray[1])-1] + ' ' + dateArray[2];
  }

  const getUserAppointments = async () => {

    try{

      const {data} = await axios.get(backendUrl + '/api/user/appointments', {headers: {token}});
      if(data.success){
        setAppointments(data.appointments.reverse());
      }

    }
    catch(error){
      toast.error(error);
      console.error("Error fetching appointments:", error);
    }

  }

  const cancelAppointment = async (appointmentId) => {

    try{

      const {data} = await axios.post(backendUrl + '/api/user/cancel-appointment', {appointmentId}, {headers: {token}});
      if(data.success){
        toast.success("Appointment cancelled successfully");
        getUserAppointments();
        getDoctorsData();
      }
      else{
        toast.error(data.message);
      }

    }
    catch(error){
      toast.error(error);
      console.error("Error cancelling appointment:", error);
    }

  }

  const initPay = (order) => {

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
      amount: order.amount, // Amount is in currency subunits. Default currency is INR.
      currency: order.currency,
      name: 'Appointment Payment',
      description: 'Payment for appointment booking',
      order_id: order.id, //This is a sample Order ID. Replace with the actual
      receipt: order.receipt,
      handler: async (response) => {
        
        try{

          const {data} = await axios.post(backendUrl + '/api/user/verifyRazorpay', response, {headers: {token}});
          if(data.success){
            // console.log("Payment successful:", data);
            // toast.success("Payment successful");
            getUserAppointments();
            navigate('/my-appointments');
          }

        }
        catch(error){
          toast.error("Payment failed. Please try again.");
          console.error("Payment error:", error);
        }

      }
    }

    const rzp = new window.Razorpay(options);
    rzp.open();

  }

  const appointmentRazorpay = async (appointmentId) => {

    try{

      const {data} = await axios.post(backendUrl + '/api/user/payment-razorpay', {appointmentId}, {headers: {token}});
      if(data.success){
        // console.log("Razorpay payment data:", data.order);
        initPay(data.order);
      }

    }
    catch(error){
      toast.error(error);
      console.error("Error in Razorpay payment:", error);
    }

  }

  useEffect(() => {
    if(token){
      getUserAppointments();
    }
  }, [token]);

  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My Appointments</p>
      <div>
        {
          appointments.slice(0, 5 ).map((item, index) => (
            <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b' key={index} >
              <div>
                <img className='w-32 bg-indigo-50 ' src={item.docData.image} alt=''/>
              </div>
              <div className='flex-1 text-sm text-zinc-600'>
                <p className='text-neutral-800 font-semibold'>{item.docData.name}</p>
                <p>{item.speciality}</p>
                <p className='font-medium text-zinc-700 mt-1'>Address:</p>
                <p className='text-xs'>{item.docData.address.line1}</p>
                <p className='text-xs'>{item.docData.address.line2}</p>
                <p className='text-xs mt-1'><span className='text-sm text-neutral-700 font-medium'>Date & Time:</span> {slotDateFormat(item.slotDate)} | {item.slotTime}</p>
              </div>

              <div></div>

              <div className='flex flex-col gap-2 justify-end'>
                {!item.cancelled && item.payment && <button className='sm:min-w-48 py-2 border rounded text-stone-500 bg-indigo-50'>Paid</button>}
                {!item.cancelled && !item.payment && <button onClick={() => appointmentRazorpay(item._id)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'>Pay Online</button>}
                {!item.cancelled && <button onClick={() => cancelAppointment(item._id)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'>Cancel appointment</button>}
                {item.cancelled && <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appointment Cancelled</button>}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default MyAppointments