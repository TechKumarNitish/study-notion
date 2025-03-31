const mongoose=require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate=require("../mail/templates/emailVerificationTemplate");

const OTPSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60 //this is means automatically this document will be deleted from db in 5 min
    }
})

// a function-> to send email
async function sendVerificationEmail(email,otp){
    try{
        const mailResponse=await mailSender(email,"Verification email from StudyNotion",emailTemplate(otp));
        console.log("Email sent Successfully: ",mailResponse);
    }catch(err){
        console.log("error occured while sending emails: ",err);
        throw err;
    }
}

OTPSchema.pre("save",async function(next){
    console.log("New document saved to database");
    if(this.isNew){
        await sendVerificationEmail(this.email,this.otp);
    }
    next();
});

module.exports=mongoose.model("OTP",OTPSchema);