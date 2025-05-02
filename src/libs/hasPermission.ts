import { TeamMember } from "@/types/types";

interface User {
  role: {
    permission: Array<{
      feature: {
        _id: string;
        feature: string;
      };
      permission: string;
    }>;
  };
}

export const hasPermission = (
  user: User,
  featureId: string,
  requiredPermission: string
): boolean => {
  if (!user?.role?.permission) return false;

  return user.role.permission.some(
    (p) =>
      p.feature.feature === featureId && p.permission === requiredPermission
  );
};

// Example usage
