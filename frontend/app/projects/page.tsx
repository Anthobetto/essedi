'use client'
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Projects() {
    const router = useRouter()
    const [projects, setProjects] = useState<{ id: number, name: string, status: string, client_id: number, company_name: string, created_at: string }[]>([])
    const [clients, setClients] = useState<{ id: number, company_name: string }[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [projectName, setProjetcName] = useState('')
    const [client, setClient] = useState('')
    const [status, setStatus] = useState('pending')
    const [notes, setNotes] = useState('')

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

        const fetchClients = async () => {
            const response = await fetch('http://localhost:4821/clients', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            const data = await response.json()
            setClients(data)
            if (data.length > 0) {
                setClient(data[0].id.toString())
            }
        }
        fetchClients()


    }, [])


    const saveNewProject = async () => {
        const token = localStorage.getItem('token')
        console.log(client)
        const response = await fetch('http://localhost:4821/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: projectName, status, client_id: client ? parseInt(client) : null, notes })
        })

        const data = await response.json()
        setProjects([...projects, data])
        setIsOpen(false)
    }

    return (
        <div>
            <div className="text-right p-6">
                <span className="bg-amber-600 p-3 rounded-2xl">
                    <button onClick={() => setIsOpen(true)}>New Project</button>
                </span>
                {isOpen && (
                    <div className=" fixed inset-0 bg-black/50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-2xl flex flex-col gap-4">
                            <h2>New Project</h2>
                            <input placeholder="Project name" onChange={(e) => setProjetcName(e.target.value)} />
                            <input placeholder="Notes" onChange={(e) => setNotes(e.target.value)} />
                            <select onChange={(e) => setClient(e.target.value)}>
                                {clients.map((c) => (
                                    <option key={c.id} value={c.id}>{c.company_name}</option>
                                ))}
                            </select>
                            <select name="select" onChange={(e) => setStatus(e.target.value)}>
                                <option value="pending">pending</option>
                                <option value="in_progress">in progress</option>
                                <option value="started">started</option>
                                <option value="ended">ended</option>
                            </select>
                            <div className="flex gap-8 justify-between">
                                <button className="bg-red-400  rounded-2xl py-2 px-3" onClick={() => setIsOpen(false)}>Cancel</button>
                                <button className="bg-green-600 rounded-2xl py-3 px-4" onClick={() => saveNewProject()}>Save</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex flex-col md:flex-row gap-8">
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
