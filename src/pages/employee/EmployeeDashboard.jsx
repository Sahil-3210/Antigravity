import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function EmployeeDashboard() {
    const { user } = useAuth()
    const [assignedRole, setAssignedRole] = useState(null)
    const [loading, setLoading] = useState(true)
    const [userName, setUserName] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        if (user) {
            fetchAssignedRole()
            fetchUserName()
        }
    }, [user])

    const fetchUserName = async () => {
        const { data } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', user.id)
            .single()
        if (data?.full_name) setUserName(data.full_name)
    }

    const fetchAssignedRole = async () => {
        try {
            const { data, error } = await supabase
                .from('employee_roles')
                .select('*, job_roles(*)')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .single()

            if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
                console.error('Error fetching role:', error)
            }

            if (data) {
                setAssignedRole(data.job_roles)
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="p-8">Loading...</div>
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Employee Dashboard</h1>
                <p className="mt-2 text-gray-600">
                    Welcome back, <span className="font-semibold text-gray-900">{userName || user?.email}</span>
                </p>
            </div>

            <div className="mt-6">
                {!assignedRole ? (
                    <div className="rounded-2xl bg-amber-50 p-8 shadow-sm ring-1 ring-amber-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-amber-100 rounded-xl">
                                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <h2 className="text-xl font-bold text-amber-900">Waiting for Role Assignment</h2>
                        </div>
                        <p className="text-amber-800 max-w-2xl">
                            Your account is currently active, but an administrator has not assigned you a specific role yet.
                            Please check back later or contact your team lead for assistance.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-8 md:grid-cols-3">
                        {/* Main Role Card */}
                        <div className="md:col-span-2 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-900/5">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-sm font-medium text-blue-600 mb-1">Current Position</p>
                                    <h2 className="text-2xl font-bold text-gray-900">{assignedRole.title}</h2>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                </div>
                            </div>
                            <p className="text-gray-600 mb-8 leading-relaxed">{assignedRole.description}</p>

                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Quick Actions</h3>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => navigate('/employee/skills')}
                                        className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                                    >
                                        Start Skill Assessment
                                    </button>
                                    <button
                                        onClick={() => navigate('/employee/learning')}
                                        className="inline-flex items-center justify-center rounded-xl bg-white border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
                                    >
                                        View Learning Path
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Stats / Info Card */}
                        <div className="rounded-2xl bg-linear-to-br from-slate-800 to-slate-900 p-8 text-white shadow-lg flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Career Progress</h3>
                                <p className="text-slate-400 text-sm">Track your journey to the next level.</p>
                            </div>

                            <div className="space-y-6 mt-8">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-300">Skill Mastery</span>
                                        <span className="text-white font-medium">In Progress</span>
                                    </div>
                                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-1/3 rounded-full"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-300">Tests Passed</span>
                                        <span className="text-white font-medium">0</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
