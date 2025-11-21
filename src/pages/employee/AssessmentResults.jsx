import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { CheckCircle, XCircle, BookOpen, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AssessmentResults() {
    const { user } = useAuth()
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        if (user) {
            calculateResults()
        }
    }, [user])

    const calculateResults = async () => {
        try {
            // 1. Get current active role to determine Target Role
            const { data: roleData } = await supabase
                .from('employee_roles')
                .select('role_id, job_roles(id, title, level)')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .single()

            if (!roleData) return

            // 2. Determine Next Role (Same logic as SkillAssessment)
            let nextLevel = ''
            if (roleData.job_roles.level === 'junior') nextLevel = 'mid'
            else if (roleData.job_roles.level === 'mid') nextLevel = 'senior'

            let targetRoleData = null

            if (nextLevel) {
                const { data: nextRole } = await supabase
                    .from('job_roles')
                    .select('*')
                    .eq('level', nextLevel)
                    .ilike('title', `%${roleData.job_roles.title.replace('Junior ', '').replace('Mid-Level ', '').replace('Senior ', '')}%`)
                    .limit(1)
                    .single()

                targetRoleData = nextRole
            }

            // If no target role found (e.g. already Senior), maybe fallback to current?
            // For consistency with Assessment, let's assume there IS a target role if they just took it.
            // If not, we use current role.
            const roleIdToUse = targetRoleData ? targetRoleData.id : roleData.role_id

            // 3. Get latest assessments for this specific role
            // We need to be careful to get the LATEST rating for each skill.
            const { data: assessments, error: assessmentError } = await supabase
                .from('skill_assessments')
                .select('skill_id, self_rating, created_at, skills(id, name)')
                .eq('user_id', user.id)
                .eq('role_id', roleIdToUse)
                .order('created_at', { ascending: false })

            if (assessmentError) throw assessmentError

            // 4. Get skills for the TARGET role
            const { data: roleSkills } = await supabase
                .from('role_skills')
                .select('skill_id, required_level, skills(name)')
                .eq('role_id', roleIdToUse)

            const processedResults = roleSkills.map(rs => {
                // Find the LATEST assessment for this skill
                const userRatingObj = assessments.find(a => a.skill_id === rs.skill_id)
                const userRating = userRatingObj ? userRatingObj.self_rating : 0

                return {
                    skill_id: rs.skill_id,
                    skill_name: rs.skills.name,
                    required: rs.required_level,
                    actual: userRating,
                    gap: rs.required_level - userRating,
                    status: userRating >= rs.required_level ? 'pass' : 'fail'
                }
            })

            const strengths = processedResults.filter(r => r.status === 'pass')
            const weaknesses = processedResults.filter(r => r.status === 'fail')

            setResults({ strengths, weaknesses })

            // Auto-generate learning path ONLY if there are weaknesses
            if (weaknesses.length > 0) {
                await generateLearningPath(weaknesses, roleIdToUse)
            }

        } catch (error) {
            console.error('Error calculating results:', error)
        } finally {
            setLoading(false)
        }
    }

    const generateLearningPath = async (weaknesses, roleId) => {
        // 1. Remove ANY existing active items to ensure we only have ONE active path (the latest one)
        await supabase
            .from('learning_paths')
            .delete()
            .eq('user_id', user.id)
            .eq('status', 'active')

        // 2. Insert new items
        const newPaths = weaknesses.map(w => ({
            user_id: user.id,
            role_id: roleId,
            skill_id: w.skill_id,
            resource_title: `Mastering ${w.skill_name}`,
            resource_url: `https://example.com/learn/${w.skill_name.toLowerCase().replace(/ /g, '-')}`,
            completed: false,
            status: 'active'
        }))

        if (newPaths.length > 0) {
            const { error } = await supabase
                .from('learning_paths')
                .insert(newPaths)

            if (error) console.error('Error generating path:', error)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    )

    const hasWeaknesses = results?.weaknesses.length > 0

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Assessment Results</h1>
                <p className="mt-2 text-gray-600">Here's a detailed breakdown of how your skills compare to the role requirements.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Strengths */}
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
                    <div className="bg-emerald-50/50 px-6 py-4 border-b border-emerald-100 flex items-center">
                        <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                        </div>
                        <h2 className="text-lg font-bold text-emerald-900">Strengths</h2>
                    </div>
                    <div className="p-6">
                        <ul className="space-y-4">
                            {results?.strengths.map(s => (
                                <li key={s.skill_id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-emerald-50/30 transition-colors">
                                    <span className="font-semibold text-gray-900">{s.skill_name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                                            {s.actual} / {s.required}
                                        </span>
                                    </div>
                                </li>
                            ))}
                            {results?.strengths.length === 0 && (
                                <li className="text-center py-8 text-gray-500 italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    No specific strengths identified yet. Keep learning!
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Development Areas */}
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
                    <div className="bg-rose-50/50 px-6 py-4 border-b border-rose-100 flex items-center">
                        <div className="p-2 bg-rose-100 rounded-lg mr-3">
                            <XCircle className="h-5 w-5 text-rose-600" />
                        </div>
                        <h2 className="text-lg font-bold text-rose-900">Development Areas</h2>
                    </div>
                    <div className="p-6">
                        <ul className="space-y-4">
                            {results?.weaknesses.map(w => (
                                <li key={w.skill_id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-rose-50/30 transition-colors">
                                    <span className="font-semibold text-gray-900">{w.skill_name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-rose-600 bg-rose-100 px-2.5 py-0.5 rounded-full">
                                            {w.actual} / {w.required}
                                        </span>
                                    </div>
                                </li>
                            ))}
                            {results?.weaknesses.length === 0 && (
                                <li className="text-center py-8 text-gray-500 italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    Great job! You meet all requirements.
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Action Button - Only show if there are weaknesses */}
            {hasWeaknesses ? (
                <div className="flex justify-center pt-8">
                    <button
                        onClick={() => navigate('/employee/learning')}
                        className="group inline-flex items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-2xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-105"
                    >
                        <BookOpen className="mr-3 h-6 w-6" />
                        View Personalized Learning Path
                        <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            ) : (
                <div className="flex justify-center pt-8">
                    <div className="text-center bg-emerald-50 p-8 rounded-2xl border border-emerald-100">
                        <h3 className="text-xl font-bold text-emerald-800 mb-2">Congratulations!</h3>
                        <p className="text-emerald-600 font-medium mb-6">You have successfully passed the assessment requirements.</p>
                        <button
                            onClick={() => navigate('/employee/tests')}
                            className="group inline-flex items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-2xl shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all transform hover:scale-105"
                        >
                            Proceed to Skill Tests
                            <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
