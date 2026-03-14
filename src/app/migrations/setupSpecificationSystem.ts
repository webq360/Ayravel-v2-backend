import { CategoryModel } from "../modules/category/category.model";
import { ProductModel } from "../modules/product/product.model";
import { SpecificationTemplateModel } from "../modules/specificationTemplate/specificationTemplate.model";

export const setupSpecificationSystemMigration = async () => {
  try {
    console.log("🚀 Starting specification system migration...");

    // 1. Update existing products to remove bookInfo and add new fields
    console.log("📦 Updating existing products...");
    await ProductModel.updateMany(
      {},
      {
        $unset: { 
          bookInfo: 1,
          previewPdf: 1,
          "categoryAndTags.publisher": 1
        },
        $set: {
          hasVariants: false,
          variants: [],
          specifications: {}
        }
      }
    );

    // 2. Create default specification templates for each category
    console.log("🏷️ Creating default specification templates...");
    await createDefaultSpecificationTemplates();

    console.log("✅ Migration completed successfully!");
    console.log("📋 Summary:");
    console.log("   - Removed book-related fields from products");
    console.log("   - Added specification system fields");
    console.log("   - Created default specification templates");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
};

const createDefaultSpecificationTemplates = async () => {
  const defaultTemplates = [
    {
      categoryName: "women-fashion",
      fields: [
        {
          name: "color",
          label: "Color",
          type: "color",
          required: true,
          options: [
            { value: "red", label: "Red", colorCode: "#FF0000" },
            { value: "blue", label: "Blue", colorCode: "#0000FF" },
            { value: "black", label: "Black", colorCode: "#000000" },
            { value: "white", label: "White", colorCode: "#FFFFFF" },
            { value: "pink", label: "Pink", colorCode: "#FFC0CB" }
          ]
        },
        {
          name: "size",
          label: "Size",
          type: "select",
          required: true,
          options: [
            { value: "XS", label: "Extra Small" },
            { value: "S", label: "Small" },
            { value: "M", label: "Medium" },
            { value: "L", label: "Large" },
            { value: "XL", label: "Extra Large" },
            { value: "XXL", label: "Double Extra Large" }
          ]
        }
      ]
    },
    {
      categoryName: "men-fashion",
      fields: [
        {
          name: "color",
          label: "Color",
          type: "color",
          required: true,
          options: [
            { value: "black", label: "Black", colorCode: "#000000" },
            { value: "white", label: "White", colorCode: "#FFFFFF" },
            { value: "blue", label: "Blue", colorCode: "#0000FF" },
            { value: "gray", label: "Gray", colorCode: "#808080" },
            { value: "navy", label: "Navy", colorCode: "#000080" }
          ]
        },
        {
          name: "size",
          label: "Size",
          type: "select",
          required: true,
          options: [
            { value: "S", label: "Small" },
            { value: "M", label: "Medium" },
            { value: "L", label: "Large" },
            { value: "XL", label: "Extra Large" },
            { value: "XXL", label: "Double Extra Large" }
          ]
        }
      ]
    },
    {
      categoryName: "cosmetics",
      fields: [
        {
          name: "shade",
          label: "Shade",
          type: "color",
          required: true,
          options: [
            { value: "fair", label: "Fair", colorCode: "#F5DEB3" },
            { value: "medium", label: "Medium", colorCode: "#DEB887" },
            { value: "tan", label: "Tan", colorCode: "#D2B48C" },
            { value: "deep", label: "Deep", colorCode: "#8B4513" }
          ]
        },
        {
          name: "size",
          label: "Size",
          type: "select",
          required: true,
          options: [
            { value: "15ml", label: "15ml" },
            { value: "30ml", label: "30ml" },
            { value: "50ml", label: "50ml" },
            { value: "100ml", label: "100ml" }
          ]
        }
      ]
    },
    {
      categoryName: "shoes",
      fields: [
        {
          name: "color",
          label: "Color",
          type: "color",
          required: true,
          options: [
            { value: "black", label: "Black", colorCode: "#000000" },
            { value: "brown", label: "Brown", colorCode: "#8B4513" },
            { value: "white", label: "White", colorCode: "#FFFFFF" },
            { value: "tan", label: "Tan", colorCode: "#D2B48C" }
          ]
        },
        {
          name: "size",
          label: "Size",
          type: "select",
          required: true,
          options: [
            { value: "6", label: "6" },
            { value: "7", label: "7" },
            { value: "8", label: "8" },
            { value: "9", label: "9" },
            { value: "10", label: "10" },
            { value: "11", label: "11" },
            { value: "12", label: "12" }
          ]
        }
      ]
    },
    {
      categoryName: "electronics-gadgets",
      fields: [
        {
          name: "color",
          label: "Color",
          type: "color",
          required: false,
          options: [
            { value: "black", label: "Black", colorCode: "#000000" },
            { value: "white", label: "White", colorCode: "#FFFFFF" },
            { value: "silver", label: "Silver", colorCode: "#C0C0C0" },
            { value: "gold", label: "Gold", colorCode: "#FFD700" }
          ]
        },
        {
          name: "storage",
          label: "Storage",
          type: "select",
          required: false,
          options: [
            { value: "64GB", label: "64GB" },
            { value: "128GB", label: "128GB" },
            { value: "256GB", label: "256GB" },
            { value: "512GB", label: "512GB" },
            { value: "1TB", label: "1TB" }
          ]
        }
      ]
    }
  ];

  for (const template of defaultTemplates) {
    // Find category by mainCategory name
    const category = await CategoryModel.findOne({ 
      mainCategory: template.categoryName 
    });

    if (category) {
      // Check if template already exists
      const existingTemplate = await SpecificationTemplateModel.findOne({
        categoryId: category._id,
        isActive: true
      });

      if (!existingTemplate) {
        await SpecificationTemplateModel.create({
          categoryId: category._id,
          categoryName: template.categoryName,
          fields: template.fields,
          isActive: true
        });
        console.log(`   ✅ Created template for ${template.categoryName}`);
      } else {
        console.log(`   ⚠️ Template already exists for ${template.categoryName}`);
      }
    } else {
      console.log(`   ❌ Category not found: ${template.categoryName}`);
    }
  }
};

// Run migration if called directly
if (require.main === module) {
  setupSpecificationSystemMigration()
    .then(() => {
      console.log("Migration completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}