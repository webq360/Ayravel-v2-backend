export const userRoles = [
  "customer",
  "vendor",
  "vendor-staff",
  "admin",
  "admin-staff",
  "super-admin",
];

export const possibleGenders = ["male", "female", "other"];

export const userStatus = ["active", "inActive", "banned"];

export const userRole = {
  customer: "customer",
  admin: "admin",
  "super-admin": "super-admin",
  "admin-staff": "admin-staff",
  vendor: "vendor",
  "vendor-staff": "vendor-staff",
} as const;
