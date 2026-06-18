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
        <div>
            <div className="text-right p-6">
                <span className="bg-amber-600 p-3 rounded-2xl">
                    <button onClick={() => setIsOpen(true)}>New Task</button>
                </span>
            </div>
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6 text-center flex flex-col gap-4">
                        <h2>New Task</h2>
                        <input placeholder="name" onChange={(e) => setTaskName(e.target.value)} />
                        <input placeholder="notes" onChange={(e) => setNotes(e.target.value)} />
                        <select name="select" onChange={(e) => setUser(e.target.value)}>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                        <select name="select" onChange={(e) => setProject(e.target.value)}>
                            {projects.map((project) => (
                                <option key={project.id} value={project.id}>{project.company_name} - {project.name}</option>
                            ))}
                        </select>
                       <div className="flex gap-8 justify-between">
                        <button className="bg-red-400  rounded-2xl py-2 px-3" onClick={() => setIsOpen(false)}>Cancel</button>
                        <button className="bg-green-600 rounded-2xl py-3 px-4" onClick={() => saveNewTask()}>Save</button>
                        </div>
                    </div>
                </div>)}
            <div>
                <div className="flex flex-col md:flex-row gap-8">
                    <table className="w-full border border-collapse">
                        <thead className="bg-amber-100">
                            <tr>
                                <th className="text-left py-3 px-4">Name</th>
                                <th className="text-left py-3 px-4">Status</th>
                                <th className="text-left py-3 px-4">Client</th>
                                <th className="text-left py-3 px-4">Project</th>
                                <th className="text-left py-3 px-4">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map((task) => (
                                <tr key={task.id}>
                                    <td className="text-left py-3 px-4">{task.name}</td>
                                    <td className="text-left py-3 px-4">{task.status}</td>
                                    <td className="text-left py-3 px-4">{task.company_name}</td>
                                    <td className="text-left py-3 px-4">{task.project_name}</td>
                                    <td className="text-left py-3 px-4">{new Date(task.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}