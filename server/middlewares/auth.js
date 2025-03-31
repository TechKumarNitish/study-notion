const jwt=require("jsonwebtoken");
const User=require("../models/User")
require("dotenv").config();

// auth......................................................
exports.auth=async(req,res,next)=>{
    try{
        //extract token
        const token=req.cookies.token || request.body.token ||req.header("Authorisation").replace("Bearer ","");

        //if token is missing then return response
        if(!token){
            return res.status(401).json({
                success:true,
                message:"Token is missing"
            });
        }

        //verify the token
        try{
            const decode=jwt.verify(token,process.env.JWT_SECRETE);
            console.log(decode);
            req.user=decode;
        }catch(err){
            //verification issue
            console.log(err)
            return res.status(401).json({
                success:false,
                message:"Token is invalid"
            });
        }
        next();
    }catch(err){
        return res.status(401).json({
            success:false,
            message:"Something went worng while validating the token"
        });
    }
}
//isStudent..............................................
exports.isStudent=async(req,res,next)=>{
    try{
        if(req.user.accountType !=="Student"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for Students only"
            });
        }
        next();
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified, please try again!"
        });
    }
}

//instructor............................................
exports.isInstructor=async(req,res,next)=>{
    try{
        if(req.user.accountType !=="Instructor"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for Instructor only"
            });
        }
        next();
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified, please try again!"
        });
    }
}

//isAdmin...............................................
exports.isAdmin=async(req,res,next)=>{
    try{
        if(req.user.accountType !=="Admin"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for Admin only"
            });
        }
        next();
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified, please try again!"
        });
    }
}
