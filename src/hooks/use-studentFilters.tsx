"use client"

import { Student } from "@/types/types"
import { useState, useMemo, useCallback } from "react"

interface GroupedStudents {
  [key: string]: Student[]
}

export const useStudentFilters = (students: Student[], defaultFilter = "pending") => {
  const [activeFilter, setActiveFilter] = useState<string>(defaultFilter)
  const [searchTerm, setSearchTerm] = useState<string>("")

  // Memoize student counts to avoid recalculation on every render
  const studentCounts = useMemo(() => {
    return students.reduce(
      (acc, student) => {
        acc[student.status] = (acc[student.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  }, [students])

  // Memoize filtered and grouped students
  const groupedStudents = useMemo(() => {
    const filteredStudents = students.filter((student) => {
      const matchesStatus = student.status === activeFilter
      const matchesSearch =
        searchTerm === "" ||
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesStatus && matchesSearch
    })

    return filteredStudents.reduce((acc: GroupedStudents, student) => {
      if (!acc[student.intake]) {
        acc[student.intake] = []
      }
      acc[student.intake].push(student)
      return acc
    }, {})
  }, [students, activeFilter, searchTerm])

  const handleFilterChange = useCallback((status: string) => {
    setActiveFilter(status)
    setSearchTerm("") // Reset search when changing filter
  }, [])

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  return {
    activeFilter,
    searchTerm,
    groupedStudents,
    studentCounts,
    handleFilterChange,
    handleSearchChange,
  }
}
