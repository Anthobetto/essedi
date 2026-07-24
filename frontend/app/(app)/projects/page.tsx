'use client'
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useTranslations } from '@/lib/i18n'
import { Trash2, Loader2, Pencil } from "lucide-react"
import { jwtDecode } from 'jwt-decode'

export default function Projects() {
    const router = useRouter()
    const t = useTranslations('projects')
    const [currentUserRole, setCurrentUserRole] = useState('')
    const [projects, setProjects] = useState<{ id: number, name: string, status: string, client_id: number, company_name: string, created_at: string, notes: string | null }[]>([])
    const [editingProject, setEditingProject] = useState<{ id: number, name: string, status: string, client_id: number, company_name: string, created_at: string } | null>(null)
    const [clients, setClients] = useState<{ id: number, company_name: string }[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [projectName, setProjetcName] = useState('')
    const [client, setClient] = useState('')
    const [status, setStatus] = useState('pending')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(true)


    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            setProjects(data)
        } finally {
            setLoading(false)
        }
    }

    const fetchClients = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            setClients(data)
            if (data.length > 0) { setClient(data[0].id.toString()) }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) { return router.push('/login') }

        fetchProjects()
        fetchClients()

        const decoded = jwtDecode<{ role: string }>(token)
        setCurrentUserRole(decoded.role)
    }, [])

    const saveNewProject = async () => {
        const token = localStorage.getItem('token')
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: projectName, status, client_id: client ? parseInt(client) : null, notes })
        })
        setIsOpen(false)
        fetchProjects()
    }

    const deleteProject = async (id: number) => {
        const token = localStorage.getItem('token')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!response.ok) {
            alert(t('deleteError'))
            return
        }
        setProjects(projects.filter(projects => projects.id !== id))
    }

    const editProject = async (id: number) => {
        const token = localStorage.getItem('token')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: projectName, status, client_id: client ? parseInt(client) : null, notes })
        })
        const data = await response.json()
        setProjects(projects.map(c => c.id === id ? data : c))
        setIsOpen(false)
    }


    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-blue-950">{t('title')}</h1>
                        <p className="mt-1 text-sm text-gray-500">{t('subtitle')}</p>
                    </div>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="rounded-md bg-blue-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-900"
                    >
                        {t('new')}
                    </button>
                </div>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                            <h2 className="mb-5 text-lg font-semibold text-blue-950">{t('new')}</h2>
                            <div className="flex flex-col gap-3">
                                <input
                                    placeholder={t('projectName')}
                                    onChange={(e) => setProjetcName(e.target.value)}
                                    className="w-full rounded-md border border-gray-100 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-950 focus:ring-1 focus:ring-blue-950"
                                />
                                <input
                                    placeholder={t('notes')}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full rounded-md border border-gray-100 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-950 focus:ring-1 focus:ring-blue-950"
                                />
                                <select onChange={(e) => setClient(e.target.value)} className="w-full rounded-md border border-gray-100 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-950 focus:ring-1 focus:ring-blue-950">
                                    {clients.map((c) => (
                                        <option key={c.id} value={c.id}>{c.company_name}</option>
                                    ))}
                                </select>
                                <select name="select" onChange={(e) => setStatus(e.target.value)} className="w-full rounded-md border border-gray-100 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-950 focus:ring-1 focus:ring-blue-950">
                                    <option value="pending">{t('pending')}</option>
                                    <option value="in_progress">{t('in_progress')}</option>
                                    <option value="started">{t('started')}</option>
                                    <option value="ended">{t('ended')}</option>
                                </select>
                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        className="rounded-md border border-gray-100 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                        onClick={() => {
                                            setIsOpen(false)
                                            setEditingProject(null)
                                        }}
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button
                                        className="rounded-md bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
                                        onClick={() => {
                                            editingProject ? editProject(editingProject.id) : saveNewProject()
                                            setEditingProject(null)
                                        }}
                                    >
                                        {t('save')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-950" />
                    </div>
                ) : (<div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('name')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('client')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('status')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('date')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"></th>

                                </tr>
                            </thead>
                            <tbody>
                                {projects.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">
                                            {t('empty')}
                                        </td>
                                    </tr>
                                ) : (
                                    projects.map((project) => (
                                        <tr key={project.id} className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50">
                                            <td className="px-4 py-3 text-left text-sm text-gray-600">{project.name}</td>
                                            <td className="px-4 py-3 text-left text-sm text-gray-600">{project.company_name}</td>
                                            <td className="px-4 py-3 text-left text-sm text-gray-600">{project.status}</td>
                                            <td className="px-4 py-3 text-left text-sm text-gray-600">{new Date(project.created_at).toLocaleDateString()}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {currentUserRole === 'superadmin' && (
                                                        <Pencil
                                                            className="h-4 w-4 cursor-pointer text-blue-600"
                                                            onClick={() => {
                                                                setEditingProject(project)
                                                                setProjetcName(project.name || '')
                                                                setClient(project.client_id?.toString() || '')
                                                                setStatus(project.status || '')
                                                                setNotes(project.notes || '')
                                                                setIsOpen(true)
                                                            }}
                                                        />
                                                    )}
                                                    {currentUserRole === 'superadmin' && (
                                                        <Trash2
                                                            className="h-4 w-4 cursor-pointer text-red-600"
                                                            onClick={() => {
                                                                const confirmed = confirm(t('deleteConfirm'))
                                                                if (confirmed) deleteProject(project.id)
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                )}
            </div>
        </div>
    )
}