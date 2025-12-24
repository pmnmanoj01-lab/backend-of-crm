import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import CadProduct from "../models/CadProduct.js";

export const createCadProduct = async (req, res) => {
    try {
        console.log("res or req data is as--------> ", req.file.key)
        res.status(201).json({ success: true, image });
    } catch (error) {
        console.log("error is occuring when creating the product")
        res.status(500).json({ success: false, message: "Something Went Wrong" });
    }
}
export const getAllCadProduct = async (req, res) => {
    try {
        const images = await CadProduct.find({ userId: req.user.id });

        const result = await Promise.all(
            images.map(async (img) => {
                const command = new GetObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: img.imageKey,
                });

                const url = await getSignedUrl(s3, command, {
                    expiresIn: 300,
                });

                return {
                    _id: img._id,
                    title: img.title,
                    description: img.description,
                    createdAt: img.createdAt,
                    imageUrl: url,
                };
            })
        );

        res.json(result);
    } catch (error) {
        console.log("error is occuring when creating the product")
        res.status(500).json({ success: false, message: "Something Went Wrong" });
    }
}
export const deleteCadProduct = async (req, res) => {
    try {
        const image = await CadProduct.findOne({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!image)
            return res.status(404).json({ message: "Not found" });

        await s3.send(
            new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: image.imageKey,
            })
        );

        await image.deleteOne();

        res.status(200).json({ success: true ,message:"Product deleted "});
    } catch (error) {
        console.log("error is occuring when creating the product")
        res.status(500).json({ success: false, message: "Something Went Wrong" });
    }
}
export const updateCadProduct = async (req, res) => {
   try {
      const image = await CadProduct.findOne({
        _id: req.params.id,
        userId: req.user.id,
      });

      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }

      // 🔹 Update metadata
      if (req.body.title !== undefined) {
        image.title = req.body.title;
      }

      if (req.body.description !== undefined) {
        image.description = req.body.description;
      }

      // 🔹 If new image is uploaded → replace
      if (req.file) {
        // delete old image from S3
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: image.imageKey,
          })
        );

        // set new image key
        image.imageKey = req.file.key;
      }

      await image.save();

      res.json({
        success: true,
        message: "Image updated successfully",
        image,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Update failed",
      });
    }
  }

