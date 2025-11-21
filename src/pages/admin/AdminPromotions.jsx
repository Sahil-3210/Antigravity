import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Check, X, Clock, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminPromotions() {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(null)
    const [expandedRequest, setExpandedRequest] = useState(null)
    const [reviewData, setReviewData] = useState(null)
    const [loadingReview, setLoadingReview] = useState(false)

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        try {
            console.log('Fetching promotion requests...')
            const { data, error } = await supabase
                .from('promotion_requests')
                .select(`
          *,
          users:users!user_id (full_name, email),
          current_role: job_roles!current_role_id (title),
          requested_role: job_roles!requested_role_id (title)
        `)
                .eq('status', 'pending') // Re-enabled filter now that query is fixed
                .order('requested_at', { ascending: false })

            if (error) {
                console.error('Supabase fetch error:', error)
                toast.error(`Error loading requests: ${error.message}`)
                throw error
            }

            console.log('Fetched promotion requests:', data)
            setRequests(data)
        } catch (error) {
            console.error('Error fetching requests:', error)
            // toast.error('Failed to load promotion requests.') // Already toasted above
        } finally {
            setLoading(false)
        }
    }

    const fetchReviewData = async (request) => {
        setLoadingReview(true)
        setReviewData(null)
        try {
            // 1. Get required skills for the CURRENT role
            const { data: roleSkills, error: skillsError } = await supabase
                .from('role_skills')
                .select('skill_id, required_level, skills(id, name, category)')
                .eq('role_id', request.current_role_id)

            if (skillsError) throw skillsError

            // 2. Get test attempts for this user for these skills
            const { data: attempts, error: attemptsError } = await supabase
                .from('test_attempts')
                .select('*')
                .eq('user_id', request.user_id)
                .in('skill_id', roleSkills.map(rs => rs.skill_id))

            if (attemptsError) throw attemptsError

            // 3. Merge data
            const mergedData = roleSkills.map(rs => {
                const attempt = attempts.find(a => a.skill_id === rs.skill_id && a.passed)
                // Find best score if multiple attempts (though logic usually locks after pass)
                const bestAttempt = attempts
                    .filter(a => a.skill_id === rs.skill_id)
                    .sort((a, b) => b.score - a.score)[0]

                return {
                    skillId: rs.skill_id,
                    skillName: rs.skills.name,
                    category: rs.skills.category,
                    requiredLevel: rs.required_level,
                    passed: !!attempt,
                    score: bestAttempt ? bestAttempt.score : null,
                    lastAttemptDate: bestAttempt ? bestAttempt.completed_at : null
                }
            })

            setReviewData(mergedData)

        } catch (error) {
            console.error('Error fetching review data:', error)
            toast.error('Failed to load review details.')
        } finally {
            setLoadingReview(false)
        }
    }

    const toggleExpand = (request) => {
        if (expandedRequest === request.id) {
            setExpandedRequest(null)
            setReviewData(null)
        } else {
            setExpandedRequest(request.id)
            fetchReviewData(request)
        }
    }

    const handleAction = async (requestId, userId, newRoleId, action) => {
        setProcessing(requestId)
        try {
            if (action === 'approve') {
                // 1. Update request status
                const { error: reqError } = await supabase
                    .from('promotion_requests')
                    .update({ status: 'approved', reviewed_at: new Date() })
                    .eq('id', requestId)

                if (reqError) throw reqError

                // 2. Deactivate old role
                await supabase
                    .from('employee_roles')
                    .update({ status: 'completed' })
                    .eq('user_id', userId)
                    .eq('status', 'active')

                // 3. Assign new role
                const { error: roleError } = await supabase
                    .from('employee_roles')
                    .insert({
                        user_id: userId,
                        role_id: newRoleId,
                        status: 'active'
                    })

                if (roleError) throw roleError

                toast.success('Promotion approved successfully!')
            } else {
                // Reject
                const { error } = await supabase
                    .from('promotion_requests')
                    .update({ status: 'rejected', reviewed_at: new Date() })
                    .eq('id', requestId)

                if (error) throw error
                toast.success('Promotion rejected.')
            }

            // Refresh list and close expand
            setExpandedRequest(null)
            fetchRequests()

        } catch (error) {
            console.error('Error processing request:', error)
            toast.error('Failed to process request.')
        } finally {
            setProcessing(null)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    )

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Promotion Requests</h1>
                <p className="mt-2 text-gray-600">Review and manage employee promotion requests.</p>
            </div>

            {requests.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 p-12 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                        <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">All caught up!</h3>
                    <p className="mt-2 text-gray-500">There are no pending promotion requests at this time.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => (
                        <div key={request.id} className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-2xl overflow-hidden transition-all hover:shadow-md">
                            <div className="px-6 py-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <p className="text-lg font-bold text-gray-900 truncate">
                                                {request.users.full_name || request.users.email}
                                            </p>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                Pending Review
                                            </span>
                                        </div>
                                        <div className="mt-1 flex items-center text-sm text-gray-500">
                                            <Clock className="shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                            <p>Requested on {new Date(request.requested_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <span>Current:</span>
                                                <span className="font-semibold text-gray-900">{request.current_role.title}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                <span>Target:</span>
                                                <span className="font-semibold text-blue-600">{request.requested_role.title}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleExpand(request)}
                                            className="inline-flex items-center px-4 py-2 border border-gray-200 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                                        >
                                            {expandedRequest === request.id ? 'Hide Details' : 'Review Request'}
                                            {expandedRequest === request.id ? (
                                                <ChevronUp className="ml-2 h-4 w-4" />
                                            ) : (
                                                <ChevronDown className="ml-2 h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Review Section */}
                            {expandedRequest === request.id && (
                                <div className="bg-gray-50/50 px-6 py-6 border-t border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                                        Performance Review
                                    </h3>

                                    {loadingReview ? (
                                        <div className="text-center py-8 text-gray-500 flex flex-col items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                            Loading performance data...
                                        </div>
                                    ) : reviewData ? (
                                        <div className="space-y-6">
                                            {/* Skills Table */}
                                            <div className="overflow-hidden shadow-sm ring-1 ring-gray-900/5 rounded-xl bg-white">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider sm:pl-6">Skill</th>
                                                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                                                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Attempt</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 bg-white">
                                                        {reviewData.map((item) => (
                                                            <tr key={item.skillId}>
                                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                                    {item.skillName}
                                                                </td>
                                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                                    {item.passed ? (
                                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                            Passed
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                            Not Passed
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                                    {item.score !== null ? <span className="font-mono font-medium">{item.score}%</span> : '-'}
                                                                </td>
                                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                                    {item.lastAttemptDate ? new Date(item.lastAttemptDate).toLocaleDateString() : '-'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Summary & Actions */}
                                            <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm ring-1 ring-gray-900/5">
                                                <div className="flex items-center">
                                                    {reviewData.every(r => r.passed) ? (
                                                        <div className="flex items-center text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">
                                                            <Check className="h-5 w-5 mr-2" />
                                                            <span className="font-semibold">All requirements met. Eligible for promotion.</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-100">
                                                            <AlertCircle className="h-5 w-5 mr-2" />
                                                            <span className="font-semibold">Warning: Not all skills have been passed.</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex space-x-3">
                                                    <button
                                                        onClick={() => handleAction(request.id, request.user_id, request.requested_role_id, 'reject')}
                                                        disabled={processing === request.id}
                                                        className="inline-flex items-center px-4 py-2 border border-gray-200 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                                                    >
                                                        <X className="mr-2 h-4 w-4" />
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(request.id, request.user_id, request.requested_role_id, 'approve')}
                                                        disabled={processing === request.id}
                                                        className="inline-flex items-center px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                                                    >
                                                        <Check className="mr-2 h-4 w-4" />
                                                        Approve Promotion
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-red-500 bg-red-50 p-4 rounded-lg border border-red-100">Failed to load performance data.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
