import multer from "multer";
import multerS3 from "multer-s3";
import {s3} from "../config/aws.js"
import { v4 as uuid } from "uuid";

export const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const ext = file.originalname.split(".").pop();
      cb(null, `cadproduct/${uuid()}.${ext}`);
    },
  }),
});
