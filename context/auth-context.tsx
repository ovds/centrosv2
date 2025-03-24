"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type AuthContextType = {
    isAuthenticated: boolean
    login: (email: string, password: string) => void
    register: (name: string, email: string, password: string) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    // Initialize auth state from localStorage (if available)
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

    // Load auth state on mount
    useEffect(() => {
        const storedAuth = localStorage.getItem("isAuthenticated")
        if (storedAuth === "true") {
            setIsAuthenticated(true)
        }
    }, [])

    // Simple login function that accepts any credentials
    const login = (email: string, password: string) => {
        // Accept any email/password combination for now
        setIsAuthenticated(true)
        localStorage.setItem("isAuthenticated", "true")
        localStorage.setItem("userEmail", email)
    }

    // Simple registration function
    const register = (name: string, email: string, password: string) => {
        // Accept any registration for now
        setIsAuthenticated(true)
        localStorage.setItem("isAuthenticated", "true")
        localStorage.setItem("userName", name)
        localStorage.setItem("userEmail", email)
    }

    // Logout function
    const logout = () => {
        setIsAuthenticated(false)
        localStorage.removeItem("isAuthenticated")
        localStorage.removeItem("userName")
        localStorage.removeItem("userEmail")
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

// Custom hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}