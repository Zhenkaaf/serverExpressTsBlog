"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const app = (0, express_1.default)();
dotenv_1.default.config(); // Загружаем переменные из .env в process.env - который хранит переменные окружения.
const PORT = process.env.PORT || 5001; //process.env – это объект, встроенный в Node.js
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
app.use((0, cors_1.default)()); //Теперь сервер принимает запросы с любого домена. cors()это middleware, который добавляет заголовки CORS в ответы сервера.
//  Браузер видит эти заголовки и разрешает клиенту отправлять запросы. Без CORS браузер блокирует запросы, если frontend и backend на разных доменах
app.use(express_1.default.json());
/*Когда клиент отправляет POST- или PUT-запрос с Content-Type: application/json, данные приходят в теле запроса (req.body) в формате JSON.
Однако по умолчанию Express не умеет их парсить, и req.body будет undefined.
Чтобы Express мог распознать JSON, используется express.json().  */
// Мидлвар для логирования каждого запроса
app.use((req, res, next) => {
    console.log(`1111111111111111`);
    next(); // Переходим к следующему middleware
});
// Мидлвар для проверки времени запроса
app.use((req, res, next) => {
    console.log(`2222222222222222222222`);
    next(); // Переходим к следующему middleware
});
app.get("/", (req, res) => {
    res.send("API is running...");
});
//http://localhost:5000
app.use("/api/auth", auth_1.default);
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.dfn7h.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`);
            app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
        }
        catch (error) {
            console.log(error);
        }
    });
}
start();
//mongodb+srv://zhenkaaf:4g15vedJeJml2yiA@cluster0.dfn7h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0 */
