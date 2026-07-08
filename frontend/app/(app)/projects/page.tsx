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
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-blue-950">Projects</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage your projects directory</p>
                    </div>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="rounded-md bg-blue-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-900"
                    >
                        New Project
                    </button>
                </div>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                            <h2 className="mb-5 text-lg font-semibold text-blue-950">New Project</h2>
                            <div className="flex flex-col gap-3">
                                <input
                                    placeholder="Client Name"
                                    onChange={(e) => setProjetcName(e.target.value)}
                                    className="w-full rounded-md border border-gray-100 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-950 focus:ring-1 focus:ring-blue-950"
                                />
                                <input placeholder="Notes" onChange={(e) => setNotes(e.target.value)} className="w-full rounded-md border border-gray-100 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-950 focus:ring-1 focus:ring-blue-950" />
                                <select onChange={(e) => setClient(e.target.value)} className="w-full rounded-md border border-gray-100 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-950 focus:ring-1 focus:ring-blue-950">
                                    {clients.map((c) => (
                                        <option key={c.id} value={c.id}>{c.company_name}</option>
                                    ))}
                                </select>
                                <select name="select" onChange={(e) => setStatus(e.target.value)} className="w-full rounded-md border border-gray-100 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-950 focus:ring-1 focus:ring-blue-950">
                                    <option value="pending">pending</option>
                                    <option value="in_progress">in progress</option>
                                    <option value="started">started</option>
                                    <option value="ended">ended</option>
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
                                        onClick={() => saveNewProject()}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Client</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">
                                            No projects yet
                                        </td>
                                    </tr>
                                ) : (
                                    projects.map((project) => (
                                    <tr key={project.id} className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50">
                                        <td className="px-4 py-3 text-left text-sm text-gray-600">{project.name}</td>
                                        <td className="px-4 py-3 text-left text-sm text-gray-600">{project.company_name}</td>
                                        <td className="px-4 py-3 text-left text-sm text-gray-600">{project.status}</td>
                                        <td className="px-4 py-3 text-left text-sm text-gray-600">{new Date(project.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div >
    )
}
