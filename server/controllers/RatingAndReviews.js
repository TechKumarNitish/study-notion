const { default: mongoose } = require("mongoose");
const Course = require("../models/Course");
const RatingAndReview=require("../models/RatingAndReview");

exports.createRating=async(req,res)=>{
    try{
        // get user id
        const userId=req.user; // from middleware
        //fetchdata from req.body
        const {courseId,rating,review}=req.body;
        //check if user is enrolled or not
        const courseDetails=await Course.findOne({_id:courseId,
            studentsEnrolled:{$elenMatch:{$eq:userId}}});
        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:"Student is not enrolled in the course!"
            });
        }
        //check if user is already reviewd the course 
        const alreadyReviewed=await RatingAndReview.findOne({
            user:userId,
            course:courseId
        })
        if(alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:"Course is already reviewed by the user!"
            });
        }
        //create the review
        const ratingReview=await RatingAndReview.create({
            user:userId,
            course:courseId,
            rating:  parseInt(rating),
            review
        });
        //update course with this rating/review
        const updatedCourseDetails= await Course.findByIdAndUpdate(
            {_id:courseId},
            {$push:{ratingAndReviews:ratingReview._id}},
            {new:true}
        )
        console.log(updatedCourseDetails)
        //return res
        return res.status(200).json({
            success:true,
            message:"Rating and Review created successfully",
            ratingReview
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:err.message
        })   
    }
}

exports.getAverageRating=async(req,res)=>{
    try{
        //get course ID
        const id=req.body.courseId;

        //calculate avg Rating
        const result=await RatingAndReview.aggregate([
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId)
                }
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:"rating"}
                }
            }
        ]);
        // return rating
        if(result.length>0){
            return res.status(200).json({
                success:true,
                averagerating:result[0].averageRating
            })
        }
        return res.status(200).json({
            success:true,
            message:"average rating is 0, no rating given till now",
            averageRating:0
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:""
        })
    }
}

exports.getAllRating=async(req,res)=>{
    try{
        const allRatingAndReviews=await RatingAndReview.fin({}).
        sort({rating:"desc"}).
        populate({
            path:"user",
            select:"firstName lastName email image"
        }).
        populate({
            path:"course",
            select:"courseName"
        }).exec();
        return res.status(200).json({
            success:true,
            message:"all rating and reviews fetched successfully",
            data:allRatingAndReviews
        });

    }catch(err){
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}