import { Types } from "mongoose";

export type TCategoriesAndTags = {
  categories: Types.ObjectId[];
  tags: Types.ObjectId[];
  subCategories?: string[];
};

export type TDescription = {
  name: string;
  slug: string;
  description: string;
  status: "publish" | "draft";
  name_bn?: string;
  description_bn?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
};

export type TExternal = {
  productUrl: string;
  buttonLabel: string;
};

export type TProductInfo = {
  productTitle: string;
  price: number;
  brand?: Types.ObjectId;
  salePrice?: number;
  quantity: number;
  sku: string;
  weight?: string;
  dimensions?: {
    width?: string;
    height?: string;
    length?: string;
  };
  isDigital?: boolean;
  digital?: string;
  isExternal?: boolean;
  external?: TExternal;
  discount?: number;
  totalDiscount?: number;
  status: "draft" | "publish" | "low-quantity" | "out-of-stock";
  publicationDate?: Date;
  isOnSale?: boolean;
  campaign?: string;
  inStock?: boolean;
};

// SIMPLIFIED: Flexible Specifications
export type TProductSpecification = {
  [key: string]: string; // Any key-value pair: color: "red", size: "L", material: "cotton"
};

// SIMPLIFIED: Product Variants
export type TProductVariant = {
  _id?: Types.ObjectId;
  sku: string;
  price: number;
  salePrice?: number;
  quantity: number;
  specifications: TProductSpecification;
  images?: string[];
  isActive: boolean;
};

// MAIN: Product Type
export type TProduct = {
  featuredImg: string;
  previewImg?: string[];
  gallery?: string[];
  video?: string;
  categoryAndTags: TCategoriesAndTags;
  description: TDescription;
  productType: "simple" | "variable";
  productInfo: TProductInfo;
  
  // FLEXIBLE: Optional specifications
  hasVariants: boolean;
  variants?: TProductVariant[];
  specifications?: TProductSpecification; // For simple products
  
  // Analytics
  averageRating?: number;
  ratingCount?: number;
  reviewCount?: number;
  wishlistCount?: number;
  soldCount?: number;
};
