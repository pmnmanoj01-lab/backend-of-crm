import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    material: { type: String, required: true },
    subCategory: { type: String },
    childCategory: { type: String },
    weightProvided: { type: Number, required: true },
    weightLoss: { type: Number, default: 0 },
    returnedWeight: { type: Number, default: 0 },
    extraWight: { type: Number, default: 0 },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    filing: { type: mongoose.Schema.Types.ObjectId, ref: "Filing", default: null },
    setting: { type: mongoose.Schema.Types.ObjectId, ref: "Setting", default: null },
    polish: { type: mongoose.Schema.Types.ObjectId, ref: "Polish", default: null },
    prepolish: { type: mongoose.Schema.Types.ObjectId, ref: "PrePolish", default: null },
    repair: { type: mongoose.Schema.Types.ObjectId, ref: "Repair", default: null },
    completedProcesses:[String],

  },
  { timestamps: true }
);





const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
