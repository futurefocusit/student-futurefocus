import { IUser } from "@/types/types";

export const hasPermission = (
  user: IUser,
  featureName: string,
  permissionType: string
) => {
  return user?.role?.permission.some(
    (permission) =>
      permission.feature.feature === featureName &&
      permission.permission === permissionType
  );
};

// Example usage
