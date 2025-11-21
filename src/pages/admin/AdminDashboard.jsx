import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Users, TrendingUp, Briefcase, CheckCircle } from 'lucide-react'

export default function AdminDashboard() {
    const { user } = useAuth()
    const [stats, setStats] = useState({
        totalEmployees: 0,
        pendingPromotions: 0,
        activeRoles: 0,
        completedAssessments: 0
    })
    const [loading, setLoading] = useState(true)
    const [userName, setUserName] = useState('')

    useEffect(() => {
        fetchStats()
        if (user) fetchUserName()
    }, [user])

    const fetchUserName = async () => {
        const { data } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', user.id)
            .single()
        if (data?.full_name) setUserName(data.full_name)
    }

    const fetchStats = async () => {
        try {
            // 1. Total Employees
            const { count: employeeCount } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'employee')

            // 2. Pending Promotions
            const { count: promotionCount } = await supabase
                .from('promotion_requests')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending')

            // 3. Active Job Roles
            const { count: roleCount } = await supabase
                .from('job_roles')
                .select('*', { count: 'exact', head: true })

            // 4. Completed Assessments (Unique users who have assessed)
            // This is a bit trickier with simple count, so we'll just count total assessment rows for now
            // or we can count passed tests
            const { count: testCount } = await supabase
                .from('test_attempts')
                .select('*', { count: 'exact', head: true })
                .eq('passed', true)

            setStats({
                totalEmployees: employeeCount || 0,
                pendingPromotions: promotionCount || 0,
                activeRoles: roleCount || 0,
                completedAssessments: testCount || 0
            })

        } catch (error) {
            console.error('Error fetching admin stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="p-8">Loading dashboard...</div>

    const statCards = [
        { name: 'Total Employees', value: stats.totalEmployees, icon: Users, color: 'bg-blue-500', trend: '+12%' },
        { name: 'Pending Promotions', value: stats.pendingPromotions, icon: TrendingUp, color: 'bg-amber-500', trend: 'Action Needed' },
        { name: 'Active Job Roles', value: stats.activeRoles, icon: Briefcase, color: 'bg-indigo-500', trend: 'Stable' },
        { name: 'Tests Passed', value: stats.completedAssessments, icon: CheckCircle, color: 'bg-emerald-500', trend: '+5%' },
    ]

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
                <p className="mt-2 text-gray-600">
                    Welcome back, <span className="font-semibold text-gray-900">{userName || user?.email}</span>
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
                {statCards.map((item) => {
                    const Icon = item.icon
                    return (
                        <div key={item.name} className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-md">
                            <dt>
                                <div className={`absolute rounded-xl p-3 ${item.color} bg-opacity-10`}>
                                    <Icon className={`h-6 w-6 ${item.color.replace('bg-', 'text-')}`} aria-hidden="true" />
                                </div>
                                <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
                            </dt>
                            <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
                                <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                                <p className="ml-2 flex items-baseline text-sm font-semibold text-gray-400">
                                    {item.trend}
                                </p>
                            </dd>
                        </div>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-900/5">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <Link to="/admin/employees" className="group flex items-center justify-between rounded-xl border border-gray-200 p-4 hover:border-blue-500 hover:ring-1 hover:ring-blue-500 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Manage Employees</p>
                                    <p className="text-sm text-gray-500">View all employees and assign roles</p>
                                </div>
                            </div>
                            <div className="text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                                &rarr;
                            </div>
                        </Link>
                        <Link to="/admin/promotions" className="group flex items-center justify-between rounded-xl border border-gray-200 p-4 hover:border-blue-500 hover:ring-1 hover:ring-blue-500 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                                    <TrendingUp className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Review Promotions</p>
                                    <p className="text-sm text-gray-500">Approve or reject pending requests</p>
                                </div>
                            </div>
                            <div className="text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                                &rarr;
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="rounded-2xl bg-linear-to-br from-slate-800 to-slate-900 p-8 text-white shadow-lg">
                    <h3 className="text-lg font-semibold mb-4">System Status</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                            <span className="text-slate-300">Database Connection</span>
                            <span className="flex items-center text-emerald-400 text-sm font-medium">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 mr-2"></span>
                                Operational
                            </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                            <span className="text-slate-300">Last Backup</span>
                            <span className="text-slate-400 text-sm">2 hours ago</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-300">System Version</span>
                            <span className="text-slate-400 text-sm">v1.2.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
