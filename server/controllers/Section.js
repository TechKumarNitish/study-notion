const Course=require("../models/Course");
const SubSection=require("../models/SubSection");
const Section=require("../models/Section");
const { default: mongoose } = require("mongoose");

exports.createSection=async(req,res)=>{
    try{
        //data fetch
        const {sectionName,courseId}=req.body;

        //data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"Missing properties",
            });
        }

        //create section
        const newSection=await Section.create({sectionName});

        //update course

        let cid=new mongoose.Types.ObjectId(courseId);
        const updatedCourseDetails=await Course.findByIdAndUpdate(
            {_id:cid},
            {$push:{courseContent:newSection._id}},
            {new:true}
        ).populate({//TODO
            path:'courseContent',
            populate:{
                path:'subSection',
            }
        });
        console.log(courseId, cid)
        console.log(updatedCourseDetails);
        //return res
        return res.status(200).json({
            success:true,
            message:"Section created successfully",
            data: updatedCourseDetails
        });

    }catch(err){
        return res.status(500).json({
            success:false,
            message:"Unable to create section",
            error:err.message,
        });
    }
}

exports.updateSection=async(req,res)=>{
    try{
        //data fetch
        const {sectionName,sectionId}=req.body;

        //data validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"Missing properties",
            });
        }

        //update section
        const updatedSectionDetails=await Section.findByIdAndUpdate(
            sectionId,
            {sectionName},
            {new:true}
        );


        // what if section does not exist

        //return res
        return res.status(200).json({
            success:true,
            message:"Section updated successfully",
            data:updatedSectionDetails
        });

    }catch(err){
        return res.status(500).json({
            success:false,
            message:"Unable to update section, please try again",
            error:err.message,
        });
    }
}

exports.deleteSection=async(req,res)=>{
    try{
        // get Id - assuming we are sending ID in params
        const {sectionId, courseId}=req.body;

        
        //use findByIdAndDelete
        let deletedSection=await Section.findByIdAndDelete(sectionId);
        //TODO: delete its subsection also

        //TODO: Do we need to delete the entry from course schema
        let updatedCourse=await Course.findByIdAndUpdate(courseId,
        {
            $pull:{
                section:deletedSection._id
            }
        },
        {
            new:true
        });
        //return res
        return res.status(200).json({
            success:true,
            message:"Section deleted successfully",
            data:updatedCourse
        });

        //is it really giving updated course
        
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"Unable to delete section, please try again",
            error:err.message,
        });
    }
}