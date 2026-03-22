export const getEmailTemplate = ({ title, email, message, otp, footer }) => {
  return `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
    <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; text-align: center;">
      
      <h2 style="color: #333;">${title}</h2>

      <p style="color: #555; font-size: 16px;">
        Hello <strong>${email}</strong>,
      </p>

      <p style="color: #555; font-size: 16px;">
        ${message}
      </p>

      <div style="font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #2d89ef; margin: 20px 0;">
        ${otp}
      </div>

      <p style="color: #888; font-size: 14px;">
        ${footer}
      </p>

      <hr style="margin: 20px 0;" />

      <p style="color: #aaa; font-size: 12px;">
        If you did not request this, you can safely ignore this email.
      </p>

    </div>
  </div>
  `;
};