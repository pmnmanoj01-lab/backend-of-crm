import mongoose, { mongo } from 'mongoose'

const categorySchema=new mongoose.Schema({
    name:{
        type:String,
        trim:true
    }
},{
    timestamps:true
});
const Category=mongoose.models.Category||mongoose.model("Category",categorySchema);
export default Category
