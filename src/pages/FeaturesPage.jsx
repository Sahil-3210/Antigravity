import Navbar from '../components/Navbar'
import { BarChart, Users, BookOpen, Shield } from 'lucide-react'

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Features Section */}
            <div className="pt-32 pb-24 bg-gray-50">
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
