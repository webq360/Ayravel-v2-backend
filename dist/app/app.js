"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const globalErrorHandler_1 = __importDefault(require("./middlewares/globalErrorHandler"));
const notFound_1 = __importDefault(require("./middlewares/notFound"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
//parsers
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://www.ayravel.com",
        "https://ayravel.com",
        "https://admin.ayravel.com",
        "https://www.admin.ayravel.com",
        "https://www.ayravel-customer.com",
        "https://ayravel-customer.vercel.app",
        "https://ayravel-admin-new.vercel.app",
        "https://www.ayravel-admin-new.vercel.app",
        "https://ayravel-customer-2jgy.vercel.app",
        "https://www.ayravel-customer-2jgy.vercel.app",
    ],
    credentials: true,
}));
// Prevent Vercel edge cache from caching CORS responses
app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
});
//app routes
app.use("/api/v1", routes_1.default);
//root route
app.get("/", (req, res) => {
    res.send("AYraveL bd backend api server boosted on....🔥🔥🚀");
});
// //global error handler
app.use(globalErrorHandler_1.default);
// //not found route
app.use(notFound_1.default);
exports.default = app;
