import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: String,
    description: String,
    imageKey: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const CadProduct=mongoose.models.CadProduct||mongoose.model("CadProduct", imageSchema);
export default CadProduct
