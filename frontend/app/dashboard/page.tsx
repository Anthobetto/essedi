'use client'
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Dashboard() {
    const router = useRouter()
    const [user, setUser] = useState<{ name: string, email: string } | null>(null)
    const [projects, setProjects] = useState<{ id: number, name: string, status: string }[]>([])
    const [tasks, setTasks] = useState<{ id: number, name: string, status: string}[]>([])


    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
        }

        const fetchUser = async () => {
            const response = await fetch('http://localhost:4821/users/me', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            setUser(data)
        }

        const fetchProjects = async () => {
            const response = await fetch('http://localhost:4821/projects', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            setProjects(data)
        }

        const fetchTasks = async () => {
            const response = await fetch('http://localhost:4821/tasks', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            const data = await response.json()
            setTasks(data)
        }

        fetchUser()
        fetchProjects()
        fetchTasks()
    }, [])

    return (
        <div className="p-5">
            {user && <h1>Hello {user.name}</h1>}
            <div className="flex flex-col md:flex-row gap-8 m-8">
                {/* Projects Section*/}
                <div className="flex-1">
                    <h2>Recent Projects</h2>
                    <table className="w-full border-collapse border">
                        <thead className="bg-amber-100">
                            <tr>
                                <th className="text-left py-3 px-4">Name</th>
                                <th className="text-left py-3 px-4">State</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((project) => (
                                <tr key={project.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4 text-sm">{project.name}</td>
                                    <td className="py-3 px-4 text-sm">{project.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Tasks Section */}
                <div className="flex-1">
                    <h2>Current Tasks</h2>
                    <table className="w-full border-collapse border">
                        <thead className="bg-amber-100">
                            <tr>
                                <th className="text-left py-3 px-4">Name</th>
                                <th className="text-left py-3 px-4">State</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map((task) => (
                                <tr key={task.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4 text-sm">{task.name}</td>
                                    <td className="py-3 px-4 text-sm">{task.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}