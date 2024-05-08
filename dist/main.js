"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const path_1 = require("path");
const express_1 = __importDefault(require("express"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Open API Nest JWT')
        .setDescription('API Nest JWT')
        .setVersion('1.0')
        .addTag('Nest JWT')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('openapi', app, document);
    const cors = {
        origin: [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost',
            '*',
        ],
        methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
        preflightContinue: false,
        optionsSuccessStatus: 204,
        credentials: true,
        allowedHeaders: ['*'],
    };
    app.enableCors(cors);
    const expressApp = (0, express_1.default)();
    expressApp.use('/uploads', express_1.default.static((0, path_1.join)(__dirname, '..', 'uploads')));
    app.use(expressApp);
    await app.listen(5000);
}
bootstrap();
//# sourceMappingURL=main.js.map