import nodemailer from "nodemailer"
import "dotenv/config"

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASSWORD
    }
})
try {
  await transporter.verify();
  console.log("Server is ready to take our messages");
} catch (err) {
  console.error("Verification failed:", err);
}

const sendMail = async ({to,subject,text,html}) =>{
   await transporter.sendMail({
    from:process.env.EMAIL_USER,
    to,
    subject,
    text,
    html
   })
}

export default sendMail;
