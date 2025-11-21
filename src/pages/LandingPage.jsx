import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, BarChart, Users, BookOpen, Shield } from 'lucide-react'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <a href="#home" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 tracking-tight">Competency<span className="text-blue-600">Manager</span></span>
                        </a>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#home" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Home</a>
                            <a href="#features" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Features</a>
                            <a href="#about" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">About</a>
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

            {/* About Section */}
            <div id="about" className="py-24 bg-white border-b border-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-blue-600 font-semibold tracking-wide uppercase text-sm mb-3">About Us</h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-6">
                                Empowering organizations to build world-class teams.
                            </h3>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                We believe that every employee deserves a clear path to growth. Our platform bridges the gap between current skills and future potential, enabling data-driven decisions for promotions, hiring, and development.
                            </p>
                            <div className="flex gap-4">
                                <div className="flex flex-col">
                                    <span className="text-3xl font-bold text-blue-600">500+</span>
                                    <span className="text-sm text-gray-500">Companies</span>
                                </div>
                                <div className="w-px bg-gray-200 h-12"></div>
                                <div className="flex flex-col">
                                    <span className="text-3xl font-bold text-blue-600">10k+</span>
                                    <span className="text-sm text-gray-500">Assessments</span>
                                </div>
                                <div className="w-px bg-gray-200 h-12"></div>
                                <div className="flex flex-col">
                                    <span className="text-3xl font-bold text-blue-600">98%</span>
                                    <span className="text-sm text-gray-500">Satisfaction</span>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-600 rounded-3xl rotate-3 opacity-10"></div>
                            <div className="relative bg-gray-50 p-8 rounded-3xl border border-gray-100">
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-green-100 p-2 rounded-lg shrink-0">
                                            <CheckCircle className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Transparent Growth</h4>
                                            <p className="text-sm text-gray-600 mt-1">Employees know exactly what is needed to reach the next level.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="bg-purple-100 p-2 rounded-lg shrink-0">
                                            <CheckCircle className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Unbiased Promotions</h4>
                                            <p className="text-sm text-gray-600 mt-1">Decisions based on verified skills, not just tenure or opinion.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="bg-orange-100 p-2 rounded-lg shrink-0">
                                            <CheckCircle className="h-6 w-6 text-orange-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Continuous Learning</h4>
                                            <p className="text-sm text-gray-600 mt-1">Integrated learning paths keep skills sharp and relevant.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div id="features" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-blue-600 font-semibold tracking-wide uppercase text-sm mb-3">Features</h2>
                        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Everything you need to manage talent</h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: BarChart,
                                title: "Skill Assessments",
                                desc: "Automated testing and validation of employee skills with instant feedback and scoring."
                            },
                            {
                                icon: BookOpen,
                                title: "Learning Paths",
                                desc: "Personalized development plans generated automatically based on skill gaps."
                            },
                            {
                                icon: Users,
                                title: "Role Management",
                                desc: "Define clear career ladders and requirements for every role in your organization."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1">
                                <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                                    <feature.icon className="h-7 w-7" />
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
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
