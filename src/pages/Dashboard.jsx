import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
    const { user, role, signOut } = useAuth()

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-7xl">
                <div className="flex items-center justify-between rounded-lg bg-white p-6 shadow-md">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.email}</h1>
                        <p className="text-gray-600">Role: <span className="font-semibold capitalize">{role}</span></p>
                    </div>
                    <button
                        onClick={signOut}
                        className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                    >
                        Sign Out
                    </button>
                </div>

                <div className="mt-8">
                    {role === 'admin' ? (
                        <div className="rounded-lg bg-white p-6 shadow-md">
                            <h2 className="text-xl font-bold text-gray-900">Admin Dashboard</h2>
                            <p className="mt-2 text-gray-600">Manage employees, roles, and skills here.</p>
                        </div>
                    ) : (
                        <div className="rounded-lg bg-white p-6 shadow-md">
                            <h2 className="text-xl font-bold text-gray-900">Employee Dashboard</h2>
                            <p className="mt-2 text-gray-600">View your progress and learning path here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
