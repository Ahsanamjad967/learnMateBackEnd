const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "studentpaystudent@gmail.com",
    pass: "ziqecftmhqdosbmd",
  },
});

const sendMail = async (reciever, subject, html) => {
  const mailOptions = {
    from: "studentpaystudent@gmail.com",
    to: reciever,
    subject,
    html,
  };
console.log(mailOptions)

  return await transporter.sendMail(mailOptions).catch((err) => {
    throw new ApiError(
      500,
      `Something went wrong while sending password reset email`
    );
  });

  
};

module.exports = sendMail;
