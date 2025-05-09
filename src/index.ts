import dotenv from "dotenv";
dotenv.config(); // Загружаем переменные из .env в process.env - который хранит переменные окружения.
/* Все импорты выполняются сразу, и если в одном из импортируемых файлов (cloudinary) есть код, 
который зависит от переменных окружения, он будет выполняться сразу же.
Важно, чтобы dotenv.config() был вызван до импорта файлов, которые зависят от этих переменных. */
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoute from "./routes/auth";
import postRoute from "./routes/posts";

const app = express();

const PORT = process.env.PORT || 5001; //process.env – это объект, встроенный в Node.js
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
app.use(cors()); //Теперь сервер принимает запросы с любого домена. cors()это middleware, который добавляет заголовки CORS в ответы сервера.
//  Браузер видит эти заголовки и разрешает клиенту отправлять запросы. Без CORS браузер блокирует запросы, если frontend и backend на разных доменах
app.use(express.urlencoded({ extended: true })); // Нужно для обработки form-data
app.use(express.json());
/*Когда клиент отправляет POST- или PUT-запрос с Content-Type: application/json, данные приходят в теле запроса (req.body) в формате JSON.
Однако по умолчанию Express не умеет их парсить, и req.body будет undefined.
Чтобы Express мог распознать JSON, используется express.json().  */

// Мидлвар для логирования каждого запроса
app.use((req, res, next) => {
    console.log("Request BODY:", req.body);
    console.log("Request URL:", req.originalUrl);
    console.log("Request Method:", req.method);
    /* app.use — это метод в Express.js (фреймворке для Node.js), который используется для добавления промежуточных обработчиков (middleware) в цепочку обработки запросов. 
Middleware — это функции, которые могут модифицировать запрос (request), ответ (response) или завершить обработку запроса и отправить ответ.
Добавление обработчиков маршрутов: app.use позволяет вам добавлять функции, которые будут выполняться на каждый запрос или для определённых маршрутов.
Middleware: app.use позволяет регистрировать обработчики, которые могут изменять объект запроса (req), объект ответа (res) или передавать управление следующему middleware с помощью функции next(). */
    next(); // Переходим к следующему middleware
});

app.get("/", (req, res) => {
    res.send("API is running...");
});

//http://localhost:5000
app.use("/api/auth", authRoute);
app.use("/api/post", postRoute);

async function start() {
    try {
        await mongoose.connect(
            `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.dfn7h.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`
        );

        app.listen(PORT, () =>
            console.log(`Server is running on port ${PORT}`)
        );
    } catch (error) {
        console.log(error);
    }
}
start();

//mongodb+srv://zhenkaaf:4g15vedJeJml2yiA@cluster0.dfn7h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0 */
