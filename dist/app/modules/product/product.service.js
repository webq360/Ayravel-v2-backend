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
const product_const_1 = require("./product.const");
const product_model_1 = require("./product.model");
const createProductOnDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Generate variants if it's a variable product
    if (payload.productType === "variable" && payload.hasVariants && payload.variants) {
        // Auto-generate SKUs for variants if not provided
        payload.variants = payload.variants.map((variant, index) => (Object.assign(Object.assign({}, variant), { sku: variant.sku || `${payload.productInfo.sku}-V${index + 1}` })));
    }
    const result = yield product_model_1.ProductModel.create(payload);
    return result;
});
const getAllProductFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const productQuery = new QueryBuilder_1.default(product_model_1.ProductModel.find()
        .populate("categoryAndTags.categories")
        .populate("categoryAndTags.tags")
        .populate("productInfo.brand"), query)
        .search(product_const_1.ProductSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const data = yield productQuery.modelQuery;
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
            $addFields: {
                categoryAndTags: {
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
            },
        },
    ]);
});
const getSingleProductFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return product_model_1.ProductModel.findById(id)
        .populate("categoryAndTags.categories")
        .populate("categoryAndTags.tags")
        .populate("productInfo.brand");
});
const updateProductOnDB = (id, updatedData) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const isProductExist = yield product_model_1.ProductModel.findById(id);
    if (!isProductExist) {
        throw new handleAppError_1.default(404, "Product not found!");
    }
    // Merge categories (append new, keep existing)
    if ((_a = updatedData.categoryAndTags) === null || _a === void 0 ? void 0 : _a.categories) {
        const existingCategories = ((_b = isProductExist.categoryAndTags) === null || _b === void 0 ? void 0 : _b.categories) || [];
        const newCategories = updatedData.categoryAndTags.categories;
        updatedData.categoryAndTags.categories = [
            ...new Set([...existingCategories.map(String), ...newCategories.map(String)])
        ];
    }
    // Merge tags (append new, keep existing)
    if ((_c = updatedData.categoryAndTags) === null || _c === void 0 ? void 0 : _c.tags) {
        const existingTags = ((_d = isProductExist.categoryAndTags) === null || _d === void 0 ? void 0 : _d.tags) || [];
        const newTags = updatedData.categoryAndTags.tags;
        updatedData.categoryAndTags.tags = [
            ...new Set([...existingTags.map(String), ...newTags.map(String)])
        ];
    }
    // Merge keywords (append new, keep existing)
    if ((_e = updatedData.description) === null || _e === void 0 ? void 0 : _e.keywords) {
        const existingKeywords = ((_f = isProductExist.description) === null || _f === void 0 ? void 0 : _f.keywords) || [];
        const newKeywords = updatedData.description.keywords;
        updatedData.description.keywords = [...new Set([...existingKeywords, ...newKeywords])];
    }
    // Handle gallery cleanup with deletedImages
    if (((_g = updatedData.deletedImages) === null || _g === void 0 ? void 0 : _g.length) > 0) {
        if ((_h = isProductExist.gallery) === null || _h === void 0 ? void 0 : _h.length) {
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
        .populate("categoryAndTags.categories")
        .populate("categoryAndTags.tags")
        .populate("productInfo.brand");
    // Delete old featured image if replaced
    if (updatedData.featuredImg && isProductExist.featuredImg && updatedData.featuredImg !== isProductExist.featuredImg) {
        yield (0, cloudinary_config_1.deleteImageFromCLoudinary)(isProductExist.featuredImg);
    }
    return updatedProduct;
});
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
        ],
    })
        .limit(10)
        .populate("categoryAndTags.categories")
        .populate("categoryAndTags.tags")
        .populate("productInfo.brand");
    if (exactMatch.length > 0)
        return exactMatch;
    // Partial match (case-insensitive)
    const partialMatch = yield product_model_1.ProductModel.find({
        $or: [
            { "description.name": { $regex: query, $options: "i" } },
            { "description.slug": { $regex: query, $options: "i" } },
            { "description.description": { $regex: query, $options: "i" } },
            { "productInfo.productTitle": { $regex: query, $options: "i" } },
        ],
    })
        .limit(10)
        .populate("categoryAndTags.categories")
        .populate("categoryAndTags.tags")
        .populate("productInfo.brand");
    return partialMatch;
});
const getPopularProductsFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const productQuery = new QueryBuilder_1.default(product_model_1.ProductModel.find({ "description.status": "publish" })
        .populate("categoryAndTags.categories")
        .populate("categoryAndTags.tags")
        .populate("productInfo.brand")
        .sort({ soldCount: -1 }), query)
        .filter()
        .paginate()
        .fields();
    const data = yield productQuery.modelQuery;
    const meta = yield productQuery.countTotal();
    return { meta, data };
});
// NEW: Generate product variants from specifications
const generateProductVariantsFromDB = (productId, specifications) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield product_model_1.ProductModel.findById(productId);
    if (!product)
        throw new handleAppError_1.default(404, "Product not found");
    // Generate all possible combinations
    const variants = generateVariantCombinations(specifications, product.productInfo);
    product.variants = variants;
    product.hasVariants = true;
    product.productType = "variable";
    yield product.save();
    return product;
});
// Helper function to generate variant combinations
const generateVariantCombinations = (specifications, baseProductInfo) => {
    const specKeys = Object.keys(specifications);
    const specValues = Object.values(specifications);
    if (specKeys.length === 0)
        return [];
    const combinations = [];
    function generateCombos(index, currentCombo) {
        if (index === specKeys.length) {
            combinations.push({
                sku: `${baseProductInfo.sku}-${Object.values(currentCombo).join('-')}`,
                price: baseProductInfo.price,
                salePrice: baseProductInfo.salePrice,
                quantity: 0,
                specifications: Object.assign({}, currentCombo),
                images: [],
                isActive: true
            });
            return;
        }
        const currentKey = specKeys[index];
        const currentValues = specValues[index];
        for (const value of currentValues) {
            generateCombos(index + 1, Object.assign(Object.assign({}, currentCombo), { [currentKey]: value }));
        }
    }
    generateCombos(0, {});
    return combinations;
};
exports.productServices = {
    createProductOnDB,
    getAllProductFromDB,
    deleteSingleProductOnDB,
    searchProductsFromDB,
    getProductsByCategoryandTag,
    getSingleProductFromDB,
    updateProductOnDB,
    getPopularProductsFromDB,
    generateProductVariantsFromDB,
};
