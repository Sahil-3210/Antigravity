import { Link } from 'react-router-dom'
import { ArrowRight, Shield } from 'lucide-react'
import Navbar from '../components/Navbar'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <div id="home" className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/hero-bg.png"
                        alt="Office Background"
                        className="w-full h-full object-cover opacity-10"
                    />
                    <div className="absolute inset-0 bg-linear-to-b from-white/0 via-white/50 to-white"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

                    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight mb-6 leading-tight">
                        Elevate Your Workforce <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">Competency & Growth</span>
                    </h1>

                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 leading-relaxed">
                        Streamline skills management, automate assessments, and accelerate career progression with our intelligent competency management platform.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/signup"
                            className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            Start Free Trial <ArrowRight className="h-5 w-5" />
                        </Link>
                        <Link
                            to="/login"
                            className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-2xl font-bold text-lg hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center"
                        >
                            View Demo
                        </Link>
                    </div>

                    <div className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-16 text-gray-400 grayscale opacity-70">
                        {/* Placeholder Logos */}
                        <div className="font-bold text-xl">ACME Corp</div>
                        <div className="font-bold text-xl">GlobalTech</div>
                        <div className="font-bold text-xl">InnovateLabs</div>
                        <div className="font-bold text-xl">FutureSystems</div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-gray-900 p-1.5 rounded-lg">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-gray-900">CompetencyManager</span>
                    </div>
                    <p className="text-gray-500 text-sm">© 2024 Competency Manager Inc. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
