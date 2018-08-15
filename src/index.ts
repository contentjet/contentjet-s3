import * as path from 'path';
import S3 = require('aws-sdk/clients/s3');
import { get } from 'lodash';

export interface IFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  thumbnailBuffer: Buffer | undefined;
  width: number | undefined;
  height: number | undefined;
}

export interface IStorageResponse {
  filePath: string;
  thumbnailPath?: string;
}

export interface IStorageBackend {
  write(projectId: number, file: IFile): Promise<IStorageResponse>;
}

export const getEnv = (name: string, required: boolean = false): string => {
  const value = get(process.env, name) as string;
  if (!value && required) throw new Error(`Missing environment variable. ${name} must be set`);
  return value;
};

class S3StorageBackend implements IStorageBackend {

  s3: S3;
  AWS_S3_BUCKET: string;
  AWS_S3_STORAGE_CLASS: string;
  AWS_S3_CACHE_CONTROL: string;
  AWS_S3_KEY_PREFIX: string;

  constructor() {
    this.s3 = new S3({
      accessKeyId: getEnv('AWS_ACCESS_KEY_ID', true),
      secretAccessKey: getEnv('AWS_SECRET_ACCESS_KEY', true),
      region: getEnv('AWS_REGION', true)
    });
    this.put = this.put.bind(this);
    this.generateKey = this.generateKey.bind(this);
    this.AWS_S3_BUCKET = getEnv('AWS_S3_BUCKET', true);
    this.AWS_S3_STORAGE_CLASS = getEnv('AWS_S3_STORAGE_CLASS') || 'STANDARD';
    this.AWS_S3_CACHE_CONTROL = getEnv('AWS_S3_CACHE_CONTROL') || 'max-age=604800';
    this.AWS_S3_KEY_PREFIX = getEnv('AWS_S3_KEY_PREFIX') || '';
  }

  async put(key: string, buffer: Buffer) {
    return new Promise((resolve, reject) => {
      const params = {
        Bucket: this.AWS_S3_BUCKET,
        StorageClass: this.AWS_S3_STORAGE_CLASS,
        CacheControl: this.AWS_S3_CACHE_CONTROL,
        Body: buffer,
        Key: key
      };
      this.s3.putObject(params, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    })
  }

  generateKey(projectId: number, name: string): string {
    const now = new Date();
    return [
      this.AWS_S3_KEY_PREFIX,
      `${projectId}/${now.getFullYear()}-${now.getMonth() + 1}/`,
      `${now.getTime()}-${Math.floor(Math.random() * 1000000)}${path.extname(name)}`
    ].join('');
  };

  async write(projectId: number, file: IFile): Promise<IStorageResponse> {
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
