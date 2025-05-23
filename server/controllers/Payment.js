const {instance}= require("../config/razorpay");
const mailSender=require("../utils/mailSender");
const User=require("../models/User");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

//capture the payment and initiate the razorpay order
exports.capturePayment=async(req,res)=>{
    try{
        //get courseId and userId
        const {course_id}=req.body;
        const userId=req.user.id;
        //validation
        //valid courseId
        if(!course_id){
            return res.json({
                success:false,
                message:"Please provide valid course ID"
            });
        }
        //valid courseDetails
        let course;
        try{
            course=await Course.findById(course_id);
            if(!course){
                return res.json({
                    success:false,
                    message:"could not find the course!"
                });
            }

             //user already paid?
            const uid=mongoose.Schema.Types.ObjectId(userId);
            if(course.studentsEnrolled.includes(uid)){
                return res.json({
                    success:false,
                    message:"Student is already enrolled"
                });
            }
        }catch(err){
            console.log("From capture-payment error:",err)
             return res.json({
                success:false,
                message:err.message
            });
        }
       
        //order create
        const amount=course.price;
        const currency='INR';
        const options={
            amount:amount*100,
            currency:currency,
            receipt:Math.random(Date.now()).toString(),
            notes:{
                courseId:course_id,
                userId
            }
        };
        try{
            //initiate the payment using razorpay
            const paymentResponse=instance.orders.create(options);
            concole.log(paymentResponse);
            return res.status(200).json({
                success:true,
                courseName:course.courseName,
                courseDescription:course.courseDescription,
                thumbnail: course.thumbnail,
                orderId: paymentResponse.id,
                currency:paymentResponse.currency,
                amount:paymentResponse.amount,
            });
        }catch(err){
            console.log("From cpature-payment error:",err);
            return res.json({
                success:false,
                message:"could not initiate order"
            });
        }
        //return re
        return res.status(200).json({
            success:true,
            courseName:course.courseName,
            courseDescription:course.courseDescription,
            thumbnail:course.thumbnail,
            orderId:paymentResponse,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount
        })
    }catch(err){
        return res.json({
            success:false,
            message:"Please provide valid course ID"
        });
    }
}

//verifySignature of Razorpay and server
exports.verifySignature=async(req,res)=>{
    // try{
        const webhookSecrete="12345";
        const signature=req.headers('x-razorpay-signature');
        const shasum=crypto.createHmac("sha256",webhookSecrete);
        shasum.update(JSON.stringify(req.body));
        const digest=shasum.digest("hex");
        if(signature===digest){
            console.log("payment is Authorised!");

            const {courseId,userId}=req.body.payload.payment.entity.notes;
            try{
                 //fullfill the action
                 //find the course and enroll the student in it
                const enrolledCourse=await Course.findOneAndUpdate(
                    {_id:courseId},
                    {$push:{studentsEnrolled:userId}},
                    {new:true}
                    );
                if(!enrolledCourse){
                    return res.status(500).json({
                        success:false,
                        message:"course not found"
                    })
                }

                console.log(enrolledCourse);

                //find student and add the course in list of enrolled course
                const enrolledStudent=await User.findOneAndUpdate(
                    {_id:userId},
                    {$push:{course:courseId}},
                    {new:true}
                );
                console.log(enrolledStudent);

                // send confirmation mail
                const emailResponse=await mailSender(
                    enrolledStudent.email,
                    "Congratulation from studyNotion:",
                    "congratulation, you are onboarded into new studyNotion course"
                );
                console.log(emailResponse)
                return res.status(200).json({
                    success:true,
                    message:"Signature verified and course added!"
                });
            }catch(err){
                return res.json({
                    success:false,
                    message:err.message
                });
            }
        }else{
            return res.status(400).json({
                success:false,
                message:"Invalid request!"
            });
        }

    // }catch(err){ 
 
    // }
}
