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
exports.productControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const product_service_1 = require("./product.service");
const getAllProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield product_service_1.productServices.getAllProductFromDB(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Products retrieve successfully!",
        data: result.data,
        meta: result.meta,
    });
}));
const getProductsByCategoryandTag = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category, tag } = req.query;
    const result = yield product_service_1.productServices.getProductsByCategoryandTag(category, tag);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Products retrieve successfully!",
        data: result,
    });
}));
const getSingleProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield product_service_1.productServices.getSingleProductFromDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Product retrieve successfully!",
        data: result,
    });
}));
// const createProduct = catchAsync(async (req, res) => {
//   const files = req.files as {
//     [fieldname: string]: Express.Multer.File[];
//   };
//   const productData = {
//     ...req.body,
//     featuredImg: files["featuredImgFile"]?.[0]?.path || "",
//     gallery: files["galleryImagesFiles"]
//       ? files["galleryImagesFiles"].map((f) => f.path)
//       : [],
//   };
//   const result = await productServices.createProductOnDB(productData);
//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.CREATED,
//     message: "Product created successfully!",
//     data: result,
//   });
// });
const createProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const files = req.files || {};
    // Parse data field if sent as JSON string
    let parsedData = req.body;
    if (req.body.data) {
        try {
            parsedData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
        }
        catch (error) {
            parsedData = req.body;
        }
    }
    // Images already uploaded to Cloudinary via multer
    let featuredImg = parsedData.featuredImg || "";
    if ((_b = (_a = files["featuredImgFile"]) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.path) {
        featuredImg = files["featuredImgFile"][0].path;
    }
    let gallery = parsedData.gallery || [];
    if ((_c = files["galleryImagesFiles"]) === null || _c === void 0 ? void 0 : _c.length) {
        gallery = files["galleryImagesFiles"].map(f => f.path);
    }
    let previewImg = parsedData.previewImg || [];
    if ((_d = files["previewImgFile"]) === null || _d === void 0 ? void 0 : _d.length) {
        previewImg = files["previewImgFile"].map(f => f.path);
    }
    let pdfUrl = parsedData.previewPdf || undefined;
    if (pdfUrl && pdfUrl.includes('/view')) {
        pdfUrl = pdfUrl.replace('/view?usp=sharing', '/preview').replace('/view', '/preview');
    }
    // Clean up empty date fields
    if (((_e = parsedData.productInfo) === null || _e === void 0 ? void 0 : _e.publicationDate) === '' || ((_f = parsedData.productInfo) === null || _f === void 0 ? void 0 : _f.publicationDate) === ' ') {
        delete parsedData.productInfo.publicationDate;
    }
    const productData = Object.assign(Object.assign({}, parsedData), { featuredImg,
        gallery,
        previewImg, previewPdf: pdfUrl });
    const result = yield product_service_1.productServices.createProductOnDB(productData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: "Product created successfully!",
        data: result,
    });
}));
// const updateProduct = catchAsync(async (req, res) => {
//   const { id } = req.params;
//   const files = req.files as {
//     [fieldname: string]: Express.Multer.File[];
//   };
//   const updatedData: any = {
//     ...req.body,
//   };
//   if (files["featuredImgFile"]?.[0]?.path) {
//     updatedData.featuredImg = files["featuredImgFile"][0].path;
//   }
//   if (files["galleryImagesFiles"]?.length) {
//     updatedData.gallery = files["galleryImagesFiles"].map((f) => f.path);
//   }
//   if (files["previewImgFile"]?.length) {
//     updatedData.previewImg = files["previewImgFile"].map((f) => f.path);
//   }
//   const result = await productServices.updateProductOnDB(id, updatedData);
//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: "Product updated successfully!",
//     data: result,
//   });
// });
// Product delete controller
const updateProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const { id } = req.params;
    const files = req.files || {};
    // Parse data field if sent as JSON string (same as create)
    let parsedData = req.body;
    if (req.body.data) {
        try {
            parsedData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
        }
        catch (error) {
            parsedData = req.body;
        }
    }
    // Handle featured image
    let featuredImg = parsedData.featuredImg;
    if ((_b = (_a = files["featuredImgFile"]) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.path) {
        featuredImg = files["featuredImgFile"][0].path;
    }
    // Handle gallery images
    let gallery = parsedData.gallery || [];
    if ((_c = files["galleryImagesFiles"]) === null || _c === void 0 ? void 0 : _c.length) {
        const newGalleryImages = files["galleryImagesFiles"].map(f => f.path);
        gallery = Array.isArray(gallery) ? [...gallery, ...newGalleryImages] : newGalleryImages;
    }
    // Handle preview images
    let previewImg = parsedData.previewImg || [];
    if ((_d = files["previewImgFile"]) === null || _d === void 0 ? void 0 : _d.length) {
        const newPreviewImages = files["previewImgFile"].map(f => f.path);
        previewImg = Array.isArray(previewImg) ? [...previewImg, ...newPreviewImages] : newPreviewImages;
    }
    // Handle PDF URL
    let pdfUrl = parsedData.previewPdf;
    if (pdfUrl && pdfUrl.includes('/view')) {
        pdfUrl = pdfUrl.replace('/view?usp=sharing', '/preview').replace('/view', '/preview');
    }
    // Clean up empty date fields
    if (((_e = parsedData.productInfo) === null || _e === void 0 ? void 0 : _e.publicationDate) === '' || ((_f = parsedData.productInfo) === null || _f === void 0 ? void 0 : _f.publicationDate) === ' ') {
        delete parsedData.productInfo.publicationDate;
    }
    const updatedData = Object.assign(Object.assign({}, parsedData), { featuredImg,
        gallery,
        previewImg, previewPdf: pdfUrl });
    const result = yield product_service_1.productServices.updateProductOnDB(id, updatedData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Product updated successfully!",
        data: result,
    });
}));
const deleteSingleProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield product_service_1.productServices.deleteSingleProductOnDB(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Product deleted successfully!",
        data: result,
    });
}));
const searchProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { q } = req.query;
    const result = yield product_service_1.productServices.searchProductsFromDB(q);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: result.length
            ? "Products retrieved successfully!"
            : "No products found!",
        data: result,
    });
}));
const getProductsByAuthor = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { authorId } = req.params;
    const result = yield product_service_1.productServices.getProductsByAuthorFromDB(authorId, req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Products by author retrieved successfully!",
        data: result.data,
        meta: result.meta,
    });
}));
const getPopularProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield product_service_1.productServices.getPopularProductsFromDB(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Popular products retrieved successfully!",
        data: result.data,
        meta: result.meta,
    });
}));
exports.productControllers = {
    createProduct,
    getSingleProduct,
    deleteSingleProduct,
    searchProducts,
    getAllProduct,
    updateProduct,
    getProductsByCategoryandTag,
    getProductsByAuthor,
    getPopularProducts,
};
