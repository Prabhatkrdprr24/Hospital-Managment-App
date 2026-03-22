

export const getAppointmentTemplate = (email, details) => {
  return `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
    <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px;">
      
      <h2 style="text-align: center; color: #2d89ef;">Appointment Confirmed</h2>

      <p style="color: #555; font-size: 16px;">
        Your appointment has been successfully booked. Here are the details:
      </p>

      <div style="margin-top: 20px; padding: 15px; border: 1px solid #eee; border-radius: 8px;">
        <p><strong>Patient Email:</strong> ${email}</p>
        <p><strong>Doctor Name:</strong> ${details.doctorName}</p>
        <p><strong>Doctor Email:</strong> ${details.doctorEmail}</p>
        <p><strong>Date:</strong> ${details.slotDate}</p>
        <p><strong>Time:</strong> ${details.slotTime}</p>
        <p><strong>Fees:</strong> ₹${details.fees}</p>

      </div>

      <p style="margin-top: 20px; color: #888; font-size: 14px;">
        Please arrive 10 minutes before your scheduled time.
      </p>

      <hr style="margin: 20px 0;" />

      <p style="text-align: center; font-size: 12px; color: #aaa;">
        Thank you for using our service 💙
      </p>

    </div>
  </div>
  `;
};