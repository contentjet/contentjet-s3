/// <reference types="node" />
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
