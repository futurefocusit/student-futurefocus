import axiosInstance, { fetchWithCache, fetchWithRetry } from '@/libs/axios';
import API_BASE_URL from "@/config/baseURL";


export interface Course {
  _id?: string;
  title: string;
  active: boolean;
  rating: number;
  image: string;
  scholarship: number;
  nonScholarship: number;
  shifts: { _id: string, name: string, start: string, end: string }[];
}

export const getCourses = async () => {
  return await fetchWithCache<Course[]>(`${API_BASE_URL}/course/`);
};

export const addCourse = async (course: Course) => {
  const response = await fetchWithRetry(() =>
    axiosInstance.post<Course>(`${API_BASE_URL}/course/new`, course)
  );
  return response.data;
};

export const updateCourse = async (id: string, course: Course) => {
  const response = await fetchWithRetry(() =>
    axiosInstance.put<Course>(`${API_BASE_URL}/course/update/${id}`, course)
  );
  return response.data;
};

export const deleteCourse = async (id: string) => {
  await fetchWithRetry(() =>
    axiosInstance.delete(`${API_BASE_URL}/course/delete/${id}`)
  );
};
