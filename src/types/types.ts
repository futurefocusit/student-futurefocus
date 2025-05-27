export interface Feature {
  _id: string;
  feature: string;
  web: string;
}

export interface Permission {
  _id: string;
  feature: Feature;
  permission: string;
}

export interface Role {
  _id: string;
  role: string;
  permission: Permission[];
}

export interface TeamMember {

  _id: string;
  email: string;
  name: string;
  password: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  role: Role;
  image: string
  position: string
  attend: boolean;
  active: boolean;
  institution: { logo: string, name: string }

}
export interface TeamMemberLogin {

  email: string;
  // name: string;
  password: string;
  // isAdmin: string;
  // role: Role;
}
export interface IInvoice {
  paymentMethod: string
  student: string;
  amount: number;
  reason: string;
  date: Date;
  remaining: number
  status: string
}
export interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  selectedCourse: string;
  selectedShift: { name: string };
  intake: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  _id: string;
  studentId: Student | null;
  status: "present" | "absent";
  createdAt: string;
  updatedAt: string;
}
export interface memberAttendanceRecord {
  _id: string;
  memberId: { name: string; position: string, phone: string };
  email: string;
  comment: string
  status: string;
  updatedAt: string;
  timeOut: string;
  response: string
}
export interface GroupedAttendance {
  [date: string]: {
    [intake: string]: {
      [shift: string]: AttendanceRecord[];
    };
  };
}
export interface IPermission {
  _id: string;
  feature: Feature;
  permission: string;
}

export interface IRole {
  _id: string;
  role: string;
  permission: Permission[];
}

export interface IUser {
  _id: string;
  email: string;
  name: string;
  role: Role;
  image: string;
}
export interface IFeature {
  _id: string;
  feature: string;
  web: string;
}

export interface Institution {
  _id: string;
  name: string;
  isSuperInst: boolean;
  email: string;
  phone: number;
  logo: string;
  verified: boolean;
  access?: {
    _id: string;
    institution: string;
    subscriptionEnd: string;
    features: Array<{
      feature: string;
      active: boolean;
      lastUpdated: string;
      expiresAt: string;
      _id: string;
    }>;
    status: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface User {
  _id: string;
  institution: Institution;
  name: string;
  active: boolean;
  attend: boolean;
  image: string;
  position: string;
  email: string;
  phone: string;
  password: string;
  otp: string | null;
  role: {
    _id: string;
    institution: string;
    role: string;
    permission: Array<{
      _id: string;
      feature: {
        _id: string;
        feature: string;
        web: string;
        createdAt: string;
        updatedAt: string;
        __v: number;
      };
      permission: string;
      createdAt: string;
      updatedAt: string;
      __v: number;
    }>;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  isAdmin: boolean;
  isSuperAdmin: boolean;
  __v: number;
}