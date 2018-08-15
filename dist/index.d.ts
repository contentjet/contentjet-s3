/// <reference types="node" />
import S3 = require('aws-sdk/clients/s3');
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
export declare const getEnv: (name: string, required?: boolean) => string;
export default class S3StorageBackend implements IStorageBackend {
    s3: S3;
    AWS_S3_BUCKET: string;
    AWS_S3_STORAGE_CLASS: string;
    AWS_S3_CACHE_CONTROL: string;
    AWS_S3_KEY_PREFIX: string;
    constructor();
    put(key: string, buffer: Buffer, mimetype: string): Promise<{}>;
    generateKey(projectId: number, name: string): string;
    write(projectId: number, file: IFile): Promise<IStorageResponse>;
}
