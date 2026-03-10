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
exports.brandsControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const brands_service_1 = require("./brands.service");
const cloudinary_config_1 = require("../../config/cloudinary.config");
/**
 * 🔹 Get all brands
 */
const getAllBrands = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield brands_service_1.brandServices.getAllBrandsFromDB();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Brands retrieved successfully!",
        data: result,
    });
}));
/**
 * 🔹 Get single brand
 */
const getSingleBrand = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield brands_service_1.brandServices.getSingleBrandFromDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Brand data retrieved successfully!",
        data: result,
    });
}));
/**
 * 🔹 Create brand (accepts both files and JSON)
 */
const createBrand = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const files = req.files || {};
    let iconUrl = req.body.iconUrl || "";
    if ((_b = (_a = files["iconFile"]) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.buffer) {
        const uploaded = yield (0, cloudinary_config_1.uploadBufferToCloudinary)(files["iconFile"][0].buffer, files["iconFile"][0].originalname);
        iconUrl = (uploaded === null || uploaded === void 0 ? void 0 : uploaded.secure_url) || "";
    }
    const brandData = Object.assign(Object.assign({}, req.body), { icon: {
            name: req.body.iconName || "",
            url: iconUrl,
        }, images: [] });
    // ✅ Handle images (array of layout + image)
    if ((_c = files["imagesFiles"]) === null || _c === void 0 ? void 0 : _c.length) {
        brandData.images = yield Promise.all(files["imagesFiles"].map((file, index) => __awaiter(void 0, void 0, void 0, function* () {
            const uploaded = yield (0, cloudinary_config_1.uploadBufferToCloudinary)(file.buffer, file.originalname);
            return {
                layout: req.body[`images[${index}].layout`] ||
                    req.body.layout ||
                    "grid",
                image: (uploaded === null || uploaded === void 0 ? void 0 : uploaded.secure_url) || "",
            };
        })));
    }
    else if (req.body.images) {
        // ✅ Handle JSON input for images
        try {
            brandData.images = Array.isArray(req.body.images)
                ? req.body.images
                : JSON.parse(req.body.images);
        }
        catch (_d) {
            brandData.images = [];
        }
    }
    const result = yield brands_service_1.brandServices.createBrandOnDB(brandData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: "Brand created successfully!",
        data: result,
    });
}));
/**
 * 🔹 Update brand (accepts both files and JSON)
 */
const updateBrand = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { id } = req.params;
    const files = req.files || {};
    const updatedData = Object.assign({}, req.body);
    // ✅ Update icon (prefer uploaded file)
    if ((_b = (_a = files["iconFile"]) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.buffer) {
        const uploaded = yield (0, cloudinary_config_1.uploadBufferToCloudinary)(files["iconFile"][0].buffer, files["iconFile"][0].originalname);
        updatedData.icon = {
            name: req.body.iconName || "",
            url: (uploaded === null || uploaded === void 0 ? void 0 : uploaded.secure_url) || "",
        };
    }
    else if (req.body.iconUrl || req.body.iconName) {
        updatedData.icon = {
            name: req.body.iconName || "",
            url: req.body.iconUrl || "",
        };
    }
    // ✅ Update images (either uploaded files or JSON)
    if ((_c = files["imagesFiles"]) === null || _c === void 0 ? void 0 : _c.length) {
        updatedData.images = yield Promise.all(files["imagesFiles"].map((file, index) => __awaiter(void 0, void 0, void 0, function* () {
            const uploaded = yield (0, cloudinary_config_1.uploadBufferToCloudinary)(file.buffer, file.originalname);
            return {
                layout: req.body[`images[${index}].layout`] ||
                    req.body.layout ||
                    "grid",
                image: (uploaded === null || uploaded === void 0 ? void 0 : uploaded.secure_url) || "",
            };
        })));
    }
    else if (req.body.images) {
        try {
            updatedData.images = Array.isArray(req.body.images)
                ? req.body.images
                : JSON.parse(req.body.images);
        }
        catch (_d) {
            updatedData.images = [];
        }
    }
    const result = yield brands_service_1.brandServices.updateBrandOnDB(id, updatedData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Brand updated successfully!",
        data: result,
    });
}));
/**
 * 🔹 Delete brand
 */
const deleteBrand = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield brands_service_1.brandServices.deleteBrandFromDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Brand deleted successfully!",
        data: result,
    });
}));
exports.brandsControllers = {
    getAllBrands,
    getSingleBrand,
    createBrand,
    updateBrand,
    deleteBrand,
};
