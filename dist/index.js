"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const S3 = require("aws-sdk/clients/s3");
const lodash_1 = require("lodash");
exports.getEnv = (name, required = false) => {
    const value = lodash_1.get(process.env, name);
    if (!value && required)
        throw new Error(`Missing environment variable. ${name} must be set`);
    return value;
};
class S3StorageBackend {
    constructor() {
        this.s3 = new S3({
            accessKeyId: exports.getEnv('AWS_ACCESS_KEY_ID', true),
            secretAccessKey: exports.getEnv('AWS_SECRET_ACCESS_KEY', true),
            region: exports.getEnv('AWS_REGION', true)
        });
        this.put = this.put.bind(this);
        this.generateKey = this.generateKey.bind(this);
        this.AWS_S3_BUCKET = exports.getEnv('AWS_S3_BUCKET', true);
        this.AWS_S3_STORAGE_CLASS = exports.getEnv('AWS_S3_STORAGE_CLASS') || 'STANDARD';
        this.AWS_S3_CACHE_CONTROL = exports.getEnv('AWS_S3_CACHE_CONTROL') || 'max-age=604800';
        this.AWS_S3_KEY_PREFIX = exports.getEnv('AWS_S3_KEY_PREFIX') || '';
    }
    async put(key, buffer, mimetype) {
        return new Promise((resolve, reject) => {
            const params = {
                Bucket: this.AWS_S3_BUCKET,
                StorageClass: this.AWS_S3_STORAGE_CLASS,
                CacheControl: this.AWS_S3_CACHE_CONTROL,
                ContentType: mimetype,
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
        const puts = [this.put(key, file.buffer, file.mimetype)];
        let thumbnailKey;
        if (file.thumbnailBuffer) {
            thumbnailKey = key.replace(/(\w+)(\.\w+)$/, '$1-thumb$2');
            puts.push(this.put(thumbnailKey, file.thumbnailBuffer, file.mimetype));
        }
        await Promise.all(puts);
        return {
            filePath: key,
            thumbnailPath: thumbnailKey
        };
    }
}
exports.default = S3StorageBackend;
