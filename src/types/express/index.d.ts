import { Request } from "express";
/* import * as express from "express"; */

export interface RequestCustom extends Request {
    userId?: string;
    file?: Express.Multer.File;
}

declare namespace NodeJS {
    interface ProcessEnv {
        CLOUDINARY_CLOUD_NAME: string;
        CLOUDINARY_API_KEY: string;
        CLOUDINARY_API_SECRET: string;
        PORT: string;
        DB_USER: string;
        DB_PASSWORD: string;
        DB_NAME: string;
        JWT_SECRET: string;
    }
}
