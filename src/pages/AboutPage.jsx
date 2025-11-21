import Navbar from '../components/Navbar'
import { Shield } from 'lucide-react'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* About Section */}
            <div className="pt-32 pb-24 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-blue-600 font-semibold tracking-wide uppercase text-sm mb-3">About Us</h2>
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-6">
                        Empowering organizations to build world-class teams.
                    </h3>
                    <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                        We believe that every employee deserves a clear path to growth. Our platform bridges the gap between current skills and future potential, enabling data-driven decisions for promotions, hiring, and development.
                    </p>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-bold text-blue-600">500+</span>
                            <span className="text-sm text-gray-500 mt-1">Companies</span>
                        </div>
                        <div className="hidden md:block w-px bg-gray-200 h-16"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-bold text-blue-600">10k+</span>
                            <span className="text-sm text-gray-500 mt-1">Assessments</span>
                        </div>
                        <div className="hidden md:block w-px bg-gray-200 h-16"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-bold text-blue-600">98%</span>
                            <span className="text-sm text-gray-500 mt-1">Satisfaction</span>
                        </div>
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
