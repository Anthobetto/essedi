'use client'
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Projects() {
    const router = useRouter()
    const [projects, setProjects] = useState<{ id: number, name: string, status: string, client_id: number, company_name: string, created_at: string }[]>([])

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) { return router.push('/login') }

        const fetchProjects = async () => {
            const response = await fetch('http://localhost:4821/projects', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            const data = await response.json()
            setProjects(data)
        }

        fetchProjects()
    }, [])

    return (
        <div>
            <div className="flex gap-8">
                <table className="w-full border-collapse border">
                    <thead className="bg-amber-100">
                        <tr>
                            <th className="text-left py-3 px-4">Name</th>
                            <th className="text-left py-3 px-4">Client</th>
                            <th className="text-left py-3 px-4">Status</th>
                            <th className="text-left py-3 px-4">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map((project) => (
                            <tr key={project.id}>
                                <td className="text-left py-3 px-4">{project.name}</td>
                                <td className="text-left py-3 px-4">{project.company_name}</td>
                                <td className="text-left py-3 px-4">{project.status}</td>
                                <td className="text-left py-3 px-4">{new Date(project.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}