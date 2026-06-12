'use client'
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Dashboard() {
    const router = useRouter()
    const [user, setUser] = useState<{ name: string, email: string } | null>(null)
    const [projects, setProjects] = useState<{ id: number, name: string }[]>([])
    const [tasks, setTasks] = useState<{ id: number, name: string }[]>([])


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
            const response = await fetch ('http://localhost:4821/tasks',{
                method: 'GET',
                headers: {'Authorization': `Bearer ${token}`}
            })

            const data = await response.json()
            setTasks(data)
        }

        fetchUser()
        fetchProjects()
        fetchTasks()
    }, [])

    return (
        <div>
            {user && <h1>Hello {user.name}</h1>}
            {projects && projects.map((project) => <div key={project.id}>{project.name}</div>)}
            {tasks && tasks.map((task) => <div key={task.id}>{task.name}</div> )}
        </div>
    )
}