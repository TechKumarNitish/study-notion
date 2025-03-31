const OTP=require("../models/OTP");
const Profile=require("../models/Profile");
const User=require("../models/User");
const otpGenerator=require("otp-generator");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
require("dotenv").config();

//send otp.........................................................
exports.sendOTP=async (req,res)=>{
   try{
        //fetch email from request's body
        const {email}=req.body;

        //check if user already exist
        const checkUserPresent=await User.findOne({email});
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:"User already registered!",
            });
        }
    
        //generate otp
        var otp=otpGenerator.generate(6,{//explore
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false
        });

        //check unique otp or not
        //niche wla code bekar code hai kyunki bar bar 
        //db call maara jaa rha hai, kyunki jab tum 
        //company main kaam krne jaoge to aise service
        // ya library ke ssath interact kroge ya mileag
        // jo unique otp hi dega
        //industry main kabhi aisa nhi hota hai ki db loop laga ke baithe hain
        const result= await OTP.findOne({otp:otp});
        while(result){
            otp=otpGenerator.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false
            });
            result= await OTP.findOne({otp:otp});
        }

        const otpPayload={email,otp};

        //create an entry in db for otp
        const otpBody=await OTP.create(otpPayload);
        console.log(otpBody);

        //return response successfully
        res.status(200).json({
            success:true,
            message:"OTP Sent Successfully",
            otp
        });
   }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:err.message,
        });
   }
}

//signup...........................................................
exports.signUp=async(req,res)=>{
    try{
        //data fetch from request's body
        const{
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        }=req.body;

        //do the validation 
        if(!firstName || !lastName || !email || !password ||!confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message:"All feilds are required"
            });
        }
        
        // match confirm password and password
        if(password!==confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password and Confrim Password does not , Please try again!"
            })
        }

        //check user already exits or not
        const existingUser=await User.findOne({email});
        if(existingUser){
            return res.status(401).json({
                success:false,
                message:"User is already registered!",
            });
        }

        //find most recent OTP for the user
        const recentOtp=await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOtp);

        //validate otp
        if(recentOtp.length==0){
            //OTP not found
            console.log("rs");
            // return res.status(100).json({
            //     success:false,
            //     message:"OTP not found"
            // })

            return res.status(400).json({
                success:false,
                message:"the OTP is not valid"
            })
        }else if(otp !== recentOtp[0].otp){
            console.log("rs2");
            return res.status(100).json({
                success:false,
                message:"Invalid OTP"
            });
        }

        //hash the password
        const hashPassword=await bcrypt.hash(password,10);
        
        //create entry in db
        const profileDetails=await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null
        });
        const user=await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password:hashPassword,
        accountType,
        additionalDetails:profileDetails._id,
        image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        //return res
        return res.status(200).json({
            success:true,
            message:"User is registered successfully",
            user,
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"User can not be registered please try again!"
        });
    }
}

//login............................................................
exports.login=async(req,res)=>{
    try{
        //get data from req body
        const{email,password}=req.body;

        //validation of data
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"All fields are required, please try again!"
            });
        }

        //check for user existence
        const user=await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered, please signup first"
            });
        }

        //match password then generate JWT token
        if(await bcrypt.compare(password,user.password))
        {   const payload={
                email:user.email,
                id:user._id,
                accountType:user.accountType
            };
            const token=jwt.sign(payload,process.env.JWT_SECRETE,{
                expiresIn:"2h",
            });
            user.token=token;
            user.password=undefined;

            //create cookie and send response
            const options={
                expires:new Date(Date.now()+3*27*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged in successfully"
            });
        }
        else{
            return res.status(401).json({
                success:false,
                message:"password is incorrect!"
            });
        }
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Login failure please try again!"
        });
    }
}


//TODO:change password......................................................
exports.changePassword=async(req,res)=>{
    try{
        //get data from req body
        //get oldPassword, newPassword , confirmNewPassword
        const{email,oldPassword,newPassword,confirmNewPassword}=req.body;
        
        //validation on password
        if(!email || !oldPassword || !newPassword || !confirmNewPassword){
            return res.status(403).json({
                success:false,
                message:"All fields are required, please try again!"
            });
        }

        //check for user existence
        const user=await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered, please signup first!"
            });
        }
 
        //match password then generate JWT token
        if(await bcrypt.compare(oldPassword,user.password))
        {  

            //hash the newPassword
            const hashPassword=await bcrypt.hash(newPassword,10);
            
            //update password in db
            const updatedUser= await User.findOneAndUpdate({email},{password:hashPassword},{new:true});
            /*....
            You should set the new option to true to return the document after update was applied.
            By default, findOneAndUpdate() returns the document as it was before update was applied
            As an alternative to the new option, you can also use the returnOriginal option. returnOriginal:
            false is equivalent to new: true. The returnOriginal option exists for consistency with the the 
            MongoDB Node.js driver's findOneAndUpdate(), which has the same option.
            ...*/
            console.log("updated user: ",updatedUser);
            
            // user.password=hashPassword;
            // await user.save();

            //send mail password updated
            const mailResponse=await mailSender(email,"Psssword Update Email","Password Changed SuccessFully!");
            console.log("password change mail response:",mailResponse);

            //return response
            return res.status(200).json({
                success:true,
                message:"password changed successfully!"
            });
        }else{
            return res.status(401).json({
                success:false,
                message:"password is incorrect!"
            });
        }
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Something went wrong. Unable to change the password!"
        })
    }
}