'use client'
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useTranslations } from '@/lib/i18n'
import { Trash2, Loader2, Pencil } from "lucide-react"
import { jwtDecode } from 'jwt-decode'


export default function Tasks() {
    const router = useRouter()
    const [currentUserRole, setCurrentUserRole] = useState('')
    const t = useTranslations('tasks')
    const [tasks, setTasks] = useState<{ id: number, project_id: number, project_name: string, name: string, company_name: string, user_id: number, status: string, created_at: string, notes: string, due_date: string | null }[]>([])
    const [editingTasks, setEditingTasks] = useState<{ id: number, project_id: number, project_name: string, name: string, company_name: string, user_id: number, status: string, created_at: string, notes: string, due_date: string | null } | null>(null)
    const [projects, setProjects] = useState<{ id: number, client_id: number, name: string, status: string, company_name: string }[]>([])
    const [project, setProject] = useState('')
    const [users, setUsers] = useState<{ id: number, name: string }[]>([])
    const [user, setUser] = useState<string[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [taskName, setTaskName] = useState('')
    const [status, setStatus] = useState('pending')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(true)


    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            setTasks(data)
        } finally {
            setLoading(false)
        }
    }

    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            setProjects(data)
            if (data.length > 0) setProject(data[0].id.toString())
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) { return router.push('/login') }


        const fetchUsers = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            setUsers(data)
        }
        fetchTasks()
        fetchProjects()
        fetchUsers()

        const decoded = jwtDecode<{ role: string }>(token)
        setCurrentUserRole(decoded.role)
    }, [])

    const saveNewTask = async () => {
        const token = localStorage.getItem('token')
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status, name: taskName, project_id: project ? parseInt(project) : null, notes })
        })
        setIsOpen(false)
        fetchTasks()
    }

    const editTask = async (id: number) => {
        const token = localStorage.getItem('token')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status, name: taskName, project_id: project ? parseInt(project) : null, notes })
        })
        const data = await response.json()
        setTasks(tasks.map(t => t.id === id ? data : t))
        setIsOpen(false)

    }

    const deleteTask = async (id: number) => {
        const token = localStorage.getItem('token')
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        setTasks(tasks.filter(tasks => tasks.id !== id))
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-blue-950">{t('title')}</h1>
                        <p className="mt-1 text-sm text-gray-500">{t('subtitle')}</p>
                    </div>
                    <button onClick={() => setIsOpen(true)}
                        className="rounded-md bg-blue-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-900"
                    >
                        {t('new')}
                    </button>
                </div>

                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                            <div className="bg-white p-6 text-center flex flex-col gap-4">
                                <h2 className="mb-5 text-lg font-semibold text-blue-950">{t('new')}</h2>
                                <div className="flex flex-col gap-3">
                                    <input placeholder={t('taskName')} onChange={(e) => setTaskName(e.target.value)} className="w-full rounded-md border border-gray-100 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-950 focus:ring-1 focus:ring-blue-950" />
                                    <input placeholder={t('notes')} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-md border border-gray-100 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-950 focus:ring-1 focus:ring-blue-950" />
                                    <div className="flex flex-col gap-2 text-left">
                                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('assignees')}</span>
                                        <div className="flex max-h-44 flex-col gap-2 overflow-y-auto rounded-md border border-gray-100 p-2">
                                            {users.map((u) => {
                                                const checked = user.includes(String(u.id))
                                                return (
                                                    <label
                                                        key={u.id}
                                                        className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors ${checked
                                                            ? "border-blue-950 bg-blue-50 text-blue-950"
                                                            : "border-gray-100 bg-white text-gray-700 hover:bg-gray-50"
                                                            }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            value={u.id}
                                                            checked={checked}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setUser([...user, e.target.value])
                                                                } else {
                                                                    setUser(user.filter(id => id !== e.target.value))
                                                                }
                                                            }}
                                                            className="h-4 w-4 rounded border-gray-300 text-blue-950 accent-blue-950 focus:ring-blue-950"
                                                        />
                                                        <span className="font-medium">{u.name}</span>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    <select name="select" onChange={(e) => setProject(e.target.value)} className="w-full rounded-md border border-gray-100 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-950 focus:ring-1 focus:ring-blue-950">
                                        {projects.map((project) => (
                                            <option key={project.id} value={project.id}>{project.company_name} - {project.name}</option>
                                        ))}
                                    </select>
                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            className="rounded-md border border-gray-100 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {t('cancel')}
                                        </button>
                                        <button
                                            className="rounded-md bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
                                            onClick={() => {
                                                editingTasks ? editTask(editingTasks.id) : saveNewTask()
                                                setEditingTasks(null)
                                            }}
                                        >
                                            {t('save')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-950" />
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50">
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('name')}</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('status')}</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('client')}</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('project')}</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('notes')}</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('date')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"></th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {tasks.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">{t('empty')}</td>
                                        </tr>
                                    ) :
                                        tasks.map((task) => (
                                            <tr key={task.id} className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/tasks/${task.id}`)}>
                                                <td className="px-4 py-3 text-left text-sm text-gray-600">{task.name}</td>
                                                <td className="px-4 py-3 text-left text-sm text-gray-600">{task.status}</td>
                                                <td className="px-4 py-3 text-left text-sm text-gray-600">{task.company_name}</td>
                                                <td className="px-4 py-3 text-left text-sm text-gray-600">{task.project_name}</td>
                                                <td className="px-4 py-3 text-left text-sm text-gray-600">{task.notes}</td>
                                                <td className="px-4 py-3 text-left text-sm text-gray-600">{new Date(task.due_date || task.created_at).toLocaleDateString()}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        {currentUserRole === 'superadmin' && (
                                                            <Pencil
                                                                className="h-4 w-4 cursor-pointer text-blue-600"

                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    setEditingTasks(task)
                                                                    setTaskName(task.name || '')
                                                                    setNotes(task.notes || '')
                                                                    setIsOpen(true)
                                                                }}
                                                            />
                                                        )}
                                                        {currentUserRole === 'superadmin' && (
                                                            <Trash2
                                                                className="h-4 w-4 cursor-pointer text-red-600"
                                                                onClick={() => {
                                                                    const confirmed = confirm(t('deleteConfirm'))
                                                                    if (confirmed) deleteTask(task.id)
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}