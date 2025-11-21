import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Save, Lock, CheckCircle, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SkillAssessment() {
    const { user } = useAuth()
    const [currentRole, setCurrentRole] = useState(null)
    const [targetRole, setTargetRole] = useState(null)
    const [skills, setSkills] = useState([])
    const [ratings, setRatings] = useState({})
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    // States for workflow control
    const [assessmentStatus, setAssessmentStatus] = useState('none') // 'none', 'passed', 'failed'
    const [learningStatus, setLearningStatus] = useState('none') // 'none', 'active', 'completed'
    const [isLocked, setIsLocked] = useState(false)
    const [lockReason, setLockReason] = useState('')

    const navigate = useNavigate()

    useEffect(() => {
        if (user) {
            fetchData()
        }
    }, [user])

    const fetchData = async () => {
        try {
            // 1. Get current active role
            const { data: roleData, error: roleError } = await supabase
                .from('employee_roles')
                .select('role_id, job_roles(id, title, level)')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .single()

            if (roleError) throw roleError
            setCurrentRole(roleData.job_roles)

            // 2. Determine Next Role
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

            if (!targetRoleData) {
                setLoading(false)
                return
            }

            setTargetRole(targetRoleData)

            // 3. Get skills for the TARGET role
            const { data: skillsData, error: skillsError } = await supabase
                .from('role_skills')
                .select('required_level, skills(id, name, category)')
                .eq('role_id', targetRoleData.id)

            if (skillsError) throw skillsError

            const formattedSkills = skillsData.map(item => ({
                id: item.skills.id,
                name: item.skills.name,
                category: item.skills.category,
                required_level: item.required_level
            }))
            setSkills(formattedSkills)

            // 4. Check Latest Assessment Status
            const { data: latestAssessment } = await supabase
                .from('skill_assessments')
                .select('skill_id, self_rating, created_at')
                .eq('user_id', user.id)
                .eq('role_id', targetRoleData.id)
                .order('created_at', { ascending: false })

            // Determine if passed or failed
            let currentStatus = 'none'
            const initialRatings = {}

            // Pre-fill with default 1
            formattedSkills.forEach(s => initialRatings[s.id] = 1)

            if (latestAssessment && latestAssessment.length > 0) {
                // Get the most recent batch (assuming created_at is close enough or just take latest per skill)
                // Actually, we should filter by the latest "submission batch". 
                // For simplicity, we map the latest rating for each skill.

                let allPassed = true
                let hasAnyRating = false

                formattedSkills.forEach(skill => {
                    const ratingObj = latestAssessment.find(a => a.skill_id === skill.id)
                    if (ratingObj) {
                        hasAnyRating = true
                        initialRatings[skill.id] = ratingObj.self_rating
                        if (ratingObj.self_rating < skill.required_level) {
                            allPassed = false
                        }
                    } else {
                        // If a skill is missing from assessment, treat as fail/unrated
                        allPassed = false
                    }
                })

                if (hasAnyRating) {
                    currentStatus = allPassed ? 'passed' : 'failed'
                }
            }

            setRatings(initialRatings)
            setAssessmentStatus(currentStatus)

            // 5. Check Learning Path Status
            const { data: learningPaths } = await supabase
                .from('learning_paths')
                .select('status')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false }) // Get latest

            // Determine overall learning status
            // If ANY active path exists -> 'active'
            // If NO active path but we have completed paths from the LATEST batch -> 'completed'
            // This is a bit tricky. Let's look for ANY 'active' first.
            const hasActive = learningPaths?.some(p => p.status === 'active')

            let lStatus = 'none'
            if (hasActive) {
                lStatus = 'active'
            } else if (learningPaths && learningPaths.length > 0 && learningPaths[0].status === 'completed') {
                // Assuming the latest one represents the current state
                lStatus = 'completed'
            }
            setLearningStatus(lStatus)

            // 6. Determine Locking Logic
            if (currentStatus === 'passed') {
                setIsLocked(true)
                setLockReason('passed')
            } else if (currentStatus === 'failed') {
                if (lStatus === 'active') {
                    setIsLocked(true)
                    setLockReason('learning_active')
                } else if (lStatus === 'completed') {
                    setIsLocked(false) // Unlocked for retake!
                } else {
                    // Failed but no learning path? Should not happen if logic works, 
                    // but maybe they failed before we added learning paths.
                    // Let's allow retake or force generation?
                    // For now, allow retake.
                    setIsLocked(false)
                }
            } else {
                // No assessment yet
                setIsLocked(false)
            }

        } catch (error) {
            console.error('Error fetching data:', error)
            toast.error('Error loading assessment.')
        } finally {
            setLoading(false)
        }
    }

    const handleRatingChange = (skillId, value) => {
        if (isLocked) return
        setRatings(prev => ({
            ...prev,
            [skillId]: parseInt(value)
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const assessments = Object.entries(ratings).map(([skillId, rating]) => ({
                user_id: user.id,
                role_id: targetRole.id,
                skill_id: skillId,
                self_rating: rating
            }))

            const { error } = await supabase
                .from('skill_assessments')
                .insert(assessments)

            if (error) throw error

            toast.success('Assessment submitted successfully!')
            navigate('/employee/results')

        } catch (error) {
            console.error('Error submitting assessment:', error)
            toast.error('Failed to submit assessment.')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    )

    if (!targetRole) {
        return (
            <div className="max-w-4xl mx-auto p-12 text-center bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-6">
                    <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">No Next Role Found</h1>
                <p className="mt-4 text-gray-600 max-w-lg mx-auto">
                    You are currently at the highest level ({currentRole?.title}) or the next career step hasn't been defined yet.
                </p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Skill Assessment</h1>
                <p className="mt-2 text-gray-600 flex items-center gap-2">
                    Target Role: <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{targetRole.title}</span>
                </p>

                {/* Status Messages */}
                {lockReason === 'passed' && (
                    <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-xl p-6">
                        <div className="flex">
                            <CheckCircle className="h-6 w-6 text-emerald-500 shrink-0" />
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-emerald-800">Assessment Passed!</h3>
                                <p className="mt-1 text-emerald-700">
                                    You have successfully passed this assessment. You can now proceed to take the Skill Tests to verify your expertise.
                                </p>
                                <button onClick={() => navigate('/employee/tests')} className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors">
                                    Go to Tests <span aria-hidden="true" className="ml-1">&rarr;</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {lockReason === 'learning_active' && (
                    <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-6">
                        <div className="flex">
                            <Lock className="h-6 w-6 text-amber-500 shrink-0" />
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-amber-800">Assessment Locked</h3>
                                <p className="mt-1 text-amber-700">
                                    You have an active learning path assigned based on your previous results. Please complete the learning materials to unlock a retake.
                                </p>
                                <button onClick={() => navigate('/employee/learning')} className="mt-4 inline-flex items-center text-sm font-semibold text-amber-700 hover:text-amber-800 transition-colors">
                                    Go to Learning Path <span aria-hidden="true" className="ml-1">&rarr;</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-2xl overflow-hidden">
                    <div className="p-8 space-y-8">
                        {skills.map(skill => (
                            <div key={skill.id} className="border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-gray-900">{skill.name}</h3>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${skill.category === 'technical' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                {skill.category}
                                            </span>
                                        </div>
                                        {/* Target level hidden to prevent gaming the system */}
                                    </div>

                                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    disabled={isLocked}
                                                    onClick={() => handleRatingChange(skill.id, star)}
                                                    className={`p-1.5 rounded-lg focus:outline-none transition-all transform active:scale-95 ${ratings[skill.id] >= star
                                                        ? 'text-yellow-400 hover:text-yellow-500'
                                                        : 'text-gray-300 hover:text-gray-400'
                                                        } ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
                                                >
                                                    <svg className="w-8 h-8 fill-current drop-shadow-sm" viewBox="0 0 24 24">
                                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                                    </svg>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="w-12 text-center">
                                            <span className="text-xl font-bold text-gray-900 block">
                                                {ratings[skill.id]}
                                            </span>
                                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">/ 5</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {!isLocked && (
                        <div className="bg-gray-50 px-8 py-6 flex justify-end border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Save className="mr-2 h-5 w-5" />
                                {submitting ? 'Submitting...' : 'Submit Assessment'}
                            </button>
                        </div>
                    )}
                </div>
            </form>
        </div>
    )
}
