"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfRoutes = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
// Serve PDF files
router.get('/pdfs/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path_1.default.join(process.cwd(), 'uploads', 'pdfs', filename);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.sendFile(filepath);
});
exports.PdfRoutes = router;
