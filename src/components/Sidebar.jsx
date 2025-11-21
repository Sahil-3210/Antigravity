import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Award,
    TrendingUp,
    LogOut,
    Settings
} from 'lucide-react'
import clsx from 'clsx'

export default function Sidebar() {
    const { role, hasActiveRole, signOut } = useAuth()
    const location = useLocation()

    const adminLinks = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Employees', path: '/admin/employees', icon: Users },
        { name: 'Roles & Skills', path: '/admin/roles', icon: Settings },
        { name: 'Promotions', path: '/admin/promotions', icon: TrendingUp },
    ]

    const employeeLinks = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'My Skills', path: '/employee/skills', icon: Award },
        { name: 'Learning Path', path: '/employee/learning', icon: BookOpen },
        { name: 'Tests', path: '/employee/tests', icon: BookOpen },
        { name: 'Promotions', path: '/employee/promotions', icon: TrendingUp },
    ]

    // Filter links: Admin gets all admin links. Employees get all links ONLY if they have an active role.
    // If employee has no role, they only get Dashboard.
    let links = []
    if (role === 'admin') {
        links = adminLinks
    } else {
        links = hasActiveRole
            ? employeeLinks
            : employeeLinks.filter(l => l.name === 'Dashboard')
    }

    return (
        <div className="flex h-screen w-72 flex-col bg-slate-900 text-white shadow-xl transition-all duration-300 ease-in-out">
            <div className="flex h-20 items-center px-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-500/20">
                        <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-white">Competency</h1>
                        <p className="text-xs font-medium text-slate-400">Management System</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
                <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Menu
                </div>
                {links.map((link) => {
                    const Icon = link.icon
                    const isActive = location.pathname === link.path
                    return (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={clsx(
                                'group flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 translate-x-1'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'
                            )}
                        >
                            <Icon className={clsx("mr-3 h-5 w-5 shrink-0 transition-colors", isActive ? "text-white" : "text-slate-500 group-hover:text-white")} />
                            {link.name}
                        </Link>
                    )
                })}
            </nav>

            <div className="border-t border-slate-800 p-4 bg-slate-900/50">
                <button
                    onClick={signOut}
                    className="group flex w-full items-center rounded-xl px-3 py-3 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
                >
                    <LogOut className="mr-3 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                    Sign Out
                </button>
            </div>
        </div>
    )
}
