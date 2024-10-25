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
  role: Role;
}
export interface TeamMemberLogin {

  email: string;
  // name: string;
  password: string;
  // isAdmin: string;
  // role: Role;
}
export interface IInvoice {
  paymentMethod:string
  student: string;
  amount: number;
  reason: string;
  date: Date;
  remaining:number
  status:string
}
export interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  selectedCourse: string;
  selectedShift: string;
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
  memberId: { name: string; position: string };
  email: string;
  status: string;
  updatedAt: string;
  timeOut: string;
}
export interface GroupedAttendance {
  [date: string]: {
    [intake: string]: {
      [shift: string]: AttendanceRecord[];
    };
  };
}