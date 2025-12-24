import mongoose, { mongo } from 'mongoose'

const subCategorySchema=new mongoose.Schema({
    name:{
        type:String,
        trim:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category"
    }
},{
    timestamps:true
});
const SubCategory=mongoose.models.SubCategory||mongoose.model("SubCategory",subCategorySchema);
export default SubCategory