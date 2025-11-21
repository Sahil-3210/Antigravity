import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { User, Briefcase, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EmployeeList() {
    const [employees, setEmployees] = useState([])
    const [roles, setRoles] = useState([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            // 1. Get all employees
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'employee')
                .order('created_at', { ascending: false })

            if (usersError) throw usersError

            // 2. Get all job roles
            const { data: rolesData, error: rolesError } = await supabase
                .from('job_roles')
                .select('*')
                .order('title')

            if (rolesError) throw rolesError
            setRoles(rolesData)

            // 3. Get active role assignments for these employees
            const { data: assignmentsData, error: assignmentsError } = await supabase
                .from('employee_roles')
                .select('user_id, role_id, job_roles(title)')
                .eq('status', 'active')

            if (assignmentsError) throw assignmentsError

            // Merge data
            const mergedEmployees = usersData.map(user => {
                const assignment = assignmentsData.find(a => a.user_id === user.id)
                return {
                    ...user,
                    current_role_id: assignment?.role_id || '',
                    current_role_title: assignment?.job_roles?.title || 'Unassigned'
                }
            })

            setEmployees(mergedEmployees)

        } catch (error) {
            console.error('Error fetching data:', error)
            toast.error('Failed to load employees.')
        } finally {
            setLoading(false)
        }
    }

    const handleRoleChange = (userId, newRoleId) => {
        setEmployees(prev => prev.map(emp =>
            emp.id === userId ? { ...emp, new_role_id: newRoleId } : emp
        ))
    }

    const saveRole = async (employee) => {
        if (!employee.new_role_id || employee.new_role_id === employee.current_role_id) return

        setUpdating(employee.id)
        try {
            // 1. Deactivate old role if exists
            if (employee.current_role_id) {
                await supabase
                    .from('employee_roles')
                    .update({ status: 'completed' })
                    .eq('user_id', employee.id)
                    .eq('status', 'active')
            }

            // 2. Assign new role
            const { error } = await supabase
                .from('employee_roles')
                .insert({
                    user_id: employee.id,
                    role_id: employee.new_role_id,
                    status: 'active'
                })

            if (error) throw error

            toast.success('Role updated successfully!')

            // Refresh local state to reflect change
            const newRoleTitle = roles.find(r => r.id === employee.new_role_id)?.title
            setEmployees(prev => prev.map(emp =>
                emp.id === employee.id ? {
                    ...emp,
                    current_role_id: employee.new_role_id,
                    current_role_title: newRoleTitle,
                    new_role_id: undefined // Clear selection
                } : emp
            ))

        } catch (error) {
            console.error('Error updating role:', error)
            toast.error('Failed to update role.')
        } finally {
            setUpdating(null)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    )

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Employee Management</h1>
                <p className="mt-2 text-gray-600">Manage employee roles and view their current status.</p>
            </div>

            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-2xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Employee
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Current Role
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Assign New Role
                            </th>
                            <th scope="col" className="relative px-6 py-4">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {employees.map((employee) => (
                            <tr key={employee.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="shrink-0 h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                                            <span className="font-medium text-sm">{employee.full_name ? employee.full_name.charAt(0) : 'U'}</span>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-semibold text-gray-900">{employee.full_name || 'No Name'}</div>
                                            <div className="text-sm text-gray-500">{employee.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.current_role_title === 'Unassigned'
                                        ? 'bg-gray-100 text-gray-600'
                                        : 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
                                        }`}>
                                        {employee.current_role_title}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="max-w-xs">
                                        <select
                                            value={employee.new_role_id || employee.current_role_id || ''}
                                            onChange={(e) => handleRoleChange(employee.id, e.target.value)}
                                            className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-xl shadow-sm"
                                        >
                                            <option value="">Select Role...</option>
                                            {roles.map(role => (
                                                <option key={role.id} value={role.id}>{role.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {employee.new_role_id && employee.new_role_id !== employee.current_role_id && (
                                        <button
                                            onClick={() => saveRole(employee)}
                                            disabled={updating === employee.id}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            {updating === employee.id ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
