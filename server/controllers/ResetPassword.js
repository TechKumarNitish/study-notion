const User=require("../models/User");
const mailSender=require("../utils/mailSender");
const bcrypt=require("bcrypt");
const crypto = require("crypto");// even though this package is globbly you have to import it, what does globbaly available means?

//resetPasswordToken.......................................
exports.resetPasswordToken=async(req,res)=>{
    try{
        //get email from req body
        const email=req.body.email;

        //validate email check for it's existence
        const user=await User.findOne({email});
        if(!user){
            return res.json({
                success:false,
                message:"your email is not registered with us"
            })
        }
        
        //generate token
        const token= crypto.randomUUID();

        //update user by adding token and expiration time
        const updatedDetails=await User.findOneAndUpdate(
            {email},
            {
                token,
                resetPasswordExpires: Date.now()+5*60*1000
            },
            {new:true}
            );

        //create url
        const url=`https://localhost:3000/update-password/${token}`;

        //send mail containing url 
        await mailSender(email,"Password reset link",`Password reset link: ${url}`);
        //return response
        return res.json({
            success:true,
            message:"Password reset Email sent successfully! Please check email and change password",
            url
        });
    }catch(err){
        console.log(err)
        return res.status(500).json({
            success:false,
            message:"Something went wong while sending reset password mail!"
        });
    }  
}

 //resetPassword .........................................
exports.resetPassword=async(req,res)=>{
    try{
        //data fetch
        const {password,confirmPassword,token}=req.body;

        //validation
        if(!password || !confirmPassword ||!token){
            return res.json({
                success:false,
                message:"All feilda are required!"
            });
        }
        if(password!==confirmPassword){
            return res.json({
                success:false,
                message:"Password doesn't match!"
            });
        }
        //get userDeatils from db using token
        const userDetails=await User.findOne({token});
        //if no entry - invalid token
        if(!userDetails){
            return res.json({
                success:false,
                message:"Token is invalid !",
            });
        }
        //token time check
        if(userDetails.resetPasswordExpires<Date.now()){
            return res.json({
                success:false,
                message:"Token has been expired, regenerate your token!"
            })
        }
        //hash password
        const hasshedPassword=await bcrypt.hash(password,10);
        //update password
        await User.findOneAndUpdate(
            {token:token},
            {password:hasshedPassword},
            {new:true}
            );
        //return res
        return res.status(200).json({
            success:true,
            message:"Password reset successfull"
        });
    }catch(err){
        console.log(err);
        return res.json({
            success:false,
            message:"Something went wong while sending reset password mail!"
        });
    }
}

