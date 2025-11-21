import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState(null)
    const [hasActiveRole, setHasActiveRole] = useState(false)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchUserRole(session.user.id)
            } else {
                setLoading(false)
            }
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchUserRole(session.user.id)
            } else {
                setRole(null)
                setHasActiveRole(false)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchUserRole = async (userId) => {
        try {
            // 1. Fetch system role (admin/employee)
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('role')
                .eq('id', userId)
                .single()

            if (userError) throw userError
            setRole(userData?.role)

            // 2. If employee, check for active job role
            if (userData?.role === 'employee') {
                const { data: roleData } = await supabase
                    .from('employee_roles')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('status', 'active')
                    .maybeSingle()

                setHasActiveRole(!!roleData)
            } else {
                setHasActiveRole(true) // Admins always have access
            }

        } catch (error) {
            console.error('Error fetching user role:', error)
        } finally {
            setLoading(false)
        }
    }

    const value = {
        session,
        user,
        role,
        hasActiveRole,
        loading,
        signIn: (data) => supabase.auth.signInWithPassword(data),
        signUp: (data) => supabase.auth.signUp(data),
        signOut: () => supabase.auth.signOut(),
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
