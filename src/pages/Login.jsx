import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const { signIn } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { error } = await signIn({ email, password })
            if (error) throw error
            toast.success('Welcome back!')
            navigate('/')
        } catch (error) {
            toast.error('Failed to sign in. Please check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/bg-office.png')" }}
        >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

            <div className="relative w-full max-w-md rounded-xl bg-white/90 p-8 shadow-2xl backdrop-blur-xl border border-white/20">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h1>
                    <p className="mt-2 text-sm text-gray-600">Sign in to access your professional dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full rounded-lg border-gray-300 bg-white/50 p-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all"
                            placeholder="name@company.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full rounded-lg border-gray-300 bg-white/50 p-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/signup')}
                            className="font-semibold text-blue-600 hover:text-blue-500 hover:underline transition-colors"
                        >
                            Create an account
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}
