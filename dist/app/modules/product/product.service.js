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
exports.productServices = void 0;
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const cloudinary_config_1 = require("../../config/cloudinary.config");
const handleAppError_1 = __importDefault(require("../../errors/handleAppError"));
const category_model_1 = require("../category/category.model");
const product_const_1 = require("./product.const");
const product_model_1 = require("./product.model");
//normalize binding input
const normalizeBinding = (binding) => {
    if (!binding)
        return binding;
    return binding.toLowerCase();
};
// const createProductOnDB = async (payload: TProduct) => {
//   const result = await ProductModel.create(payload);
//   return result;
// };
// 🔹 Create product
// const createProductOnDB = async (payload: TProduct) => {
//   // Ensure salePrice is defined if isOnSale is true
//   if (payload.bookInfo?.specification?.binding) {
//     payload.bookInfo.specification.binding = normalizeBinding(
//       payload.bookInfo.specification.binding
//     ) as "hardcover" | "paperback";
//   }
//   const result = await ProductModel.create(payload);
//   return result;
// };
const createProductOnDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // Check if any category is a book category
    const categoryIds = payload.categoryAndTags.categories;
    const categories = yield category_model_1.CategoryModel.find({ _id: { $in: categoryIds } });
    const isBook = categories.some(cat => { var _a; return ((_a = cat.mainCategory) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'book'; });
    // Only keep bookInfo for book products
    if (isBook) {
        if ((_b = (_a = payload.bookInfo) === null || _a === void 0 ? void 0 : _a.specification) === null || _b === void 0 ? void 0 : _b.binding) {
            payload.bookInfo.specification.binding = normalizeBinding(payload.bookInfo.specification.binding);
        }
    }
    else {
        // Remove bookInfo for non-book products
        delete payload.bookInfo;
    }
    const result = yield product_model_1.ProductModel.create(payload);
    return result;
});
const getAllProductFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const productQuery = new QueryBuilder_1.default(product_model_1.ProductModel.find()
        .populate("categoryAndTags.publisher")
        .populate("categoryAndTags.categories")
        .populate("categoryAndTags.tags")
        .populate("bookInfo.specification.authors"), query)
        .search(product_const_1.ProductSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    // ✅ Execute main query for product data
    const data = yield productQuery.modelQuery;
    // ✅ Use built-in countTotal() from QueryBuilder
    const meta = yield productQuery.countTotal();
    return {
        meta,
        data,
    };
});
const getProductsByCategoryandTag = (category, tag) => __awaiter(void 0, void 0, void 0, function* () {
    const categories = category ? category.split(",") : [];
    const tags = tag ? tag.split(",") : [];
    return product_model_1.ProductModel.aggregate([
        {
            $lookup: {
                from: "categories",
                localField: "categoryAndTags.categories",
                foreignField: "_id",
                as: "categoryDetails",
            },
        },
        {
            $lookup: {
                from: "tags",
                localField: "categoryAndTags.tags",
                foreignField: "_id",
                as: "tagDetails",
            },
        },
        {
            $lookup: {
                from: "publishers",
                localField: "categoryAndTags.publisher",
                foreignField: "_id",
                as: "publisherDetails",
            },
        },
        {
            $lookup: {
                from: "authors",
                localField: "bookInfo.specification.authors",
                foreignField: "_id",
                as: "authorsDetails",
            },
        },
        {
            $addFields: {
                categoryAndTags: {
                    publisher: { $arrayElemAt: ["$publisherDetails", 0] },
                    categories: "$categoryDetails",
                    tags: "$tagDetails",
                },
            },
        },
        {
            $match: Object.assign(Object.assign({ "description.status": "publish" }, (categories.length
                ? { "categoryAndTags.categories.name": { $in: categories } }
                : {})), (tags.length ? { "categoryAndTags.tags.name": { $in: tags } } : {})),
        },
        {
            $project: {
                categoryDetails: 0,
                tagDetails: 0,
                publisherDetails: 0,
            },
        },
    ]);
});
const getSingleProductFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return product_model_1.ProductModel.findById(id)
        .populate("categoryAndTags.publisher")
        .populate("categoryAndTags.categories")
        .populate("categoryAndTags.tags")
        .populate("bookInfo.specification.authors");
});
const updateProductOnDB = (id, updatedData) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    const isProductExist = yield product_model_1.ProductModel.findById(id);
    if (!isProductExist) {
        throw new handleAppError_1.default(404, "Product not found!");
    }
    // Normalize binding
    if ((_b = (_a = updatedData.bookInfo) === null || _a === void 0 ? void 0 : _a.specification) === null || _b === void 0 ? void 0 : _b.binding) {
        updatedData.bookInfo.specification.binding = normalizeBinding(updatedData.bookInfo.specification.binding);
    }
    // Merge categories (append new, keep existing)
    if ((_c = updatedData.categoryAndTags) === null || _c === void 0 ? void 0 : _c.categories) {
        const existingCategories = ((_d = isProductExist.categoryAndTags) === null || _d === void 0 ? void 0 : _d.categories) || [];
        const newCategories = updatedData.categoryAndTags.categories;
        updatedData.categoryAndTags.categories = [
            ...new Set([...existingCategories.map(String), ...newCategories.map(String)])
        ];
    }
    // Merge tags (append new, keep existing)
    if ((_e = updatedData.categoryAndTags) === null || _e === void 0 ? void 0 : _e.tags) {
        const existingTags = ((_f = isProductExist.categoryAndTags) === null || _f === void 0 ? void 0 : _f.tags) || [];
        const newTags = updatedData.categoryAndTags.tags;
        updatedData.categoryAndTags.tags = [
            ...new Set([...existingTags.map(String), ...newTags.map(String)])
        ];
    }
    // Merge authors (append new, keep existing)
    if ((_h = (_g = updatedData.bookInfo) === null || _g === void 0 ? void 0 : _g.specification) === null || _h === void 0 ? void 0 : _h.authors) {
        const existingAuthors = ((_k = (_j = isProductExist.bookInfo) === null || _j === void 0 ? void 0 : _j.specification) === null || _k === void 0 ? void 0 : _k.authors) || [];
        const newAuthors = updatedData.bookInfo.specification.authors;
        updatedData.bookInfo.specification.authors = [
            ...new Set([...existingAuthors.map(String), ...newAuthors.map(String)])
        ];
    }
    // Merge genre (append new, keep existing)
    if ((_l = updatedData.bookInfo) === null || _l === void 0 ? void 0 : _l.genre) {
        const existingGenre = ((_m = isProductExist.bookInfo) === null || _m === void 0 ? void 0 : _m.genre) || [];
        const newGenre = updatedData.bookInfo.genre;
        updatedData.bookInfo.genre = [...new Set([...existingGenre, ...newGenre])];
    }
    // Merge keywords (append new, keep existing)
    if ((_o = updatedData.description) === null || _o === void 0 ? void 0 : _o.keywords) {
        const existingKeywords = ((_p = isProductExist.description) === null || _p === void 0 ? void 0 : _p.keywords) || [];
        const newKeywords = updatedData.description.keywords;
        updatedData.description.keywords = [...new Set([...existingKeywords, ...newKeywords])];
    }
    // Handle gallery cleanup with deletedImages
    if (((_q = updatedData.deletedImages) === null || _q === void 0 ? void 0 : _q.length) > 0) {
        if ((_r = isProductExist.gallery) === null || _r === void 0 ? void 0 : _r.length) {
            const restDBImages = isProductExist.gallery.filter((img) => { var _a; return !((_a = updatedData.deletedImages) === null || _a === void 0 ? void 0 : _a.includes(img)); });
            const updatedGalleryImages = (updatedData.gallery || [])
                .filter((img) => { var _a; return !((_a = updatedData.deletedImages) === null || _a === void 0 ? void 0 : _a.includes(img)); })
                .filter((img) => !restDBImages.includes(img));
            updatedData.gallery = [...restDBImages, ...updatedGalleryImages];
        }
        // Delete images from cloudinary
        yield Promise.all(updatedData.deletedImages.map((img) => (0, cloudinary_config_1.deleteImageFromCLoudinary)(img)));
    }
    const updatedProduct = yield product_model_1.ProductModel.findByIdAndUpdate(id, { $set: updatedData }, { new: true, runValidators: true })
        .populate("categoryAndTags.publisher")
        .populate("categoryAndTags.categories")
        .populate("categoryAndTags.tags")
        .populate("bookInfo.specification.authors");
    // Delete old featured image if replaced
    if (updatedData.featuredImg && isProductExist.featuredImg && updatedData.featuredImg !== isProductExist.featuredImg) {
        yield (0, cloudinary_config_1.deleteImageFromCLoudinary)(isProductExist.featuredImg);
    }
    return updatedProduct;
});
// delete product from database
const deleteSingleProductOnDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield product_model_1.ProductModel.findByIdAndDelete(id);
    if (!product) {
        throw new handleAppError_1.default(404, "Product not found!");
    }
});
// search products
const searchProductsFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    if (!query)
        return [];
    // Exact match query
    const exactMatch = yield product_model_1.ProductModel.find({
        $or: [
            { "description.name": query },
            { "description.slug": query },
            { "productInfo.sku": query },
            { "bookInfo.specification.isbn": query },
        ],
    })
        .limit(10)
        .populate("categoryAndTags.categories")
        .populate("categoryAndTags.tags")
        .populate("categoryAndTags.publisher");
    if (exactMatch.length > 0)
        return exactMatch;
    // Partial match (case-insensitive)
    const partialMatch = yield product_model_1.ProductModel.find({
        $or: [
            { "description.name": { $regex: query, $options: "i" } },
            { "description.slug": { $regex: query, $options: "i" } },
            { "description.description": { $regex: query, $options: "i" } },
            {
                "bookInfo.specification.authors.name": { $regex: query, $options: "i" },
            },
            { "bookInfo.specification.publisher": { $regex: query, $options: "i" } },
            { "bookInfo.specification.language": { $regex: query, $options: "i" } },
            { "bookInfo.genre": { $regex: query, $options: "i" } },
        ],
    })
        .limit(10)
        .populate("categoryAndTags.categories")
        .populate("categoryAndTags.tags")
        .populate("categoryAndTags.publisher");
    return partialMatch;
});
const getProductsByAuthorFromDB = (authorId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const productQuery = new QueryBuilder_1.default(product_model_1.ProductModel.find({
        "bookInfo.specification.authors": authorId,
    })
        .populate("categoryAndTags.categories")
        .populate("categoryAndTags.tags")
        .populate("bookInfo.specification.authors"), query)
        .filter()
        .sort()
        .paginate()
        .fields();
    const data = yield productQuery.modelQuery;
    const meta = yield productQuery.countTotal();
    return { meta, data };
});
const getPopularProductsFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const productQuery = new QueryBuilder_1.default(product_model_1.ProductModel.find({ "description.status": "publish" })
        .populate("categoryAndTags.publisher")
        .populate("categoryAndTags.categories")
        .populate("categoryAndTags.tags")
        .populate("bookInfo.specification.authors")
        .sort({ "productInfo.sold": -1 }), query)
        .filter()
        .paginate()
        .fields();
    const data = yield productQuery.modelQuery;
    const meta = yield productQuery.countTotal();
    return { meta, data };
});
exports.productServices = {
    createProductOnDB,
    getAllProductFromDB,
    deleteSingleProductOnDB,
    searchProductsFromDB,
    getProductsByCategoryandTag,
    getSingleProductFromDB,
    updateProductOnDB,
    getProductsByAuthorFromDB,
    getPopularProductsFromDB,
};
