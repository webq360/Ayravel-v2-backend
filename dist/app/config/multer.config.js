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
exports.multerMemory = exports.multerUpload = void 0;
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_config_1 = require("./cloudinary.config");
const multer_1 = __importDefault(require("multer"));
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_config_1.cloudinaryUpload,
    params: (req, file) => __awaiter(void 0, void 0, void 0, function* () {
        const fileName = file.originalname
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/\.[^.]*$/, '')
            .replace(/[^a-z0-9\-]/g, '');
        const uniqueFileName = Math.random().toString(36).substring(2) +
            '-' +
            Date.now() +
            '-' +
            fileName;
        const isPdf = file.mimetype === 'application/pdf';
        if (isPdf) {
            return {
                resource_type: 'raw',
                public_id: `${uniqueFileName}.pdf`,
                folder: 'pdfs',
            };
        }
        return {
            resource_type: 'auto',
            public_id: uniqueFileName,
        };
    }),
});
// Cloudinary storage for direct upload (categories)
exports.multerUpload = (0, multer_1.default)({
    storage: storage,
});
// Memory storage for manual buffer upload (brands, products)
exports.multerMemory = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
});
