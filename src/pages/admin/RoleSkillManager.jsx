import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2, Save, ChevronDown, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RoleSkillManager() {
    const [activeTab, setActiveTab] = useState('roles') // 'roles' or 'skills'
    const [roles, setRoles] = useState([])
    const [skills, setSkills] = useState([])
    const [loading, setLoading] = useState(true)

    // Form states
    const [newSkill, setNewSkill] = useState({ name: '', category: 'technical' })
    const [newRole, setNewRole] = useState({ title: '', level: 'junior', description: '' })
    const [expandedRole, setExpandedRole] = useState(null)
    const [roleSkills, setRoleSkills] = useState([])
    const [selectedSkillToAdd, setSelectedSkillToAdd] = useState('')
    const [requiredLevel, setRequiredLevel] = useState(3)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const { data: rolesData } = await supabase.from('job_roles').select('*').order('title')
            const { data: skillsData } = await supabase.from('skills').select('*').order('name')

            setRoles(rolesData || [])
            setSkills(skillsData || [])
        } catch (error) {
            console.error('Error fetching data:', error)
            toast.error('Failed to load data.')
        } finally {
            setLoading(false)
        }
    }

    // --- Skill Management ---
    const handleAddSkill = async (e) => {
        e.preventDefault()
        try {
            const { data, error } = await supabase
                .from('skills')
                .insert([newSkill])
                .select()

            if (error) throw error
            setSkills([...skills, data[0]])
            setNewSkill({ name: '', category: 'technical' })
            toast.success('Skill added!')
        } catch (error) {
            toast.error('Error adding skill')
        }
    }

    const handleDeleteSkill = async (id) => {
        if (!confirm('Are you sure? This will remove the skill from all roles.')) return
        try {
            await supabase.from('skills').delete().eq('id', id)
            setSkills(skills.filter(s => s.id !== id))
            toast.success('Skill deleted.')
        } catch (error) {
            toast.error('Error deleting skill')
        }
    }

    // --- Role Management ---
    const handleAddRole = async (e) => {
        e.preventDefault()
        try {
            const { data, error } = await supabase
                .from('job_roles')
                .insert([newRole])
                .select()

            if (error) throw error
            setRoles([...roles, data[0]])
            setNewRole({ title: '', level: 'junior', description: '' })
            toast.success('Role added!')
        } catch (error) {
            toast.error('Error adding role')
        }
    }

    const toggleRoleExpand = async (roleId) => {
        if (expandedRole === roleId) {
            setExpandedRole(null)
            return
        }
        setExpandedRole(roleId)
        // Fetch skills for this role
        try {
            const { data } = await supabase
                .from('role_skills')
                .select('*, skills(name, category)')
                .eq('role_id', roleId)
            setRoleSkills(data || [])
        } catch (error) {
            console.error('Error fetching role skills', error)
        }
    }

    const handleAddSkillToRole = async (e) => {
        e.preventDefault()
        if (!selectedSkillToAdd) return
        try {
            const { data, error } = await supabase
                .from('role_skills')
                .insert({
                    role_id: expandedRole,
                    skill_id: selectedSkillToAdd,
                    required_level: requiredLevel
                })
                .select('*, skills(name, category)')

            if (error) throw error
            setRoleSkills([...roleSkills, data[0]])
            setSelectedSkillToAdd('')
            toast.success('Skill assigned to role!')
        } catch (error) {
            toast.error('Error assigning skill (maybe it is already assigned?)')
        }
    }

    const handleRemoveSkillFromRole = async (roleSkillId) => {
        try {
            await supabase.from('role_skills').delete().eq('id', roleSkillId)
            setRoleSkills(roleSkills.filter(rs => rs.id !== roleSkillId))
            toast.success('Skill removed from role.')
        } catch (error) {
            toast.error('Error removing skill from role')
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
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Roles & Skills Management</h1>
                <p className="mt-2 text-gray-600">Define job roles and the skills required for them.</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('roles')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'roles'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Job Roles
                    </button>
                    <button
                        onClick={() => setActiveTab('skills')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'skills'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Skills Library
                    </button>
                </nav>
            </div>

            {/* SKILLS TAB */}
            {activeTab === 'skills' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Skill Form */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-gray-900/5 h-fit">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Skill</h3>
                        <form onSubmit={handleAddSkill}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newSkill.name}
                                    onChange={e => setNewSkill({ ...newSkill, name: e.target.value })}
                                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    placeholder="e.g. React.js"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={newSkill.category}
                                    onChange={e => setNewSkill({ ...newSkill, category: e.target.value })}
                                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                >
                                    <option value="technical">Technical</option>
                                    <option value="soft">Soft Skill</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all">
                                <Plus className="h-4 w-4 mr-2" /> Add Skill
                            </button>
                        </form>
                    </div>

                    {/* Skills List */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {skills.map(skill => (
                                    <tr key={skill.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{skill.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${skill.category === 'technical' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                {skill.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            <button onClick={() => handleDeleteSkill(skill.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ROLES TAB */}
            {activeTab === 'roles' && (
                <div className="space-y-8">
                    {/* Add Role Form */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-gray-900/5">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Role</h3>
                        <form onSubmit={handleAddRole} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role Title</label>
                                <input
                                    type="text"
                                    required
                                    value={newRole.title}
                                    onChange={e => setNewRole({ ...newRole, title: e.target.value })}
                                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    placeholder="e.g. Senior Frontend Dev"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                                <select
                                    value={newRole.level}
                                    onChange={e => setNewRole({ ...newRole, level: e.target.value })}
                                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                >
                                    <option value="junior">Junior</option>
                                    <option value="mid">Mid</option>
                                    <option value="senior">Senior</option>
                                    <option value="lead">Lead</option>
                                    <option value="manager">Manager</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={newRole.description}
                                    onChange={e => setNewRole({ ...newRole, description: e.target.value })}
                                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    placeholder="Optional description"
                                />
                            </div>
                            <button type="submit" className="flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all">
                                <Plus className="h-4 w-4 mr-2" /> Create Role
                            </button>
                        </form>
                    </div>

                    {/* Roles List */}
                    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-2xl overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                            {roles.map(role => (
                                <li key={role.id}>
                                    <div className="block hover:bg-gray-50/50 transition-colors">
                                        <div className="px-6 py-5">
                                            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleRoleExpand(role.id)}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-1 rounded-md ${expandedRole === role.id ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}>
                                                        {expandedRole === role.id ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-base font-semibold text-gray-900">{role.title}</p>
                                                        <p className="text-sm text-gray-500">{role.description}</p>
                                                    </div>
                                                    <span className={`ml-2 px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full capitalize ${role.level === 'lead' || role.level === 'manager' ? 'bg-purple-100 text-purple-800' :
                                                            role.level === 'senior' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                                        }`}>
                                                        {role.level}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Expanded Section: Manage Skills */}
                                            {expandedRole === role.id && (
                                                <div className="mt-6 pl-10 border-t border-gray-100 pt-6">
                                                    <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Required Skills</h4>

                                                    {/* List assigned skills */}
                                                    <div className="flex flex-wrap gap-3 mb-6">
                                                        {roleSkills.map(rs => (
                                                            <span key={rs.id} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                                                {rs.skills.name} <span className="ml-1 text-gray-400 text-xs">(Lvl {rs.required_level})</span>
                                                                <button onClick={() => handleRemoveSkillFromRole(rs.id)} className="ml-2 text-gray-400 hover:text-red-500 transition-colors">
                                                                    <XCircle className="h-4 w-4" />
                                                                </button>
                                                            </span>
                                                        ))}
                                                        {roleSkills.length === 0 && <span className="text-sm text-gray-400 italic">No skills assigned yet.</span>}
                                                    </div>

                                                    {/* Add Skill to Role Form */}
                                                    <form onSubmit={handleAddSkillToRole} className="flex items-end gap-4 bg-gray-50 p-4 rounded-xl max-w-3xl border border-gray-100">
                                                        <div className="grow">
                                                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Select Skill</label>
                                                            <select
                                                                value={selectedSkillToAdd}
                                                                onChange={e => setSelectedSkillToAdd(e.target.value)}
                                                                className="block w-full text-sm rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                                            >
                                                                <option value="">Choose a skill...</option>
                                                                {skills.map(s => (
                                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="w-32">
                                                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Req. Level (1-5)</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="5"
                                                                value={requiredLevel}
                                                                onChange={e => setRequiredLevel(e.target.value)}
                                                                className="block w-full text-sm rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                                            />
                                                        </div>
                                                        <button type="submit" disabled={!selectedSkillToAdd} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">
                                                            Add to Role
                                                        </button>
                                                    </form>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    )
}

// Helper icon component needed since I used XCircle above but didn't import it
function XCircle(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
    )
}
