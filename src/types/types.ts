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

export interface IUser {
  _id: string;
  email: string;
  name: string;
  role: Role;
}
export interface IInvoice {
  student: string;
  amount: number;
  reason: string;
  date: Date;
  remaining:number
  status:string
}
