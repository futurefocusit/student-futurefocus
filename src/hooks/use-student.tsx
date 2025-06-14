"use client"

import { useState, useCallback } from "react"
import axiosInstance, { fetchWithCache, fetchWithRetry } from "@/libs/axios"
import API_BASE_URL from "@/config/baseURL"
import { Course, Payment, Student } from "@/types/types"

export interface UseStudentDataReturn {
  students: Student[]
  payment: Payment[]
  courses: Course[]
  loading: boolean
  error: string | null
  fetchStudents: () => Promise<Student[]>
  fetchPayments: () => Promise<Payment[]>
  fetchCourses: () => Promise<Course[]>
}

export const useStudentData = (): UseStudentDataReturn => {
  const [students, setStudents] = useState<Student[]>([])
  const [payment, setPayment] = useState<Payment[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStudents = useCallback(async () => {
    try {
      const response = await fetchWithCache<Student[]>(`${API_BASE_URL}/students`)
      const sortedStudents = response.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      setStudents(sortedStudents)
      return sortedStudents
    } catch (error) {
      console.error("Error fetching student data:", error)
      setError("Failed to load student data. Please try again later.")
      throw error
    }
  }, [])

  const fetchPayments = useCallback(async () => {
    try {
      const response = await fetchWithCache<Payment[]>(`${API_BASE_URL}/payment`)
      setPayment(response)
      return response
    } catch (error) {
      console.error("Error fetching payment data:", error)
      setError("Failed to load payment data. Please reload.")
      throw error
    }
  }, [])

  const fetchCourses = useCallback(async () => {
    try {
      const response = await fetchWithCache<Course[]>(`${API_BASE_URL}/course`)
      setCourses(response)
      return response
    } catch (error) {
      console.error("Error fetching courses:", error)
      setError("Failed to load courses. Please try again later.")
      throw error
    }
  }, [])

  return {
    students,
    payment,
    courses,
    loading,
    error,
    fetchStudents,
    fetchPayments,
    fetchCourses,
  }
}
