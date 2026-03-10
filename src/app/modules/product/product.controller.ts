import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { productServices } from "./product.service";
import { cloudinaryUpload } from "../../config/cloudinary.config";

const getAllProduct = catchAsync(async (req, res) => {
  const result = await productServices.getAllProductFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Products retrieve successfully!",
    data: result.data,
    meta: result.meta,
  });
});

const getProductsByCategoryandTag = catchAsync(async (req, res) => {
  const { category, tag } = req.query;

  const result = await productServices.getProductsByCategoryandTag(
    category as string,
    tag as string
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Products retrieve successfully!",
    data: result,
  });
});

const getSingleProduct = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await productServices.getSingleProductFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Product retrieve successfully!",
    data: result,
  });
});

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

const createProduct = catchAsync(async (req, res) => {
  const files =
    (req.files as { [fieldname: string]: Express.Multer.File[] }) || {};

  // Parse data field if sent as JSON string
  let parsedData = req.body;
  if (req.body.data) {
    try {
      parsedData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
    } catch (error) {
      parsedData = req.body;
    }
  }

  // Images already uploaded to Cloudinary via multer
  let featuredImg = parsedData.featuredImg || "";
  if (files["featuredImgFile"]?.[0]?.path) {
    featuredImg = files["featuredImgFile"][0].path;
  }

  let gallery: string[] = parsedData.gallery || [];
  if (files["galleryImagesFiles"]?.length) {
    gallery = files["galleryImagesFiles"].map(f => f.path);
  }

  let previewImg: string[] = parsedData.previewImg || [];
  if (files["previewImgFile"]?.length) {
    previewImg = files["previewImgFile"].map(f => f.path);
  }

  let pdfUrl = parsedData.previewPdf || undefined;
  if (pdfUrl && pdfUrl.includes('/view')) {
    pdfUrl = pdfUrl.replace('/view?usp=sharing', '/preview').replace('/view', '/preview');
  }

  // Clean up empty date fields
  if (parsedData.productInfo?.publicationDate === '' || parsedData.productInfo?.publicationDate === ' ') {
    delete parsedData.productInfo.publicationDate;
  }

  const productData = {
    ...parsedData,
    featuredImg,
    gallery,
    previewImg,
    previewPdf: pdfUrl,
  };

  const result = await productServices.createProductOnDB(productData);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Product created successfully!",
    data: result,
  });
});

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

const updateProduct = catchAsync(async (req, res) => {
  const { id } = req.params;

  const files =
    (req.files as { [fieldname: string]: Express.Multer.File[] }) || {};

  // Parse data field if sent as JSON string (same as create)
  let parsedData = req.body;
  if (req.body.data) {
    try {
      parsedData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
    } catch (error) {
      parsedData = req.body;
    }
  }

  // Handle featured image
  let featuredImg = parsedData.featuredImg;
  if (files["featuredImgFile"]?.[0]?.path) {
    featuredImg = files["featuredImgFile"][0].path;
  }

  // Handle gallery images
  let gallery = parsedData.gallery || [];
  if (files["galleryImagesFiles"]?.length) {
    const newGalleryImages = files["galleryImagesFiles"].map(f => f.path);
    gallery = Array.isArray(gallery) ? [...gallery, ...newGalleryImages] : newGalleryImages;
  }

  // Handle preview images
  let previewImg = parsedData.previewImg || [];
  if (files["previewImgFile"]?.length) {
    const newPreviewImages = files["previewImgFile"].map(f => f.path);
    previewImg = Array.isArray(previewImg) ? [...previewImg, ...newPreviewImages] : newPreviewImages;
  }

  // Handle PDF URL
  let pdfUrl = parsedData.previewPdf;
  if (pdfUrl && pdfUrl.includes('/view')) {
    pdfUrl = pdfUrl.replace('/view?usp=sharing', '/preview').replace('/view', '/preview');
  }

  // Clean up empty date fields
  if (parsedData.productInfo?.publicationDate === '' || parsedData.productInfo?.publicationDate === ' ') {
    delete parsedData.productInfo.publicationDate;
  }

  const updatedData = {
    ...parsedData,
    featuredImg,
    gallery,
    previewImg,
    previewPdf: pdfUrl,
  };

  const result = await productServices.updateProductOnDB(id, updatedData);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Product updated successfully!",
    data: result,
  });
});

const deleteSingleProduct = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await productServices.deleteSingleProductOnDB(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Product deleted successfully!",
    data: result,
  });
});

const searchProducts = catchAsync(async (req, res) => {
  const { q } = req.query;

  const result = await productServices.searchProductsFromDB(q as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.length
      ? "Products retrieved successfully!"
      : "No products found!",
    data: result,
  });
});

const getProductsByAuthor = catchAsync(async (req, res) => {
  const { authorId } = req.params;
  const result = await productServices.getProductsByAuthorFromDB(authorId, req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Products by author retrieved successfully!",
    data: result.data,
    meta: result.meta,
  });
});

const getPopularProducts = catchAsync(async (req, res) => {
  const result = await productServices.getPopularProductsFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Popular products retrieved successfully!",
    data: result.data,
    meta: result.meta,
  });
});

export const productControllers = {
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
