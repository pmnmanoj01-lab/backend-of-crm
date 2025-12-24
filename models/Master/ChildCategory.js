import mongoose, { mongo } from 'mongoose'

const childCategorySchema=new mongoose.Schema({
    name:{
        type:String,
        trim:true
    },
    subCategory:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"SubCategory",
        required:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true
    }
},{
    timestamps:true
});
const ChildCategory=mongoose.models.ChildCategory||mongoose.model("ChildCategory",childCategorySchema);
export default ChildCategory