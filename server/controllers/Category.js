const Category=require("../models/Category");

//createTag handler
exports.createCategory=async(req,res)=>{
    try{
        //fetch data
        const{name,description}=req.body;

        //validation
    if(!name /*|| !description*/)
            return res.status(400).json({
                success:false,
                message:"All feilds are required!",
            });
        
        //create entry in db
        const categoryDetails=await Category.create({
            name,
            description
        });

        console.log(categoryDetails);
        //return response
        return res.status(200).json({
            success:true,
            message:"Category created successfully!"
        });
    }catch(err){
        console.log(err)
        return res.status().json({
            success:false,
            message:err.message
        });
    }
}

//getAllTags...............................
exports.showAllCategories=async(req,res)=>{
    try{
        const allCategory=await Category.find({},{name:true,description:true});
        return res.status(200).json({
            success:true,
            message:"All Category returned successfulyy",
            data:allCategory
        });
    }catch(err){
        console.log(err);
        return res.status().json({
            success:false,
            message:err.message
        });
    }
}

//categoryPageDetails
exports.categoryPageDetails=async (req,res)=>{
    try{
        //get category id
        const {categoryId}=req.body;

        //get course for the specified category
        const selectedCategory=await Category.findById(categoryId).
        populate("courses").exec();

        //validation
        if(!selectedCategory){
            console.log("category not found");
            return res.status(404).json({
                success:false,
                message:"Category not found"
            });
        }
        
        if(selectedCategory.courses.length===0){
            console.log("No courses found for the selected category");
            return res.status(404).json({
                success:false,
                message:"No courses found for the selected category"
            });
        }

        //get courses for different category
        const differentCategory=await Category.find({
            _id:{$ne:categoryId}
        }).populate("courses");

        //get top selling course
        //HW

        //return response
        return res.status(200).json({
            success:true,
            data:{
                selectedCategory,
                differentCategory
            }
        });

    }catch(err){
        return res.status(500).json({
            success:false,
            message:err.message
        });
    }
}