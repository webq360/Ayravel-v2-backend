import QueryBuilder from "../../builder/QueryBuilder";
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";
import AppError from "../../errors/handleAppError";
import { CategoryModel } from "../category/category.model";
import { ProductSearchableFields } from "./product.const";
import { TProduct } from "./product.interface";
import { ProductModel } from "./product.model";

//normalize binding input
const normalizeBinding = (binding?: string) => {
  if (!binding) return binding;
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

const createProductOnDB = async (payload: TProduct) => {
  // Check if any category is a book category
  const categoryIds = payload.categoryAndTags.categories;
  const categories = await CategoryModel.find({ _id: { $in: categoryIds } });
  const isBook = categories.some(cat => cat.mainCategory?.toLowerCase() === 'book');

  // Only keep bookInfo for book products
  if (isBook) {
    if (payload.bookInfo?.specification?.binding) {
      payload.bookInfo.specification.binding = normalizeBinding(
        payload.bookInfo.specification.binding
      ) as "hardcover" | "paperback";
    }
  } else {
    // Remove bookInfo for non-book products
    delete (payload as any).bookInfo;
  }

  const result = await ProductModel.create(payload);
  return result;
};

const getAllProductFromDB = async (query: Record<string, unknown>) => {
  const productQuery = new QueryBuilder(
    ProductModel.find()
      .populate("categoryAndTags.publisher")
      .populate("categoryAndTags.categories")
      .populate("categoryAndTags.tags")
      .populate("bookInfo.specification.authors"),
    query
  )
    .search(ProductSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();
  // ✅ Execute main query for product data
  const data = await productQuery.modelQuery;

  // ✅ Use built-in countTotal() from QueryBuilder
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
        publisherDetails: 0,
      },
    },
  ]);
};

const getSingleProductFromDB = async (id: string) => {
  return ProductModel.findById(id)
    .populate("categoryAndTags.publisher")
    .populate("categoryAndTags.categories")
    .populate("categoryAndTags.tags")
    .populate("bookInfo.specification.authors");
};

const updateProductOnDB = async (
  id: string,
  updatedData: Partial<TProduct>
) => {
  const isProductExist = await ProductModel.findById(id);
  if (!isProductExist) {
    throw new AppError(404, "Product not found!");
  }

  // Normalize binding
  if (updatedData.bookInfo?.specification?.binding) {
    updatedData.bookInfo.specification.binding = normalizeBinding(
      updatedData.bookInfo.specification.binding
    ) as "hardcover" | "paperback";
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

  // Merge authors (append new, keep existing)
  if (updatedData.bookInfo?.specification?.authors) {
    const existingAuthors = isProductExist.bookInfo?.specification?.authors || [];
    const newAuthors = updatedData.bookInfo.specification.authors;
    updatedData.bookInfo.specification.authors = [
      ...new Set([...existingAuthors.map(String), ...newAuthors.map(String)])
    ] as any;
  }

  // Merge genre (append new, keep existing)
  if (updatedData.bookInfo?.genre) {
    const existingGenre = isProductExist.bookInfo?.genre || [];
    const newGenre = updatedData.bookInfo.genre;
    updatedData.bookInfo.genre = [...new Set([...existingGenre, ...newGenre])];
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
    .populate("categoryAndTags.publisher")
    .populate("categoryAndTags.categories")
    .populate("categoryAndTags.tags")
    .populate("bookInfo.specification.authors");

  // Delete old featured image if replaced
  if (updatedData.featuredImg && isProductExist.featuredImg && updatedData.featuredImg !== isProductExist.featuredImg) {
    await deleteImageFromCLoudinary(isProductExist.featuredImg);
  }

  return updatedProduct;
};

// delete product from database

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
      { "bookInfo.specification.isbn": query },
    ],
  })
    .limit(10)
    .populate("categoryAndTags.categories")
    .populate("categoryAndTags.tags")
    .populate("categoryAndTags.publisher");

  if (exactMatch.length > 0) return exactMatch;

  // Partial match (case-insensitive)
  const partialMatch = await ProductModel.find({
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
};

const getProductsByAuthorFromDB = async (
  authorId: string,
  query: Record<string, unknown>
) => {
  const productQuery = new QueryBuilder(
    ProductModel.find({
      "bookInfo.specification.authors": authorId,
    })
      .populate("categoryAndTags.categories")
      .populate("categoryAndTags.tags")
      .populate("bookInfo.specification.authors"),
    query
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await productQuery.modelQuery;
  const meta = await productQuery.countTotal();

  return { meta, data };
};

const getPopularProductsFromDB = async (query: Record<string, unknown>) => {
  const productQuery = new QueryBuilder(
    ProductModel.find({ "description.status": "publish" })
      .populate("categoryAndTags.publisher")
      .populate("categoryAndTags.categories")
      .populate("categoryAndTags.tags")
      .populate("bookInfo.specification.authors")
      .sort({ "productInfo.sold": -1 }),
    query
  )
    .filter()
    .paginate()
    .fields();

  const data = await productQuery.modelQuery;
  const meta = await productQuery.countTotal();

  return { meta, data };
};

export const productServices = {
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
