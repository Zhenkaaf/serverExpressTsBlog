import { Request } from "express";
/* import * as express from "express"; */

/* функция checkAuth добавляет userId в объект запроса (req), но по умолчанию тип Request из Express не знает о таком свойстве. Чтобы избежать ошибок TypeScript, вы можете расширить тип Request*/
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
