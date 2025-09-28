// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import multer from "multer";
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
//
// dotenv.config();
//
// const app = express();
// app.use(cors());
// app.use(express.json());
//
// // Multer untuk handle upload file
// const storage = multer.memoryStorage();
// const upload = multer({ storage });
//
// // Konfigurasi S3 (Biznet)
// const s3 = new S3Client({
//     region: "us-east-1", // Biznet ga butuh region khusus, pakai default aja
//     endpoint: process.env.BIZNET_ENDPOINT,
//     credentials: {
//         accessKeyId: process.env.BIZNET_ACCESS_KEY,
//         secretAccessKey: process.env.BIZNET_SECRET_KEY,
//     },
// });
//
// // API untuk upload
// app.post("/upload", upload.single("file"), async (req, res) => {
//     try {
//         const file = req.file;
//
//         const params = {
//             Bucket: process.env.BIZNET_BUCKET,
//             Key: Date.now() + "-" + file.originalname, // nama unik
//             Body: file.buffer,
//             ContentType: file.mimetype,
//         };
//
//         const command = new PutObjectCommand(params);
//         await s3.send(command);
//
//         const fileUrl = `${process.env.BIZNET_ENDPOINT}/${process.env.BIZNET_BUCKET}/${params.Key}`;
//         res.json({ url: fileUrl });
//     } catch (err) {
//         console.error("Upload error:", err);
//         res.status(500).json({ error: "Upload failed" });
//     }
// });
//
// app.listen(process.env.PORT, () => {
//     console.log(`Server running at http://localhost:${process.env.PORT}`);
// });
