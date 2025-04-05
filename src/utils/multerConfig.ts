import { Response, Request, NextFunction } from "express";
import multer from "multer";

// Разрешенные MIME-типы
const allowedMimeTypes = ["image/jpeg", "image/png"];
// Ограничения (размер файла)
const limits: multer.Options["limits"] = {
    fileSize: 5 * 1024 * 1024, // 5MB
};
// файл сохраняется в оперативной памяти, так как файл пойдёт в Cloudinary
const storage = multer.memoryStorage();

// Фильтр файлов (разрешаем только изображения)
const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); // Файл принят
    } else {
        console.log(
            `Invalid file type: ${file.mimetype}. Only JPEG and PNG are allowed.`
        );
        // Передаем обычную ошибку для неподдерживаемого формата
        cb(new Error("Invalid file type. Only JPEG and PNG are allowed."));
    }
};

// Экспорт multer с настройками
const upload = multer({
    storage,
    fileFilter,
    limits,
});

/* Этот middleware не должен передавать данные запроса дальше, потому что он обрабатывает только ошибки.  */
const handleFileUploadError = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            // Логируем ошибку, если файл слишком большой
            console.error(
                `File is too large. Max size is 5MB. Error: ${err.message}`
            );
            return res.status(400).json({
                message: `File is too large. Max size is 5MB.`,
            });
        }
        // Если другая ошибка multer
        console.error(`Multer error: ${err.message}`);
        return res.status(400).json({ message: err.message });
    } else if (err instanceof Error) {
        // Обработка ошибки неподдерживаемого формата файла
        console.error(`From cb error: ${err.message}`);
        return res.status(400).json({ message: err.message });
    }

    // Если ошибка не от multer, можно отправить общий ответ об ошибке
    return res.status(500).json({ message: "Internal Server Error" });
};

export { upload, handleFileUploadError };
