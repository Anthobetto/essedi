'use client'
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Tasks() {
    const router = useRouter()
    const [tasks, setTasks] = useState<{ id: number, project_id: number, project_name: string, name: string, company_name: string, user_id: number, status: string, created_at: string }[]>([])
    const [projects, setProjects] = useState<{ id: number, client_id: number, name: string, status: string, company_name: string }[]>([])
    const [project, setProject] = useState('')
    const [users, setUsers] = useState<{ id: number, name: string }[]>([])
    const [user, setUser] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [taskName, setTaskName] = useState('')
    const [status, setStatus] = useState('pending')
    const [notes, setNotes] = useState('')


    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) { return router.push('/login') }

        const fetchTasks = async () => {
            const response = await fetch('http://localhost:4821/tasks', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            const data = await response.json()
            setTasks(data)
        }

        const fetchProjects = async () => {
            const response = await fetch('http://localhost:4821/projects', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            const data = await response.json()
            setProjects(data)
        }

        const fetchUsers = async () => {
            const response = await fetch('http://localhost:4821/users', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            const data = await response.json()
            setUsers(data)
        }

        fetchTasks()
        fetchProjects()
        fetchUsers()
    }, [])

    const saveNewTask = async () => {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:4821/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status, name: taskName, project_id: project ? parseInt(project) : null, user_id: user ? parseInt(user) : null, notes })
        })

        const data = await response.json()
        setTasks([...tasks, data])
        setIsOpen(false)
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-blue-950">Tasks</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage your tasks directory</p>
                    </div>
                    <button onClick={() => setIsOpen(true)}
                        className="rounded-md bg-blue-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-900"
                    >
                        New Task
                    </button>
                </div>

                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                            <div className="bg-white p-6 text-center flex flex-col gap-4">
                                <h2 className="mb-5 text-lg font-semibold text-blue-950">New Task</h2>
                                <div className="flex flex-col gap-3">
                                    <input placeholder="Service Name" onChange={(e) => setTaskName(e.target.value)} className="w-full rounded-md border border-gray-100 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors  focus:border-blue-950 focus:ring-1 focus:ring-blue-950" />
                                    <input placeholder="notes" onChange={(e) => setNotes(e.target.value)} className="w-full rounded-md border border-gray-100 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-950 focus:ring-1 focus:ring-blue-950" />
                                    <select name="select" onChange={(e) => setUser(e.target.value)} className="w-full rounded-md border border-gray-100 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-950 focus:ring-1 focus:ring-blue-950">
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>{user.name}</option>
                                        ))}
                                    </select>
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
                                            Cancel
                                        </button>
                                        <button
                                            className="rounded-md bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
                                            onClick={() => saveNewTask()}
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>)}
                <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Name</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Client</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Project</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">Not tasks yet</td>
                                    </tr>
                                ) :
                                    tasks.map((task) => (
                                        <tr key={task.id} className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50">
                                            <td className="px-4 py-3 text-left text-sm text-gray-600">{task.name}</td>
                                            <td className="px-4 py-3 text-left text-sm text-gray-600">{task.status}</td>
                                            <td className="px-4 py-3 text-left text-sm text-gray-600">{task.company_name}</td>
                                            <td className="px-4 py-3 text-left text-sm text-gray-600">{task.project_name}</td>
                                            <td className="px-4 py-3 text-left text-sm text-gray-600">{new Date(task.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}