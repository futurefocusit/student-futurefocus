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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entry: any;
  exit: string;

  _id: string;
  email: string;
  name: string;
  password: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  role: Role;
  image: string
  position: string;
  phone: string;
  phone2: string;
  attend: boolean;
  active: boolean;
  institution: { logo: string, name: string }
  contractType: string,
  linkedIn: string,
  nationalId: string,
  leaveDetails:{
    isOnLeave: boolean,
    leaveType?: string ,
    startDate?: string,
    endDate?: string,
    approvedBy?: string,
  },
  bio: string,
  skills: string[],
  cv:string,
  certificate: {
    name: string;
    url: string;
  }[];
  instagram: string,
  snapchat: string,
  facebook: string,
  ranking: string,
  contract: string,
  paymentDate: string,
  salary: string,
  currency: string,
  dateJoined: string,
  days: "",
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
export interface Transaction {
  _id: string
  method: string
  receiver: { name: string }
  studentId: Student | null
  amount: number
  reason: string
  createdAt: string
  updatedAt: string
}

export interface Course {
  title: string
  _id: string
  shifts: { name: string; _id: string; start: string; end: string }[]
}
export interface Payment {
  transactions: Transaction[]
  studentId: { _id: string }
  amountDue: number
  amountPaid: number
  status: string
  _id: string
}
export interface Student {
    _id: string
    nid: string
    name: string
    image: string
    email: string
    phone: string
    intake: string
    secondPhone: string
    location: string
    gender: string
    identity: string
    dob: string
    nationality: string
    selectedCourse: { title: string; _id: string }
    message: string
    selectedShift: { _id: string; name: string; start: string; end: string }
    updatedAt: string
    createdAt: string
    status: string
    admitted: string
    registered: string
    comment: string
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

export interface User {
  fullName: string
  email: string
  phone: string
  location: string
  bio: string
  avatar: string
  website: string
  github: string
  twitter: string
  linkedin: string
  skills: string[]
  jobPosition: string
  joinedDate: string
  paymentDate: string
  salary: number
  currency: string
  entryTime: string
  exitTime: string
  workingDays: string[]
  leaveType: string
  leaveStartDate: string
  leaveEndDate: string
}