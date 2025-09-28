// import dotenv from "dotenv";
// dotenv.config();
//
// import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";
// import crypto from "crypto";
//
// const s3Client = new S3Client({
//     region: "us-east-1", // region bebas, NOS hanya butuh endpoint
//     endpoint: process.env.BIZNET_ENDPOINT,
//     forcePathStyle: true,
//     credentials: {
//         accessKeyId: process.env.BIZNET_ACCESS_KEY,
//         secretAccessKey: process.env.BIZNET_SECRET_KEY,
//     },
// });
//
// // bikin konfigurasi CORS dalam XML sesuai spesifikasi S3
// const corsXml = `
// <CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
//   <CORSRule>
//     <AllowedOrigin>*</AllowedOrigin>
//     <AllowedMethod>GET</AllowedMethod>
//     <AllowedMethod>HEAD</AllowedMethod>
//     <AllowedMethod>PUT</AllowedMethod>
//     <AllowedMethod>POST</AllowedMethod>
//     <AllowedMethod>DELETE</AllowedMethod>
//     <AllowedHeader>*</AllowedHeader>
//     <ExposeHeader>ETag</ExposeHeader>
//     <MaxAgeSeconds>3000</MaxAgeSeconds>
//   </CORSRule>
// </CORSConfiguration>
// `.trim();
//
// // hitung MD5 dari XML body
// const md5 = crypto.createHash("md5").update(corsXml).digest("base64");
//
// const input = {
//     Bucket: process.env.BIZNET_BUCKET,
//     CORSConfiguration: {
//         CORSRules: [
//             {
//                 AllowedHeaders: ["*"],
//                 AllowedMethods: ["GET", "HEAD", "PUT", "POST", "DELETE"],
//                 AllowedOrigins: ["*"],
//                 ExposeHeaders: ["ETag"],
//                 MaxAgeSeconds: 3000,
//             },
//         ],
//     },
// };
//
// const main = async () => {
//     try {
//         const command = new PutBucketCorsCommand(input);
//
//         // tambahkan header Content-MD5 yang sesuai
//         command.middlewareStack.add(
//             (next) => async (args) => {
//                 args.request.headers["Content-MD5"] = md5;
//                 return next(args);
//             },
//             { step: "build" }
//         );
//
//         const response = await s3Client.send(command);
//         console.log("✅ Sukses set CORS:", response);
//     } catch (err) {
//         console.error("❌ Gagal set CORS:", err);
//     }
// };
//
// main();
