import bcrypt from "bcrypt";
import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";
import config from "../../config";
import AppError from "../../errors/handleAppError";
import { CustomerModel } from "../customer/customer.model";
import { OrderModel } from "../order/order.model";
import { VendorSearchableFields } from "../vendor/vendor.consts";
import { TUser } from "./user.interface";
import { UserModel } from "./user.model";

const getAllUserFromDB = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(UserModel.find(), query)
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();

  return { data, meta };
};

const getSingleUserFromDB = async (id: string) => {
  const result = await UserModel.findById(id);

  //if no user found with the id
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "User does not exist!");
  }

  return result;
};

const getAllAdminFromDB = async (query: Record<string, unknown>) => {
  const adminQuery = new QueryBuilder(UserModel.find({ role: "admin" }), query)
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await adminQuery.modelQuery;
  const meta = await adminQuery.countTotal();

  return { data, meta };
};

const getAdminProfileFromDB = async (id: string) => {
  const result = await UserModel.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "User does not exist!");
  }
  if (result.role !== "super-admin") {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized User!");
  }
  return result;
};

const getAllVendorFromDB = async (query: Record<string, unknown>) => {
  const vendorQuery = new QueryBuilder(UserModel.find({ role: "vendor" }), query)
    .search(VendorSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await vendorQuery.modelQuery;
  const meta = await vendorQuery.countTotal();

  return { data, meta };
};

const updateUserOnDB = async (
  id: string,
  payload: Partial<TUser>
) => {
  const isUserExists = await UserModel.findById(id);

  if (!isUserExists) {
    throw new AppError(httpStatus.NOT_FOUND, "User does not Exists!");
  }

  // Prevent email update
  if (payload?.email) {
    delete payload.email;
  }

  // Hash password if provided
  if (payload?.password) {
    payload.password = await bcrypt.hash(
      payload?.password,
      Number(config.bcrypt_salt_rounds)
    );
  }

  const result = await UserModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).select("-password");

  return result;
};

const deletSingleUserFromDB = async (id: string) => {
  const isUserExists = await UserModel.findById(id);

  if (!isUserExists) {
    throw new AppError(httpStatus.NOT_FOUND, "User does not Exists!");
  }

  await UserModel.findByIdAndDelete(id);
};

const getUserWithDetailsFromDB = async (
  userId: string,
  query: Record<string, unknown>
) => {
  const user = await UserModel.findById(userId).select("-password");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User does not exist!");
  }

  let customerData = null;
  let orders: any[] = [];
  let orderMeta = { page: 1, limit: 10, total: 0, totalPage: 0 };

  if (user.role === "customer") {
    customerData = await CustomerModel.findOne({ userId }).populate([
      { path: "cartItem.productInfo.productId" },
      { path: "wishlist.products" },
    ]);

    // Find orders by customerId if customer exists, otherwise try userId directly
    const searchId = customerData ? customerData._id : userId;
    
    const orderQuery = new QueryBuilder(
      OrderModel.find({ "orderInfo.orderBy": searchId }),
      query
    )
      .filter()
      .sort()
      .paginate()
      .fields();

    orders = await orderQuery.modelQuery.populate({
      path: "orderInfo.productInfo",
      select: "description.name productInfo.price productInfo.salePrice featuredImg",
    });

    orderMeta = await orderQuery.countTotal();
  }

  return {
    data: {
      user,
      customer: customerData,
      orders,
    },
    meta: orderMeta,
  };
};

export const UserServices = {
  getAllUserFromDB,
  getSingleUserFromDB,
  deletSingleUserFromDB,
  getAllAdminFromDB,
  getAllVendorFromDB,
  getAdminProfileFromDB,
  updateUserOnDB,
  getUserWithDetailsFromDB,
};
