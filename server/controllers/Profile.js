const Profile=require("../models/Profile");
const User=require("../models/User");
const{uploadImageToCloudinary}=require("../utils/imageUploader");
exports.updateProfile=async(req,res)=>{
    try{
        //Note: id user has been came to profile route means he is logged means we can fetch user Id from req as we have added userId in req in middleware

        //fetch data
        const{dateOfBirth="",about="",contactNumber,/*gender*/}=req.body;

        //get user id
        const id=req.user.id

        //data validation
        // if(!contactNumber || !gender){
        //     return res.status(400).json({
        //         success:true,
        //         message:"All feilds are required!"
        //     });
        // }

        //find profile
        const userDetails=await User.findById(id);

        const profileId=userDetails.additionalDetails;
        const profileDetails=await Profile.findById(profileId);

        //update profile
        profileDetails.dateOfBirth=dateOfBirth;
        // profileDetails.gender=gender;
        profileDetails.about=about;
        profileDetails.contactNumber=contactNumber;
        await profileDetails.save();
        //return res 
        res.status(200).json({
            success:true,
            message:"profile updated successfully!",
            profile:profileDetails
        });
    }catch(err){
        console.log("From updateProfile error: ",err);
        return res.json({
            success:false,
            message:"internal server error!",
            error:err.message
        });
    }
}

//deleteAccount
//explore --> how can we schedule this deletion operation
exports.deleteAccount=async(req,res)=>{
    try{
        // TODO: Find More on Job Schedule
                // const job = schedule.scheduleJob("10 * * * * *", function () {
                //      console.log("The answer to life, the universe, and everything!");
                // });
                // console.log(job);
        //Note: id user has been came to profile route means he is logged means we can fetch user Id from req as we have added userId in req in middleware
        const id=req.user.id;
        
        //validation
        const userDetails=await User.findById(id);
        //validtaion
        if(!userDetails){
            return res.json({
                success:false,
                message:"User not found"
            });
        }
        //delete profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        //delete user
        //TODO: HW: unenroll user from all enrolled courses
        await User.findByIdAndDelete({_id:id});
        //return res
        return res.status(200).json({
            success:true,
            message:"Account deleted successfully!"
        })
    }catch(err){
        console.log("From deleteAccount error: ",err.message);
        return res.json({
            success:false,
            message:"User can't be deleted successfully!"
        });
    }
}

//
exports.getUserDetails=async(req,res)=>{
    try{
        const id=req.user.id;
        const userDetails=await User.findById(id).populate('additionalDetails').exec();
        return res.json({
            success:true,
            message:"User data fetched successfully!",
            data:userDetails
        })
    }catch(err){
        console.log("From deleteAccount error: ",err.message);
        return res.status(500).json({
            success:false,
            message:err.message
        });
    }
}

exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      console.log("Err from updateDisplayImage", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
  
exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      const userDetails = await User.findOne({
        _id: userId,
      })
        .populate("courses")
        .exec()
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};