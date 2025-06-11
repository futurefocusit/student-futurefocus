"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import API_BASE_URL from "@/config/baseURL"
import { fetchWithRetry } from "@/libs/retry"
import { Course, Payment, Student } from "@/types/types"

interface UseStudentDataReturn {
  students: Student[]
  payment: Payment[]
  courses: Course[]
  loading: boolean
  error: string | null
  refetchStudents: () => Promise<Student[]>
  refetchPayments: () => Promise<Payment[]>
}

export const useStudentData = (): UseStudentDataReturn => {
  const [students, setStudents] = useState<Student[]>([])
  const [payment, setPayment] = useState<Payment[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getAuthHeaders = useCallback(
    () => ({
      headers: {
        Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
      },
    }),
    [],
  )

  const fetchStudents = useCallback(async () => {
    try {
      const response = await fetchWithRetry(() => axios.get<Student[]>(`${API_BASE_URL}/students`, getAuthHeaders()))
      const sortedStudents = response.data.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      setStudents(sortedStudents)
      return sortedStudents
    } catch (error) {
      console.error("Error fetching student data:", error)
      setError("Failed to load student data. Please try again later.")
      throw error
    }
  }, [getAuthHeaders])

  const fetchPayments = useCallback(async () => {
    try {
      const response = await fetchWithRetry(() => axios.get<Payment[]>(`${API_BASE_URL}/payment`, getAuthHeaders()))
      setPayment(response.data)
      return response.data
    } catch (error) {
      console.error("Error fetching payment data:", error)
      setError("Failed to load payment data. Please reload.")
      throw error
    }
  }, [getAuthHeaders])

  const fetchCourses = useCallback(async () => {
    try {
      const response = await fetchWithRetry(() => axios.get<Course[]>(`${API_BASE_URL}/course`, getAuthHeaders()))
      setCourses(response.data)
      return response.data
    } catch (error) {
      console.error("Error fetching courses:", error)
      setError("Failed to load courses. Please try again later.")
      throw error
    }
  }, [getAuthHeaders])

  useEffect(() => {
    let isMounted = true

    const fetchAllData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all data in parallel but handle errors gracefully
        const promises = [fetchStudents(), fetchPayments(), fetchCourses()]

        await Promise.allSettled(promises)
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching data:", error)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchAllData()

    // Cleanup function to prevent race conditions
    return () => {
      isMounted = false
    }
  }, [fetchStudents, fetchPayments, fetchCourses])

  return {
    students,
    payment,
    courses,
    loading,
    error,
    refetchStudents: fetchStudents,
    refetchPayments: fetchPayments,
  }
}
