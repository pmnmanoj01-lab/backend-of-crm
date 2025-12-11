import mongoose from 'mongoose'
const settingSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    weightProvided: { type: Number, required: true },
    weightLoss: { type: Number, default: 0 },
    returnedWeight: { type: Number, default: 0 },
    diamondCategory: { type: String },
    diamondSubCategory: { type: String },
    diamondWeight: { type: Number, default: 0 },
    diamondChildCategory: { type: String },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
})

const Setting = mongoose.models.Setting || mongoose.model("Setting", settingSchema);
export default Setting