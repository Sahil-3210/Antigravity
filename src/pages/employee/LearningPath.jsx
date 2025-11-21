import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { ExternalLink, CheckSquare, Square, CheckCircle, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function LearningPath() {
    const { user } = useAuth()
    const [learningPath, setLearningPath] = useState([])
    const [loading, setLoading] = useState(true)
    const [allCompleted, setAllCompleted] = useState(false)
    const [pathStatus, setPathStatus] = useState('active')
    const navigate = useNavigate()

    useEffect(() => {
        if (user) {
            fetchLearningPath()
        }
    }, [user])

    const fetchLearningPath = async () => {
        try {
            // Check for active path first
            const { data, error } = await supabase
                .from('learning_paths')
                .select('*, skills(name)')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .order('created_at', { ascending: true })

            if (error) throw error

            if (data && data.length > 0) {
                setLearningPath(data)
                setPathStatus('active')
                setAllCompleted(data.every(item => item.completed))
            } else {
                // If no active path, check if we have a completed one recently? 
                // Or just show empty.
                setLearningPath([])
                setPathStatus('none')
            }

        } catch (error) {
            console.error('Error fetching learning path:', error)
            toast.error('Failed to load learning path.')
        } finally {
            setLoading(false)
        }
    }

    const toggleItemCompletion = async (id, currentStatus) => {
        try {
            const { error } = await supabase
                .from('learning_paths')
                .update({ completed: !currentStatus })
                .eq('id', id)

            if (error) throw error

            const updatedPath = learningPath.map(item =>
                item.id === id ? { ...item, completed: !currentStatus } : item
            )
            setLearningPath(updatedPath)
            setAllCompleted(updatedPath.every(item => item.completed))

        } catch (error) {
            console.error('Error updating item:', error)
            toast.error('Failed to update item.')
        }
    }

    const completeLearningPath = async () => {
        if (!confirm('Are you sure you have completed all learning materials? This will unlock your assessment.')) return

        try {
            // Update status of ALL items to 'completed' (or just the active ones)
            // We use the status column to mark the "Path" as done.
            const ids = learningPath.map(p => p.id)

            const { error } = await supabase
                .from('learning_paths')
                .update({ status: 'completed', completed_at: new Date() })
                .in('id', ids)

            if (error) throw error

            toast.success('Learning Path Completed! Assessment Unlocked.')
            setPathStatus('completed')

            // Redirect to assessment after a short delay
            setTimeout(() => {
                navigate('/employee/skills')
            }, 1500)

        } catch (error) {
            console.error('Error completing path:', error)
            toast.error('Failed to complete learning path.')
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
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Learning Path</h1>
                <p className="mt-2 text-gray-600">
                    Complete these resources to improve your skills and prepare for the assessment test.
                </p>
            </div>

            {learningPath.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                        <BookOpen className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No learning items assigned</h3>
                    <p className="text-gray-500 mt-2">Complete a skill assessment to generate your personalized path.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {pathStatus === 'completed' && (
                        <div className="rounded-2xl bg-emerald-50 p-6 border border-emerald-100">
                            <div className="flex">
                                <div className="shrink-0">
                                    <CheckCircle className="h-8 w-8 text-emerald-500" aria-hidden="true" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-bold text-emerald-900">Learning Path Completed!</h3>
                                    <div className="mt-2 text-emerald-700">
                                        <p>Great job! You have completed all assigned learning materials. You are now ready to retake the skill assessment.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-2xl overflow-hidden">
                        <ul className="divide-y divide-gray-100">
                            {learningPath.map((item) => (
                                <li key={item.id} className={`transition-colors ${item.completed ? 'bg-gray-50/50' : 'hover:bg-gray-50'}`}>
                                    <div className="px-6 py-6 flex items-center">
                                        <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between gap-4">
                                            <div className="truncate">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {item.skills?.name || 'Skill'}
                                                    </span>
                                                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Resource</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <a
                                                        href={item.resource_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`text-lg font-semibold flex items-center group ${item.completed ? 'text-gray-500 line-through decoration-gray-300' : 'text-gray-900 hover:text-blue-600'
                                                            }`}
                                                    >
                                                        {item.resource_title}
                                                        <ExternalLink className="shrink-0 ml-2 h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-6 shrink-0">
                                            <button
                                                onClick={() => toggleItemCompletion(item.id, item.completed)}
                                                disabled={pathStatus === 'completed'}
                                                className={`flex items-center px-4 py-2 border text-sm font-medium rounded-xl transition-all ${item.completed
                                                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm'
                                                    } ${pathStatus === 'completed' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {item.completed ? (
                                                    <>
                                                        <CheckSquare className="mr-2 h-4 w-4" />
                                                        Completed
                                                    </>
                                                ) : (
                                                    <>
                                                        <Square className="mr-2 h-4 w-4" />
                                                        Mark as Done
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {pathStatus === 'active' && (
                        <div className="flex justify-end">
                            <button
                                onClick={completeLearningPath}
                                disabled={!allCompleted}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
                            >
                                <CheckCircle className="mr-2 h-5 w-5" />
                                Complete Learning Path & Unlock Assessment
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
