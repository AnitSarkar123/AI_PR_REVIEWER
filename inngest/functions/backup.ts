import { inngest } from "../client";
import { exec } from "child_process";
import { promisify } from "util";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as fs from "fs";

const execAsync = promisify(exec);

export const backupDatabase = inngest.createFunction(
    { id: "backup-database" },
    { cron: "0 0 * * *" }, // Daily at midnight
    async ({ step }) => {
        await step.run("dump-and-upload", async () => {
            const dbUrl = process.env.DATABASE_URL;
            if (!dbUrl) throw new Error("DATABASE_URL not set");
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `backup-${timestamp}.sql`;
            const filepath = `/tmp/${filename}`;
            
            // Execute pg_dump
            await execAsync(`pg_dump "${dbUrl}" > ${filepath}`);
            
            // Upload to S3
            const s3 = new S3Client({
                region: process.env.AWS_REGION || "us-east-1",
            });
            
            const fileStream = fs.createReadStream(filepath);
            await s3.send(new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET || "backups",
                Key: `db-backups/${filename}`,
                Body: fileStream
            }));
            
            // Clean up
            fs.unlinkSync(filepath);
            
            return { success: true, filename };
        });
    }
);
