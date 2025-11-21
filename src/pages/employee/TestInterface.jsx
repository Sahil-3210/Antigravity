import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { CheckCircle, XCircle, AlertCircle, Clock, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

// Fisher-Yates Shuffle
function shuffleArray(array) {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray
}

export default function TestInterface() {
    const { skillId } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()

    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [answers, setAnswers] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [result, setResult] = useState(null)

    // New states for integrity
    const [status, setStatus] = useState('loading') // loading, ready, passed, cooldown
    const [cooldownTime, setCooldownTime] = useState(null)

    useEffect(() => {
        if (skillId && user) {
            checkEligibilityAndFetch()
        }
    }, [skillId, user])

    const checkEligibilityAndFetch = async () => {
        try {
            // 1. Get current role first
            const { data: roleData, error: roleError } = await supabase
                .from('employee_roles')
                .select('role_id')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .single()

            if (roleError || !roleData) {
                console.error('Error fetching role:', roleError)
                toast.error('Could not verify current role.')
                navigate('/employee/tests')
                return
            }

            // 2. Check previous attempts FOR THIS ROLE
            const { data: attempts } = await supabase
                .from('test_attempts')
                .select('*')
                .eq('user_id', user.id)
                .eq('skill_id', skillId)
                .eq('role_id', roleData.role_id) // Only check attempts for the current role
                .order('attempt_date', { ascending: false })

            // Check if already passed
            const passedAttempt = attempts?.find(a => a.passed)
            if (passedAttempt) {
                setStatus('passed')
                setResult({
                    score: passedAttempt.score,
                    passed: true,
                    date: passedAttempt.attempt_date
                })
                setLoading(false)
                return
            }

            // Check for cooldown (last failed attempt < 24 hours)
            const lastAttempt = attempts?.[0]
            if (lastAttempt) {
                const lastAttemptTime = new Date(lastAttempt.attempt_date).getTime()
                const now = new Date().getTime()
                const hoursSinceLast = (now - lastAttemptTime) / (1000 * 60 * 60)

                if (hoursSinceLast < 24) {
                    setStatus('cooldown')
                    setCooldownTime(new Date(lastAttemptTime + 24 * 60 * 60 * 1000))
                    setLoading(false)
                    return
                }
            }

            // 2. Fetch questions if eligible
            const { data: questionsData, error: qError } = await supabase
                .from('questions')
                .select(`
                    id, 
                    question_text, 
                    difficulty,
                    question_options (id, option_text, is_correct)
                `)
                .eq('skill_id', skillId)

            if (qError) throw qError

            if (!questionsData || questionsData.length === 0) {
                toast.error('No questions found for this skill.')
                navigate('/employee/tests')
                return
            }

            // 3. Randomize Questions and Options
            const shuffledQuestions = shuffleArray(questionsData).map(q => ({
                ...q,
                question_options: shuffleArray(q.question_options)
            }))

            setQuestions(shuffledQuestions)
            setStatus('ready')

        } catch (error) {
            console.error('Error fetching test:', error)
            toast.error('Failed to load test.')
            navigate('/employee/tests')
        } finally {
            setLoading(false)
        }
    }

    const handleOptionSelect = (questionId, optionId) => {
        console.log('Option selected:', { questionId, optionId })
        if (!questionId || !optionId) {
            console.error('Invalid selection:', { questionId, optionId })
            return
        }
        setAnswers(prev => {
            const newState = {
                ...prev,
                [questionId]: optionId
            }
            console.log('New answers state:', newState)
            return newState
        })
    }

    const handleSubmit = async () => {
        console.log('Submitting test...', { answersCount: Object.keys(answers).length, questionsCount: questions.length })

        if (Object.keys(answers).length < questions.length) {
            toast.error(`Please answer all ${questions.length} questions before submitting.`)
            return
        }

        setSubmitting(true)

        try {
            // Calculate score
            let correctCount = 0
            questions.forEach(q => {
                const selectedOptionId = answers[q.id]
                const correctOption = q.question_options.find(o => o.is_correct)
                if (correctOption && correctOption.id === selectedOptionId) {
                    correctCount++
                }
            })

            const scorePercentage = (correctCount / questions.length) * 100
            const passed = scorePercentage >= 70 // 70% passing score

            console.log('Score calculated:', { correctCount, scorePercentage, passed })

            // Get current role ID for the record
            const { data: roleData, error: roleError } = await supabase
                .from('employee_roles')
                .select('role_id')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .single()

            if (roleError) {
                console.error('Error fetching role for submission:', roleError)
                // Proceeding without role_id might be okay depending on schema, but let's log it.
            }

            // Save attempt
            const attemptData = {
                user_id: user.id,
                skill_id: skillId,
                role_id: roleData?.role_id,
                score: Math.round(scorePercentage),
                passed: passed
            }

            console.log('Inserting attempt:', attemptData)

            const { error } = await supabase
                .from('test_attempts')
                .insert(attemptData)

            if (error) {
                console.error('Supabase insert error:', error)
                throw error
            }

            setResult({
                score: Math.round(scorePercentage),
                passed,
                correctCount,
                total: questions.length
            })

            if (passed) {
                toast.success('Congratulations! You passed the test.')
                setStatus('passed')
            } else {
                toast.error('Test failed. You can retry in 24 hours.')
                setStatus('cooldown')
                // Set cooldown for UI immediately
                setCooldownTime(new Date(new Date().getTime() + 24 * 60 * 60 * 1000))
            }

        } catch (error) {
            console.error('Error submitting test:', error)
            toast.error('Failed to submit test. Check console for details.')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    )

    // --- VIEW: ALREADY PASSED ---
    if (status === 'passed') {
        return (
            <div className="max-w-2xl mx-auto mt-12 bg-white p-12 rounded-3xl shadow-sm ring-1 ring-gray-900/5 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 mb-6">
                    <CheckCircle className="h-10 w-10 text-emerald-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Skill Verified!</h2>
                <p className="text-gray-600 mb-8 text-lg">
                    You have already passed this assessment with a score of <span className="font-bold text-emerald-600">{result?.score}%</span>.
                </p>
                <button
                    onClick={() => navigate('/employee/tests')}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                >
                    Back to Tests
                </button>
            </div>
        )
    }

    // --- VIEW: COOLDOWN ---
    if (status === 'cooldown') {
        return (
            <div className="max-w-2xl mx-auto mt-12 bg-white p-12 rounded-3xl shadow-sm ring-1 ring-gray-900/5 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 mb-6">
                    <Clock className="h-10 w-10 text-amber-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Cooldown Active</h2>
                <p className="text-gray-600 mb-2 text-lg">
                    You recently attempted this test and did not pass.
                </p>
                <div className="bg-amber-50 rounded-xl p-6 my-8 border border-amber-100">
                    <p className="text-sm text-amber-800 font-medium mb-2">NEXT ATTEMPT AVAILABLE AT</p>
                    <p className="text-2xl font-bold text-amber-900 font-mono">
                        {cooldownTime?.toLocaleString()}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/employee/learning')}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                >
                    Go to Learning Path
                </button>
            </div>
        )
    }

    // --- VIEW: TEST RESULT (Immediate Feedback) ---
    if (result && !result.passed) {
        return (
            <div className="max-w-2xl mx-auto mt-12 bg-white p-12 rounded-3xl shadow-sm ring-1 ring-gray-900/5 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 mb-6">
                    <XCircle className="h-10 w-10 text-rose-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Test Failed</h2>
                <p className="text-xl text-gray-600 mb-8">
                    You scored <span className="font-bold text-rose-600">{result.score}%</span> ({result.correctCount}/{result.total}).
                    <br />
                    <span className="text-sm text-gray-500 font-medium mt-2 block">Required Score: 70%</span>
                </p>
                <div className="bg-amber-50 p-6 rounded-xl mb-8 border border-amber-100 text-left flex gap-4">
                    <Clock className="h-6 w-6 text-amber-600 shrink-0" />
                    <div>
                        <h4 className="font-bold text-amber-900">Cooldown Period Started</h4>
                        <p className="text-amber-800 text-sm mt-1">
                            You must wait 24 hours before retaking this test. We recommend reviewing the learning materials during this time.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/employee/tests')}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                >
                    Back to Tests
                </button>
            </div>
        )
    }

    // --- VIEW: TAKING TEST ---
    return (
        <div className="max-w-3xl mx-auto" data-gramm="false">
            <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm ring-1 ring-gray-900/5 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Skill Assessment Test</h1>
                    <div className="flex items-center mt-1 text-sm text-gray-500 font-medium">
                        <AlertCircle className="h-4 w-4 mr-1.5 text-blue-500" />
                        <span>Passing score: 70%</span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Progress</span>
                    <p className="text-2xl font-bold text-blue-600 font-mono">
                        {Object.keys(answers).length} <span className="text-gray-400 text-lg">/ {questions.length}</span>
                    </p>
                </div>
            </div>

            <div className="space-y-8">
                {questions.map((q, index) => {
                    if (!q || !q.question_options) return null
                    return (
                        <div key={q.id} className="bg-white p-8 rounded-2xl shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-md">
                            <div className="flex gap-6">
                                <span className="shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 text-lg font-bold ring-1 ring-blue-100">
                                    {index + 1}
                                </span>
                                <div className="w-full">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-6 leading-relaxed">{q.question_text}</h3>
                                    <div className="space-y-3">
                                        {q.question_options.map(option => (
                                            <label
                                                key={option.id}
                                                className={`relative group flex items-center p-4 rounded-xl border-2 cursor-pointer ${answers[q.id] === option.id
                                                    ? 'bg-blue-50/50 border-blue-500 shadow-sm'
                                                    : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className={`relative flex items-center justify-center h-5 w-5 rounded-full border transition-colors ${answers[q.id] === option.id ? 'border-blue-600 bg-blue-600' : 'border-gray-300 group-hover:border-blue-400'
                                                    }`}>
                                                    {answers[q.id] === option.id && (
                                                        <div className="h-2 w-2 rounded-full bg-white" />
                                                    )}
                                                </div>
                                                <span className={`ml-4 text-base ${answers[q.id] === option.id ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
                                                    {option.option_text}
                                                </span>
                                                <input
                                                    type="radio"
                                                    name={String(q.id)}
                                                    value={option.id}
                                                    checked={answers[q.id] === option.id}
                                                    onChange={() => handleOptionSelect(q.id, option.id)}
                                                    className="sr-only"
                                                    data-gramm="false"
                                                    data-lpignore="true"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="mt-10 flex justify-end pb-12">
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-2xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
                >
                    {submitting ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            Submitting...
                        </>
                    ) : (
                        <>
                            Submit Test
                            <CheckCircle className="ml-3 h-6 w-6" />
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
