import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { PlayCircle, Lock, AlertCircle } from 'lucide-react'

export default function TestList() {
    const { user } = useAuth()
    const [skills, setSkills] = useState([])
    const [loading, setLoading] = useState(true)
    const [isLocked, setIsLocked] = useState(false)
    const [lockReason, setLockReason] = useState('') // 'learning_active' or 'assessment_needed'
    const navigate = useNavigate()

    useEffect(() => {
        if (user) {
            fetchData()
        }
    }, [user])

    const fetchData = async () => {
        try {
            // 1. Check for Active Learning Path
            const { data: activePath } = await supabase
                .from('learning_paths')
                .select('id')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .limit(1)

            if (activePath && activePath.length > 0) {
                setIsLocked(true)
                setLockReason('learning_active')
                setLoading(false)
                return
            }

            // 2. Get user's current role
            const { data: roleData } = await supabase
                .from('employee_roles')
                .select('role_id, job_roles(id, title, level)')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .single()

            if (!roleData) {
                setLoading(false)
                return
            }

            // 3. Determine Target Role (Next Role)
            // We need to check if they passed the assessment for the NEXT role.
            // Tests are usually for the skills of the NEXT role they are aspiring to?
            // Or are tests for the CURRENT role?
            // Based on context: "passed the skill assment for the next role. i shold go to test correct."
            // So tests are for the NEXT role's skills.

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

            // If no target role, maybe they are at top? 
            // If so, maybe tests are for current role?
            // Let's assume targetRoleData is required for progression.
            const roleIdToCheck = targetRoleData ? targetRoleData.id : roleData.role_id

            // 4. Check if Assessment Passed for this role
            // Fetch skills requirements
            const { data: roleSkills } = await supabase
                .from('role_skills')
                .select('skill_id, required_level, skills(id, name, category)')
                .eq('role_id', roleIdToCheck)

            // Fetch latest assessments
            const { data: assessments } = await supabase
                .from('skill_assessments')
                .select('skill_id, self_rating')
                .eq('user_id', user.id)
                .eq('role_id', roleIdToCheck)
                .order('created_at', { ascending: false })

            // Check pass condition
            let allPassed = true
            let hasAssessment = false

            if (!assessments || assessments.length === 0) {
                allPassed = false
                hasAssessment = false
            } else {
                hasAssessment = true
                // Check each required skill
                roleSkills.forEach(rs => {
                    // Find latest rating for this skill
                    // Note: assessments array might contain duplicates if we fetch all history.
                    // But we ordered by created_at desc.
                    // We should probably filter unique skill_ids first or just find first match.
                    const userRating = assessments.find(a => a.skill_id === rs.skill_id)

                    if (!userRating || userRating.self_rating < rs.required_level) {
                        allPassed = false
                    }
                })
            }

            if (!allPassed) {
                setIsLocked(true)
                setLockReason('assessment_needed')
                setLoading(false)
                return
            }

            // 5. If passed, show tests for these skills
            const skillsWithTests = await Promise.all(roleSkills.map(async (rs) => {
                const { count } = await supabase
                    .from('questions')
                    .select('*', { count: 'exact', head: true })
                    .eq('skill_id', rs.skill_id)

                return {
                    ...rs.skills,
                    questionCount: count
                }
            }))

            setSkills(skillsWithTests.filter(s => s.questionCount > 0))

        } catch (error) {
            console.error('Error fetching tests:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    )

    if (isLocked) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Available Tests</h1>
                    <p className="mt-2 text-gray-600">Complete skill tests to verify your expertise for the next role.</p>
                </div>

                {lockReason === 'learning_active' && (
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-8 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 mb-4">
                            <Lock className="h-8 w-8 text-amber-600" aria-hidden="true" />
                        </div>
                        <h3 className="text-xl font-bold text-amber-900 mb-2">Tests Locked</h3>
                        <p className="text-amber-700 max-w-lg mx-auto mb-6">
                            You have an active learning path in progress. You must complete your learning materials before you can take the skill tests.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/employee/learning')}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
                        >
                            Go to Learning Path
                        </button>
                    </div>
                )}

                {lockReason === 'assessment_needed' && (
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
                            <AlertCircle className="h-8 w-8 text-blue-600" aria-hidden="true" />
                        </div>
                        <h3 className="text-xl font-bold text-blue-900 mb-2">Tests Locked</h3>
                        <p className="text-blue-700 max-w-lg mx-auto mb-6">
                            You must pass the Skill Assessment for your next role before you can take these tests.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/employee/assessment')}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Go to Skill Assessment
                        </button>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Available Tests</h1>
                <p className="mt-2 text-gray-600">Select a skill test to demonstrate your proficiency.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {skills.map(skill => (
                    <div key={skill.id} className="group bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 p-6 hover:shadow-md hover:ring-blue-500/20 transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${skill.category === 'technical' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                                }`}>
                                <PlayCircle className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                                {skill.questionCount} Questions
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{skill.name}</h3>
                        <p className="text-sm text-gray-500 capitalize mb-6">{skill.category}</p>

                        <button
                            onClick={() => navigate(`/employee/tests/${skill.id}`)}
                            className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-semibold rounded-xl text-white bg-gray-900 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all"
                        >
                            Start Test <PlayCircle className="ml-2 h-4 w-4" />
                        </button>
                    </div>
                ))}

                {skills.length === 0 && (
                    <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
                            <AlertCircle className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No tests available</h3>
                        <p className="text-gray-500 mt-2">There are no tests available for your current role requirements yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
