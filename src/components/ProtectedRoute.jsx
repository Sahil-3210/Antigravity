import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ allowedRoles }) {
    const { user, role, loading } = useAuth()

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <div className="flex h-screen items-center justify-center">Unauthorized Access</div>
    }

    return <Outlet />
}
