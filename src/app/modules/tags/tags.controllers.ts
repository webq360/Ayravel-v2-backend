import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { tagServices } from "./tags.services";
import { uploadBufferToCloudinary } from "../../config/cloudinary.config";

const getAllTags = catchAsync(async (req, res) => {
  const result = await tagServices.getAllTagsFromDB();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Tags retrieved successfully!",
    data: result,
  });
});

const getSingleTag = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await tagServices.getSingleTagFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Tag retrieved successfully!",
    data: result,
  });
});

// const createTag = catchAsync(async (req, res) => {
//   const files =
//     (req.files as { [fieldname: string]: Express.Multer.File[] }) || {};

//   const tagData = {
//     ...req.body,
//     image: files["imageFile"]?.[0]?.path || req.body.image || "",
//   };

//   const result = await tagServices.createTagOnDB(tagData);

//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.CREATED,
//     message: "Tag created successfully!",
//     data: result,
//   });
// });

// const updateTag = catchAsync(async (req, res) => {
//   const id = req.params.id;
//   const files =
//     (req.files as { [fieldname: string]: Express.Multer.File[] }) || {};

//   const updatedData: any = { ...req.body };
//   if (files["imageFile"]?.[0]?.path) {
//     updatedData.image = files["imageFile"][0].path;
//   }

//   const result = await tagServices.updateTagInDB(id, updatedData);

//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: "Tag updated successfully!",
//     data: result,
//   });
// });

const createTag = catchAsync(async (req, res) => {
  const files =
    (req.files as { [fieldname: string]: Express.Multer.File[] }) || {};

  let iconUrl = req.body.iconUrl || "";
  if (files["iconFile"]?.[0]?.buffer) {
    const uploaded = await uploadBufferToCloudinary(
      files["iconFile"][0].buffer,
      files["iconFile"][0].originalname
    );
    iconUrl = uploaded?.secure_url || "";
  }

  let imageUrl = req.body.image && req.body.image.trim() ? req.body.image : undefined;
  if (files["imageFile"]?.[0]?.buffer) {
    const uploaded = await uploadBufferToCloudinary(
      files["imageFile"][0].buffer,
      files["imageFile"][0].originalname
    );
    imageUrl = uploaded?.secure_url;
  }

  const tagData: any = {
    name: req.body.name,
    slug: req.body.slug,
    details: req.body.details,
    icon: {
      name: req.body.iconName || "",
      url: iconUrl,
    },
  };

  if (imageUrl) {
    tagData.image = imageUrl;
  }

  const result = await tagServices.createTagOnDB(tagData);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Tag created successfully!",
    data: result,
  });
});

// const updateTag = catchAsync(async (req, res) => {
//   const { id } = req.params;
//   const files =
//     (req.files as { [fieldname: string]: Express.Multer.File[] }) || {};

//   const updatedData: any = { ...req.body };

//   if (files["imageFile"]?.[0]?.path) {
//     updatedData.image = files["imageFile"][0].path;
//   }

//   if (files["iconFile"]?.[0]?.path) {
//     updatedData.icon = {
//       name: req.body.iconName || "",
//       url: files["iconFile"][0].path,
//     };
//   }

//   const result = await tagServices.updateTagInDB(id, updatedData);

//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: "Tag updated successfully!",
//     data: result,
//   });
// });

const updateTag = catchAsync(async (req, res) => {
  const { id } = req.params;
  const files =
    (req.files as { [fieldname: string]: Express.Multer.File[] }) || {};

  const updatedData: any = { ...req.body };

  if (files["imageFile"]?.[0]?.buffer) {
    const uploaded = await uploadBufferToCloudinary(
      files["imageFile"][0].buffer,
      files["imageFile"][0].originalname
    );
    updatedData.image = uploaded?.secure_url || "";
  } else if (req.body.image) {
    updatedData.image = req.body.image;
  }

  if (files["iconFile"]?.[0]?.buffer) {
    const uploaded = await uploadBufferToCloudinary(
      files["iconFile"][0].buffer,
      files["iconFile"][0].originalname
    );
    updatedData.icon = {
      name: req.body.iconName || "",
      url: uploaded?.secure_url || "",
    };
  } else if (req.body.iconUrl || req.body.iconName) {
    updatedData.icon = {
      name: req.body.iconName || "",
      url: req.body.iconUrl || "",
    };
  }

  const result = await tagServices.updateTagInDB(id, updatedData);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Tag updated successfully!",
    data: result,
  });
});

const deleteTag = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await tagServices.deleteTagFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Tag deleted successfully!",
    data: result,
  });
});

export const tagControllers = {
  getAllTags,
  getSingleTag,
  createTag,
  updateTag,
  deleteTag,
};
