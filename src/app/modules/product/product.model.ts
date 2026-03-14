import { model, Schema } from "mongoose";
import {
  TCategoriesAndTags,
  TDescription,
  TExternal,
  TProduct,
  TProductInfo,
  TProductSpecification,
  TProductVariant,
} from "./product.interface";

// Helper function for discount calculation
const calculateDiscount = (price: number, salePrice?: number) => {
  if (!salePrice || salePrice <= 0) return 0;
  return Math.round(((price - salePrice) / price) * 100);
};

// Product Specification Schema (Dynamic)
const productSpecificationSchema = new Schema<TProductSpecification>({}, { 
  strict: false, // Allow dynamic fields
  _id: false 
});

// Product Variant Schema
const productVariantSchema = new Schema<TProductVariant>({
  sku: { type: String, required: true },
  price: { type: Number, required: true },
  salePrice: Number,
  quantity: { type: Number, required: true },
  specifications: { type: productSpecificationSchema, required: true },
  images: [String],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Category & Tags Schema
const categoryAndTagsSchema = new Schema<TCategoriesAndTags>(
  {
    categories: [
      { type: Schema.Types.ObjectId, ref: "category", required: true },
    ],
    tags: [{ type: Schema.Types.ObjectId, ref: "tag", required: true }],
    subCategories: [String],
  },
  { _id: false }
);

// Description Schema
const descriptionSchema = new Schema<TDescription>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["publish", "draft"], default: "draft" },
    name_bn: String,
    description_bn: String,
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
  },
  { _id: false }
);

// External Schema
const externalSchema = new Schema<TExternal>(
  {
    productUrl: String,
    buttonLabel: String,
  },
  { _id: false }
);

// Product Info Schema
const productInfoSchema = new Schema<TProductInfo>(
  {
    productTitle: { type: String, required: true },
    price: { type: Number, required: true },
    brand: { type: Schema.Types.ObjectId, ref: "brand" },
    salePrice: Number,
    quantity: { type: Number, required: true },
    sku: { type: String, required: true, unique: true },
    weight: String,
    dimensions: {
      width: String,
      height: String,
      length: String,
    },
    isDigital: Boolean,
    digital: String,
    isExternal: Boolean,
    external: externalSchema,
    discount: { type: Number, default: 0 },
    totalDiscount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["draft", "publish", "low-quantity", "out-of-stock"],
      default: "publish",
    },
    publicationDate: Date,
    isOnSale: { type: Boolean, default: false },
    campaign: String,
    inStock: { type: Boolean, default: true },
  },
  { _id: false }
);

// Product Schema
const productSchema = new Schema<TProduct>(
  {
    featuredImg: { type: String, required: true },
    previewImg: [String],
    gallery: [String],
    video: String,
    categoryAndTags: { type: categoryAndTagsSchema, required: true },
    description: { type: descriptionSchema, required: true },
    productType: { type: String, enum: ["simple", "variable"], required: true },
    productInfo: { type: productInfoSchema, required: true },
    
    // NEW: Specification system
    hasVariants: { type: Boolean, default: false },
    variants: [productVariantSchema],
    specifications: productSpecificationSchema,
    
    // Analytics
    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Pre-save middleware
productSchema.pre("save", function (next) {
  if (this.productInfo) {
    this.productInfo.totalDiscount = calculateDiscount(
      this.productInfo.price,
      this.productInfo.salePrice
    );
  }

  // Generate variant SKUs if not provided
  if (this.hasVariants && this.variants) {
    this.variants.forEach((variant, index) => {
      if (!variant.sku) {
        variant.sku = `${this.productInfo.sku}-V${index + 1}`;
      }
    });
  }

  next();
});

// Pre-findOneAndUpdate middleware
productSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as any;

  if (update?.productInfo?.price !== undefined) {
    const price = update.productInfo.price;
    const salePrice = update.productInfo.salePrice ?? 0;

    update.productInfo.totalDiscount = calculateDiscount(price, salePrice);
  }

  this.setUpdate(update);
  next();
});

export const ProductModel = model<TProduct>("Product", productSchema);
