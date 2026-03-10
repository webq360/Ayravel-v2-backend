import { userRole } from "./user.const";

type TUserRoles =
  | "customer"
  | "vendor"
  | "vendor-staff"
  | "admin"
  | "admin-staff"
  | "super-admin";

type TGender = "male" | "female" | "other";

type TUserStatus = "active" | "inActive" | "banned";

type TAddress = {
  label?: string;
  fullAddress?: string;
  city?: string;
  district?: string;
  area?: string;
  zone?: string;
  postalCode?: string;
};

export type TUser = {
  name: string;
  email: string;
  password: string;
  image?: string;
  role?: TUserRoles;
  gender?: TGender;
  contactNo?: string;
  bio?: string;
  status?: TUserStatus;
  walletPoint?: number;
  socials?: string[];
  cardInfo?: null;
  address?: TAddress;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
};

export type TUserRole = keyof typeof userRole;
