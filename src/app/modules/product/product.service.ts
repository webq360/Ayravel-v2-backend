import QueryBuilder from "../../builder/QueryBuilder";
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";
import AppError from "../../errors/handleAppError";
import { CategoryModel } from "../category/category.model";
import { ProductSearchableFields } from "./product.const";
import { TProduct, TProductVariant } from "./product.interface";
import { ProductModel } from "./product.model";

const createProductOnDB = async (payload: TProduct) => {
  // Generate variants if it's a variable product
  if (payload.productType === "variable" && payload.hasVariants && payload.variants) {
    // Auto-generate SKUs for variants if not provided
    payload.variants = payload.variants.map((variant, index) => ({
      ...variant,
      sku: variant.sku || `${payload.productInfo.sku}-V${index + 1}`
    }));
  }
  
  const result = await ProductModel.create(payload);
  return result;
};

const getAllProductFromDB = async (query: Record<string, unknown>) => {
  const productQuery = new QueryBuilder(
    ProductModel.find()
      .populate("categoryAndTags.categories")
      .populate("categoryAndTags.tags")
      .populate("productInfo.brand"),
    query
  )
    .search(ProductSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await productQuery.modelQuery;
  const meta = await productQuery.countTotal();

  return {
    meta,
    data,
  };
};

const getProductsByCategoryandTag = async (category: string, tag: string) => {
  const categories = category ? category.split(",") : [];
  const tags = tag ? tag.split(",") : [];

  return ProductModel.aggregate([
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
      $match: {
        "description.status": "publish",
        ...(categories.length
          ? { "categoryAndTags.categories.name": { $in: categories } }
          : {}),
        ...(tags.length ? { "categoryAndTags.tags.name": { $in: tags } } : {}),
      },
    },
    {
      $project: {
        categoryDetails: 0,
        tagDetails: 0,
      },
    },
  ]);
};

const getSingleProductFromDB = async (id: string) => {
  return ProductModel.findById(id)
    .populate("categoryAndTags.categories")
    .populate("categoryAndTags.tags")
    .populate("productInfo.brand");
};

const updateProductOnDB = async (
  id: string,
  updatedData: Partial<TProduct>
) => {
  const isProductExist = await ProductModel.findById(id);
  if (!isProductExist) {
    throw new AppError(404, "Product not found!");
  }

  // Merge categories (append new, keep existing)
  if (updatedData.categoryAndTags?.categories) {
    const existingCategories = isProductExist.categoryAndTags?.categories || [];
    const newCategories = updatedData.categoryAndTags.categories;
    updatedData.categoryAndTags.categories = [
      ...new Set([...existingCategories.map(String), ...newCategories.map(String)])
    ] as any;
  }

  // Merge tags (append new, keep existing)
  if (updatedData.categoryAndTags?.tags) {
    const existingTags = isProductExist.categoryAndTags?.tags || [];
    const newTags = updatedData.categoryAndTags.tags;
    updatedData.categoryAndTags.tags = [
      ...new Set([...existingTags.map(String), ...newTags.map(String)])
    ] as any;
  }

  // Merge keywords (append new, keep existing)
  if (updatedData.description?.keywords) {
    const existingKeywords = isProductExist.description?.keywords || [];
    const newKeywords = updatedData.description.keywords;
    updatedData.description.keywords = [...new Set([...existingKeywords, ...newKeywords])];
  }

  // Handle gallery cleanup with deletedImages
  if ((updatedData as any).deletedImages?.length > 0) {
    if (isProductExist.gallery?.length) {
      const restDBImages = isProductExist.gallery.filter(
        (img) => !(updatedData as any).deletedImages?.includes(img)
      );

      const updatedGalleryImages = (updatedData.gallery || [])
        .filter((img) => !(updatedData as any).deletedImages?.includes(img))
        .filter((img) => !restDBImages.includes(img));

      updatedData.gallery = [...restDBImages, ...updatedGalleryImages];
    }

    // Delete images from cloudinary
    await Promise.all(
      (updatedData as any).deletedImages.map((img: string) =>
        deleteImageFromCLoudinary(img)
      )
    );
  }

  const updatedProduct = await ProductModel.findByIdAndUpdate(
    id,
    { $set: updatedData },
    { new: true, runValidators: true }
  )
    .populate("categoryAndTags.categories")
    .populate("categoryAndTags.tags")
    .populate("productInfo.brand");

  // Delete old featured image if replaced
  if (updatedData.featuredImg && isProductExist.featuredImg && updatedData.featuredImg !== isProductExist.featuredImg) {
    await deleteImageFromCLoudinary(isProductExist.featuredImg);
  }

  return updatedProduct;
};

const deleteSingleProductOnDB = async (id: string) => {
  const product = await ProductModel.findByIdAndDelete(id);
  if (!product) {
    throw new AppError(404, "Product not found!");
  }
};

// search products
const searchProductsFromDB = async (query: string) => {
  if (!query) return [];

  // Exact match query
  const exactMatch = await ProductModel.find({
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

  if (exactMatch.length > 0) return exactMatch;

  // Partial match (case-insensitive)
  const partialMatch = await ProductModel.find({
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
};

const getPopularProductsFromDB = async (query: Record<string, unknown>) => {
  const productQuery = new QueryBuilder(
    ProductModel.find({ "description.status": "publish" })
      .populate("categoryAndTags.categories")
      .populate("categoryAndTags.tags")
      .populate("productInfo.brand")
      .sort({ soldCount: -1 }),
    query
  )
    .filter()
    .paginate()
    .fields();

  const data = await productQuery.modelQuery;
  const meta = await productQuery.countTotal();

  return { meta, data };
};

// NEW: Generate product variants from specifications
const generateProductVariantsFromDB = async (productId: string, specifications: Record<string, string[]>) => {
  const product = await ProductModel.findById(productId);
  if (!product) throw new AppError(404, "Product not found");

  // Generate all possible combinations
  const variants = generateVariantCombinations(specifications, product.productInfo);
  
  product.variants = variants;
  product.hasVariants = true;
  product.productType = "variable";
  
  await product.save();
  return product;
};

// Helper function to generate variant combinations
const generateVariantCombinations = (specifications: Record<string, string[]>, baseProductInfo: any): TProductVariant[] => {
  const specKeys = Object.keys(specifications);
  const specValues = Object.values(specifications);
  
  if (specKeys.length === 0) return [];
  
  const combinations: TProductVariant[] = [];
  
  function generateCombos(index: number, currentCombo: Record<string, string>) {
    if (index === specKeys.length) {
      combinations.push({
        sku: `${baseProductInfo.sku}-${Object.values(currentCombo).join('-')}`,
        price: baseProductInfo.price,
        salePrice: baseProductInfo.salePrice,
        quantity: 0,
        specifications: { ...currentCombo },
        images: [],
        isActive: true
      });
      return;
    }
    
    const currentKey = specKeys[index];
    const currentValues = specValues[index];
    
    for (const value of currentValues) {
      generateCombos(index + 1, { ...currentCombo, [currentKey]: value });
    }
  }
  
  generateCombos(0, {});
  return combinations;
};

export const productServices = {
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
