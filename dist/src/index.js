"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const S3 = require("aws-sdk/clients/s3");
const env_1 = require("./utils/env");
class S3StorageBackend {
    constructor() {
        this.s3 = new S3({
            accessKeyId: env_1.getEnv('AWS_ACCESS_KEY_ID', true),
            secretAccessKey: env_1.getEnv('AWS_SECRET_ACCESS_KEY', true),
            region: env_1.getEnv('AWS_REGION', true)
        });
        this.put = this.put.bind(this);
        this.generateKey = this.generateKey.bind(this);
        this.AWS_S3_BUCKET = env_1.getEnv('AWS_S3_BUCKET', true);
        this.AWS_S3_STORAGE_CLASS = env_1.getEnv('AWS_S3_STORAGE_CLASS') || 'STANDARD';
        this.AWS_S3_CACHE_CONTROL = env_1.getEnv('AWS_S3_CACHE_CONTROL') || 'max-age=604800';
        this.AWS_S3_KEY_PREFIX = env_1.getEnv('AWS_S3_KEY_PREFIX') || '';
    }
    async put(key, buffer) {
        return new Promise((resolve, reject) => {
            const params = {
                Bucket: this.AWS_S3_BUCKET,
                StorageClass: this.AWS_S3_STORAGE_CLASS,
                CacheControl: this.AWS_S3_CACHE_CONTROL,
                Body: buffer,
                Key: key
            };
            this.s3.putObject(params, (err, data) => {
                if (err)
                    return reject(err);
                resolve(data);
            });
        });
    }
    generateKey(projectId, name) {
        const now = new Date();
        return [
            this.AWS_S3_KEY_PREFIX,
            `${projectId}/${now.getFullYear()}-${now.getMonth() + 1}/`,
            `${now.getTime()}-${Math.floor(Math.random() * 1000000)}${path.extname(name)}`
        ].join('');
    }
    ;
    async write(projectId, file) {
        const key = this.generateKey(projectId, file.originalname);
        const puts = [this.put(key, file.buffer)];
        let thumbnailKey;
        if (file.thumbnailBuffer) {
            thumbnailKey = key.replace(/(\w+)(\.\w+)$/, '$1-thumb$2');
            puts.push(this.put(key, file.thumbnailBuffer));
        }
        await Promise.all(puts);
        return {
            filePath: key,
            thumbnailPath: thumbnailKey
        };
    }
}
module.exports = S3StorageBackend;
