import { Link, useLocation } from 'react-router-dom'
import { Shield } from 'lucide-react'

export default function Navbar() {
    const location = useLocation()

    return (
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">Competency<span className="text-blue-600">Manager</span></span>
                    </Link>
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className={`font-medium transition-colors ${location.pathname === '/' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Home</Link>
                        <Link to="/features" className={`font-medium transition-colors ${location.pathname === '/features' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Features</Link>
                        <Link to="/about" className={`font-medium transition-colors ${location.pathname === '/about' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>About</Link>
                        <Link to="/login" className="text-gray-900 font-semibold hover:text-blue-600 transition-colors">Sign In</Link>
                        <Link
                            to="/signup"
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    )
}
