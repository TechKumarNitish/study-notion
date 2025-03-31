const Course=require("../models/Course");
const Category=require("../models/Category");
const User=require("../models/User");
const{uploadImageToCloudinary}=require("../utils/imageUploader");

//createCourse handler function
exports.createCourse=async(req,res)=>{
    try{
        //fetch data
        const{
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            category,
            tag,
        }=req.body;

        //get thumbnail
        const thumbnail=req.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !tag || !category || !price || !thumbnail){
            return res.status(400).json({
                success:false,
                message:"All feilds are required,"
            });
        }

        //check for instructor (but we already have checked instructor in middleware, then why we again checking again) so no need to check but even then for safe side we are using
        const userId=req.user.id;
        // fetching  user.is from req because if the user is creating course means he is already loged in and if he is logged in that means we have added user.id in req as we did in auth middleware
        // we require user id to do validation of instructor by seeing accountype of the user id, also we have to store object id of instructor in course db also, so we are also fetching user/instructor details
        //TODO: is user.id and instructorDetails._id is same or different
        const instructorDetails=await User.findById(userId);
        console.log(instructorDetails);

        if(!instructorDetails){
            return res.status(400).json({
                success:false,
                message:"Insrtuctor details not found"
            });
        }
        // we are again verifying user here bcz what is somehow user bypassed the middleware

        //check given tag is valid or not
        const categoryDetails=await Category.findById(category);
        if(!categoryDetails){
            return res.status(400).json({
                success:false,
                message:"Category details not found"
            });
        }
        const thumbnailImage=await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);
        const newCourse=await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn,
            price,
            category:categoryDetails._id,
            tag,
            thumbnail:thumbnailImage.secure_url,

        });

        //add the new course to the user schema instructor
        await User.findByIdAndUpdate(
            {_id:instructorDetails._id},
            {
                $push:{
                    courses:newCourse._id
                }
            },
            {new:true}
        );

        //TODO: update the Tag schema
        await Category.findByIdAndUpdate(
            {_id:category},
            {
                $push:{
                    courses:newCourse._id
                }
            }, 
            {
                new:true,
            }
        );

        //return response
        return res.status(200).json({
            success:true,
            message:"Course created successfully!",
            data:newCourse
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Failed to create course!",
            error:err.message,
        });
        
    }
}

//getAllCourses handler function...........................
exports.getAllCourses=async (req,res)=>{
    try{
        const allCourses=await Course.find({},{
            courseName:true,
            price:true,
            thumbnail:true,
            ratingAndReviews:true,
            studentsEnrolled:true
        }).populate("instructor").exec();

        return res.status(200).json({
            success:true,
            message:"Data fetched successfully!",
            data:allCourses
        });

    }catch(err){
        console.log(err);
        return res.json({
            success:false,
            message:"Can't fetch course data",
            error:err.message,
        });
    }
}

//getCourseDetails
exports.getCourseDetails=async (req,res)=>{
    try{
        const courseId=req.body.courseId;
        if(!courseId){
            return res.status(400).json({
                success:false,
                message:"courseId is missing!"
            });
        }
        const courseDetails=await Course.findById({_id:courseId}).
        populate({
            path:'instructor',
            populate:{
                path:'additionalDetails'
            }
        }).
        populate('category').
        // populate('ratingAndReviews').
        populate({
                path:'courseContent',
                populate:{
                path:'subSection',
            }
        }).exec();

        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:`Could not find the course with ${courseId}`,
            });
        }

        return res.status(200).json({
            success:true,
            message:"Course Details fetched successfully!",
            data:courseDetails
        });

    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:err.message,
        });
    }
}