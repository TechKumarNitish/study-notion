const SubSection=require("../models/SubSection");
const Scetion=require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const Section = require("../models/Section");
require("dotenv").config();

exports.createSubSection=async(req,res)=>{
    try{
        //fetch data
        const{
            sectionId,
            title,
            // timeDuration,// dont take timeduration it will be best if take timeduartion from uploadVedioDetails returned by cloudinary after uploading it
            description
        }=req.body;
        //extract file/vedio
        const video=req.files.videoFile;
        //validation
        if(!sectionId || !title || !description ||!video){
            return res.status(400).json({
                success:true,
                message:"All feild are required!"
            });
        }
        //upload vedio to cloudinary
        const uploadDetails=await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
        console.log(uploadDetails)

        //create a subsection
        const subSection=await SubSection.create({
            title, 
            timeDuration:`${uploadDetails.duration}`,
            description,
            videoUrl:uploadDetails.secure_url
        });

        //update section with this sub section object Id
        const updatedSections=await Section.findByIdAndUpdate({_id:sectionId},
            {$push:{subSection:subSection._id}},
            {new:true}
            ).populate('subSection').exec();
        //HW: log updated section here, after adding populate query
        //return res
        return res.status(200).json({
            success:true,
            message:"sub-sections created successfully!",
            data:updatedSections
        });
    }catch(err){
        console.log("From create sub-section error:",err);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error:err.message
        });
    }
}

//HW: update sub-section
//HW: delete sub-section

exports.updateSubSection = async (req, res) => {
    try {
      const { sectionId, title, description } = req.body
      const subSection = await SubSection.findById(sectionId)
  
      if (!subSection) {
        return res.status(404).json({
          success: false,
          message: "SubSection not found",
        })
      }
  
      if (title !== undefined) {
        subSection.title = title
      }
  
      if (description !== undefined) {
        subSection.description = description
      }
      if (req.files && req.files.video !== undefined) {
        const video = req.files.video
        const uploadDetails = await uploadImageToCloudinary(
          video,
          process.env.FOLDER_NAME
        )
        subSection.videoUrl = uploadDetails.secure_url
        subSection.timeDuration = `${uploadDetails.duration}`
      }
  
      await subSection.save()
  
      return res.json({
        success: true,
        message: "Section updated successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the section",
      })
    }
  }
  
  exports.deleteSubSection = async (req, res) => {
    try {
      const { subSectionId, sectionId } = req.body
      await Section.findByIdAndUpdate(
        { _id: sectionId },
        {
          $pull: {
            subSection: subSectionId,
          },
        }
      )
      const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })
  
      if (!subSection) {
        return res
          .status(404)
          .json({ success: false, message: "SubSection not found" })
      }
  
      return res.json({
        success: true,
        message: "SubSection deleted successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the SubSection",
      })
    }
  }

