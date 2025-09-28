// import { GetBucketCorsCommand } from "@aws-sdk/client-s3";
// import s3Client from "./s3.service.local.js";
//
// const main = async () => {
//     try {
//         const command = new GetBucketCorsCommand({ Bucket: "halodunia" });
//         const response = await s3Client.send(command);
//         console.log("📌 CORS Config sekarang:", JSON.stringify(response.CORSRules, null, 2));
//     } catch (err) {
//         console.error("❌ Error get CORS:", err);
//     }
// };
//
// main();
