import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, ListObjectVersionsCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface BucketConfig {
    name: string;
    client: S3Client;
}

const B2_ENDPOINT = process.env.B2_ENDPOINT!;
const B2_REGION = process.env.B2_REGION!;

function initializeBucketConfigs(): BucketConfig[] {
    const rawBuckets = [
        {
            name: process.env.B2_BUCKET_1_NAME,
            accessKeyId: process.env.B2_BUCKET_1_KEY_ID,
            secretAccessKey: process.env.B2_BUCKET_1_APP_KEY
        },
        {
            name: process.env.B2_BUCKET_2_NAME,
            accessKeyId: process.env.B2_BUCKET_2_KEY_ID,
            secretAccessKey: process.env.B2_BUCKET_2_APP_KEY
        },
        {
            name: process.env.B2_BUCKET_3_NAME,
            accessKeyId: process.env.B2_BUCKET_3_KEY_ID,
            secretAccessKey: process.env.B2_BUCKET_3_APP_KEY
        }
    ];

    return rawBuckets
        .filter((b) => Boolean(b.name && b.accessKeyId && b.secretAccessKey))
        .map((b) => ({
            name: b.name!,
            client: new S3Client({
                endpoint: B2_ENDPOINT,
                region: B2_REGION,
                credentials: {
                    accessKeyId: b.accessKeyId!,
                    secretAccessKey: b.secretAccessKey!
                }
            })
        }));
}

const BUCKET_CONFIGS: BucketConfig[] = initializeBucketConfigs();

let roundRobinIndex = 0;

export async function uploadToAllBuckets(key: string, buffer: Buffer, contentType: string): Promise<boolean> {
    const uploadPromises = BUCKET_CONFIGS.map(async (bucket) => {
        const command = new PutObjectCommand({
            Bucket: bucket.name,
            Key: key,
            Body: buffer,
            ContentType: contentType
        });
        return bucket.client.send(command, { abortSignal: AbortSignal.timeout(15000) });
    });

    const results = await Promise.allSettled(uploadPromises);
    const hasSuccess = results.some((r) => r.status === "fulfilled");
    if (!hasSuccess) {
        throw new Error("Failed to replicate file to any storage bucket");
    }
    return true;
}

export async function generatePresignedDownloadUrl(key: string, filename: string, expiresInSeconds: number = 15): Promise<string> {
    const startIndex = roundRobinIndex % BUCKET_CONFIGS.length;
    roundRobinIndex = (roundRobinIndex + 1) % BUCKET_CONFIGS.length;

    const indices = [
        startIndex,
        (startIndex + 1) % BUCKET_CONFIGS.length,
        (startIndex + 2) % BUCKET_CONFIGS.length
    ];

    let lastError: any = null;

    for (const idx of indices) {
        const bucket = BUCKET_CONFIGS[idx];
        try {
            const command = new GetObjectCommand({
                Bucket: bucket.name,
                Key: key,
                ResponseContentDisposition: `attachment; filename="${filename.replace(/"/g, '')}"`
            });
            const url = await getSignedUrl(bucket.client, command, { expiresIn: expiresInSeconds });
            return url;
        } catch (err) {
            lastError = err;
        }
    }

    throw new Error(lastError?.message || "Failed to generate presigned download URL");
}

async function deletePrefixFromBucket(bucket: BucketConfig, prefix: string): Promise<void> {
    while (true) {
        const versionsRes = await bucket.client.send(
            new ListObjectVersionsCommand({ Bucket: bucket.name, Prefix: prefix }),
            { abortSignal: AbortSignal.timeout(15000) }
        );
        const objects = [...(versionsRes.Versions || []), ...(versionsRes.DeleteMarkers || [])]
            .filter((object) => Boolean(object.Key))
            .map((object) => ({ Key: object.Key!, VersionId: object.VersionId }));

        if (objects.length === 0) return;

        for (let index = 0; index < objects.length; index += 1000) {
            const result = await bucket.client.send(
                new DeleteObjectsCommand({
                    Bucket: bucket.name,
                    Delete: { Objects: objects.slice(index, index + 1000), Quiet: true }
                }),
                { abortSignal: AbortSignal.timeout(15000) }
            );
            if (result.Errors?.length) {
                throw new Error(result.Errors.map((error) => `${error.Key}: ${error.Code}`).join(", "));
            }
        }
    }
}

export async function deleteFromAllBuckets(keyOrPrefix: string): Promise<void> {
    if (BUCKET_CONFIGS.length === 0) {
        throw new Error("No Backblaze B2 buckets are configured");
    }
    await Promise.all(BUCKET_CONFIGS.map((bucket) => deletePrefixFromBucket(bucket, keyOrPrefix)));
}

export function getBucketNames(): string[] {
    return BUCKET_CONFIGS.map((b) => b.name);
}

export async function listBucketFiles(bucketName: string): Promise<Array<{ key: string; size: number; lastModified: string }>> {
    const bucket = BUCKET_CONFIGS.find((b) => b.name === bucketName);
    if (!bucket) throw new Error(`Unknown bucket: ${bucketName}`);

    const files: Array<{ key: string; size: number; lastModified: string }> = [];
    let continuationToken: string | undefined;

    do {
        const command = new ListObjectsV2Command({
            Bucket: bucket.name,
            ContinuationToken: continuationToken
        });
        const response = await bucket.client.send(command);
        if (response.Contents) {
            for (const obj of response.Contents) {
                files.push({
                    key: obj.Key || "",
                    size: obj.Size || 0,
                    lastModified: obj.LastModified?.toISOString() || ""
                });
            }
        }
        continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
    } while (continuationToken);

    return files;
}

export async function purgeEntireBucket(bucketName: string): Promise<number> {
    const bucket = BUCKET_CONFIGS.find((b) => b.name === bucketName);
    if (!bucket) return 0;

    let totalDeleted = 0;
    let keyMarker: string | undefined;
    let versionIdMarker: string | undefined;

    do {
        const command = new ListObjectVersionsCommand({
            Bucket: bucket.name,
            KeyMarker: keyMarker,
            VersionIdMarker: versionIdMarker
        });
        const response = await bucket.client.send(command);
        const objectsToDelete: Array<{ Key: string; VersionId?: string }> = [];

        if (response.Versions) {
            for (const v of response.Versions) {
                if (v.Key) objectsToDelete.push({ Key: v.Key, VersionId: v.VersionId });
            }
        }

        if (response.DeleteMarkers) {
            for (const dm of response.DeleteMarkers) {
                if (dm.Key) objectsToDelete.push({ Key: dm.Key, VersionId: dm.VersionId });
            }
        }

        if (objectsToDelete.length > 0) {
            await bucket.client.send(
                new DeleteObjectsCommand({
                    Bucket: bucket.name,
                    Delete: {
                        Objects: objectsToDelete,
                        Quiet: true
                    }
                })
            );
            totalDeleted += objectsToDelete.length;
        }

        keyMarker = response.IsTruncated ? response.NextKeyMarker : undefined;
        versionIdMarker = response.IsTruncated ? response.NextVersionIdMarker : undefined;
    } while (keyMarker || versionIdMarker);

    return totalDeleted;
}

export async function purgeAllBuckets(): Promise<{ total: number; perBucket: Record<string, number> }> {
    const perBucket: Record<string, number> = {};
    let total = 0;

    for (const bucket of BUCKET_CONFIGS) {
        const count = await purgeEntireBucket(bucket.name);
        perBucket[bucket.name] = count;
        total += count;
    }

    return { total, perBucket };
}