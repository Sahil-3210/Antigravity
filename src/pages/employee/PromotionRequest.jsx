import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Send, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export default function PromotionRequest() {
    const { user } = useAuth()
    const [currentRole, setCurrentRole] = useState(null)
    const [availableRoles, setAvailableRoles] = useState([])
    const [pendingRequest, setPendingRequest] = useState(null)
    const [selectedRole, setSelectedRole] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [eligibility, setEligibility] = useState({
        eligible: false,
        passedCount: 0,
        totalCount: 0,
        skills: []
    })

    useEffect(() => {
        if (user) {
            fetchData()
        }
    }, [user])

    const fetchData = async () => {
        try {
            // 1. Get current role
            const { data: roleData } = await supabase
                .from('employee_roles')
                .select('role_id, job_roles(*)')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .single()

            if (roleData) {
                setCurrentRole(roleData.job_roles)

                // 1.1 Get required skills for this role
                const { data: roleSkills } = await supabase
                    .from('role_skills')
                    .select('skill_id, skills(id, name)')
                    .eq('role_id', roleData.role_id)

                // 1.2 Get passed tests for this user
                const { data: passedTests } = await supabase
                    .from('test_attempts')
                    .select('skill_id')
                    .eq('user_id', user.id)
                    .eq('passed', true)

                const passedSkillIds = new Set(passedTests?.map(t => t.skill_id))

                // 1.3 Check which skills actually have questions (are testable)
                const skillsWithQuestions = await Promise.all(roleSkills.map(async (rs) => {
                    const { count } = await supabase
                        .from('questions')
                        .select('*', { count: 'exact', head: true })
                        .eq('skill_id', rs.skill_id)

                    return {
                        ...rs,
                        hasQuestions: count > 0
                    }
                }))

                // Filter to only testable skills
                const testableSkills = skillsWithQuestions.filter(s => s.hasQuestions)

                const skillsStatus = testableSkills.map(rs => ({
                    id: rs.skills.id,
                    name: rs.skills.name,
                    passed: passedSkillIds.has(rs.skill_id)
                }))

                const passedCount = skillsStatus.filter(s => s.passed).length
                const totalCount = skillsStatus.length

                setEligibility({
                    eligible: totalCount > 0 && passedCount === totalCount,
                    passedCount,
                    totalCount,
                    skills: skillsStatus
                })
            }

            // 2. Get pending requests
            const { data: requestData } = await supabase
                .from('promotion_requests')
                .select('*, job_roles!requested_role_id(title)')
                .eq('user_id', user.id)
                .order('requested_at', { ascending: false })
                .limit(1)
                .single()

            if (requestData) {
                setPendingRequest(requestData)
            }

            // 3. Get all potential roles
            const { data: allRoles } = await supabase
                .from('job_roles')
                .select('*')
                .neq('id', roleData?.role_id)
                .order('title')

            setAvailableRoles(allRoles || [])

        } catch (error) {
            if (error.code !== 'PGRST116') {
                console.error('Error fetching data:', error)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!selectedRole) return

        setSubmitting(true)
        try {
            const { error } = await supabase
                .from('promotion_requests')
                .insert({
                    user_id: user.id,
                    current_role_id: currentRole.id,
                    requested_role_id: selectedRole
                })

            if (error) throw error

            alert('Promotion request submitted successfully!')
            fetchData()
            setSelectedRole('')

        } catch (error) {
            console.error('Error submitting request:', error)
            alert('Failed to submit request.')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    )

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Promotion Request</h1>
                <p className="mt-2 text-gray-600">Track your eligibility and submit requests for career advancement.</p>
            </div>

            {/* Current Status */}
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-2xl overflow-hidden mb-8">
                <div className="px-8 py-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Current Role Status</h2>
                </div>
                <div className="p-8">
                    {currentRole ? (
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{currentRole.title}</p>
                                    <p className="text-gray-500 mt-1 capitalize font-medium flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                                        Level: {currentRole.level}
                                    </p>
                                </div>
                                <div className={`px-4 py-2 rounded-xl text-sm font-bold ${eligibility.eligible
                                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                                        : 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                                    }`}>
                                    {eligibility.eligible ? 'Eligible for Promotion' : 'Not Yet Eligible'}
                                </div>
                            </div>

                            {/* Eligibility Checklist */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Promotion Criteria</h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    You must pass the skill tests for all <strong>testable</strong> skills in your current role to be eligible.
                                </p>
                                <div className="space-y-3">
                                    {eligibility.skills.map(skill => (
                                        <div key={skill.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                            <span className={`font-medium ${skill.passed ? 'text-gray-900' : 'text-gray-500'}`}>
                                                {skill.name} Assessment
                                            </span>
                                            {skill.passed ? (
                                                <div className="flex items-center text-emerald-600 text-sm font-bold">
                                                    <CheckCircle className="h-5 w-5 mr-2" />
                                                    PASSED
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-gray-400 text-sm">
                                                    <div className="h-4 w-4 rounded-full border-2 border-gray-300 mr-2" />
                                                    PENDING
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {eligibility.skills.length === 0 && (
                                        <p className="text-sm text-gray-500 italic text-center py-4">No testable skills assigned to this role yet.</p>
                                    )}
                                </div>
                                <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                                    <span className="text-sm text-gray-500 font-medium">Progress</span>
                                    <span className="text-sm font-bold text-gray-900">
                                        {eligibility.passedCount} / {eligibility.totalCount} Completed
                                    </span>
                                </div>
                                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${eligibility.totalCount > 0 ? (eligibility.passedCount / eligibility.totalCount) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No active role assigned.</p>
                    )}
                </div>
            </div>

            {/* Pending Request Status */}
            {pendingRequest && (
                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-2xl overflow-hidden mb-8">
                    <div className="bg-amber-50/50 px-8 py-6 border-b border-amber-100 flex items-center gap-3">
                        <Clock className="h-6 w-6 text-amber-600" />
                        <h2 className="text-lg font-bold text-amber-900">Active Request</h2>
                    </div>
                    <div className="p-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">Requested Role</p>
                                <p className="text-xl font-bold text-gray-900">{pendingRequest.job_roles.title}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">Status</p>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold capitalize ${pendingRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        pendingRequest.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'
                                    }`}>
                                    {pendingRequest.status}
                                </span>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-100 text-sm text-gray-500 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Submitted on {new Date(pendingRequest.requested_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            )}

            {/* New Request Form */}
            {(!pendingRequest || pendingRequest.status !== 'pending') && (
                <div className={`bg-white shadow-sm ring-1 ring-gray-900/5 rounded-2xl overflow-hidden transition-opacity ${!eligibility.eligible ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                    <div className="px-8 py-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Submit Promotion Request</h2>
                    </div>
                    <div className="p-8">
                        {!eligibility.eligible && (
                            <div className="mb-6 p-4 bg-amber-50 text-amber-800 text-sm font-medium rounded-xl flex items-start border border-amber-100">
                                <AlertTriangle className="h-5 w-5 mr-3 shrink-0 text-amber-600" />
                                You must pass all available skill tests for your current role before you can request a promotion.
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Select Desired Role
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 pl-4 pr-10 text-base disabled:bg-gray-50 disabled:text-gray-500"
                                        required
                                        disabled={!eligibility.eligible}
                                    >
                                        <option value="">-- Select a role --</option>
                                        {availableRoles.map(role => (
                                            <option key={role.id} value={role.id}>
                                                {role.title} ({role.level})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={submitting || !selectedRole || !eligibility.eligible}
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                                >
                                    <Send className="mr-2 h-5 w-5" />
                                    {submitting ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
