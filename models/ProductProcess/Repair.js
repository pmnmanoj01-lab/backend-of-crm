import mongoose from 'mongoose'
const repairSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    weightProvided: { type: Number, required: true },
    weightLoss: { type: Number, default: 0 },
    scrab: { type: Number, default: 0 },
    returnedWeight: { type: Number, default: 0 },
        material: { type: String },
    subCategory: { type: String },
    extraMaterialWeight: { type: Number, default: 0 },
    childCategory: { type: String },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

},{
    timestamps:true
})

const Repair = mongoose.models.Repair || mongoose.model("Repair", repairSchema);
export default Repair