import { Types } from "mongoose";

export type TSpecificationOption = {
  value: string;
  label: string;
  colorCode?: string; // For color specifications
  image?: string; // For pattern/texture specifications
};

export type TSpecificationField = {
  name: string; // "color", "size", "material"
  label: string; // "Color", "Size", "Material"
  type: "select" | "color" | "text" | "number";
  required: boolean;
  options: TSpecificationOption[];
};

export type TSpecificationTemplate = {
  _id?: Types.ObjectId;
  categoryId: Types.ObjectId;
  categoryName: string;
  fields: TSpecificationField[];
  isActive: boolean;
};