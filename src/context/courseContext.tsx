import API_BASE_URL from "@/config/baseURL";
import axios from "axios";

export interface Course {
  _id?: string;
  title: string;
  active: boolean;
  rating: number;
  image: string;
  scholarship: number;
  nonScholarship: number;
  shifts: {_id:string,name:string,start:string,end:string}[];
}


export const getCourses = async () => {
  return await axios.get<Course[]>(`${API_BASE_URL}/course/`);
};

export const addCourse = async (course: Course) => {
  return await axios.post<Course>(`${API_BASE_URL}/course/new`, course,{headers:{
    Authorization: `Bearer ${localStorage.getItem('ffa-admin')}`,

  }});
 
};

export const updateCourse = async (id: string, course: Course) => {
  return await axios.put<Course>(
    `${API_BASE_URL}/course/update/${id}`,
    course,{headers:{
      Authorization: `Bearer ${localStorage.getItem('ffa-admin')}`,
  
    }}
  );
};

export const deleteCourse = async (id: string) => {
  return await axios.delete(`${API_BASE_URL}/course/delete/${id}`,{headers:{
    Authorization: `Bearer ${localStorage.getItem('ffa-admin')}`,

  }});
};
