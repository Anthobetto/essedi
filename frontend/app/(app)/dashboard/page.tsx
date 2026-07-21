'use client'
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useTranslations } from "@/lib/i18n"

function statusBadgeClasses(status: string) {
    const value = (status || "").toLowerCase()
    if (["done", "completed", "active", "complete", "ended"].includes(value)) {
        return "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
    }
    if (["in progress", "in-progress", "ongoing", "pending"].includes(value)) {
        return "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20"
    }
    if (["blocked", "overdue", "failed", "cancelled", "canceled"].includes(value)) {
        return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
    }
    return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/20"
}

export default function Dashboard() {
    const router = useRouter()
    const t = useTranslations('dashboard')
    const [user, setUser] = useState<{ name: string, email: string } | null>(null)
    const [projects, setProjects] = useState<{ id: number, name: string, status: string }[]>([])
    const [tasks, setTasks] = useState<{ id: number, name: string, status: string }[]>([])


    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
        }

        const fetchUser = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            setUser(data)
        }

        const fetchProjects = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            setProjects(data)
        }

        const fetchTasks = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
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
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
                {/* Header */}
                <header className="mb-8 flex flex-col gap-1">
                    {user ? (
                        <>
                            <h1 className="text-3xl font-bold tracking-tight text-blue-950 text-balance">
                               { t('greeting')}, {user.name}
                            </h1>
                            <p className="text-sm text-slate-500">{user.email}</p>
                        </>
                    ) : (
                        <div className="space-y-2">
                            <div className="h-8 w-56 animate-pulse rounded-md bg-slate-200" />
                            <div className="h-4 w-40 animate-pulse rounded-md bg-slate-200" />
                        </div>
                    )}
                </header>

                <div className="flex flex-col gap-8 md:flex-row">
                    {/* Projects Section */}
                    <section className="flex-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <h2 className="text-lg font-semibold text-blue-950">{t('recentProjects')}</h2>
                            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-950 px-2 text-xs font-medium text-white">
                                {projects.length}
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/80">
                                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{t('name')}</th>
                                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{t('state')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {projects.map((project) => (
                                        <tr key={project.id} className="transition-colors hover:bg-slate-50">
                                            <td className="px-6 py-3.5 text-sm font-medium text-slate-800">{project.name}</td>
                                            <td className="px-6 py-3.5 text-sm">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClasses(project.status)}`}>
                                                    {project.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {projects.length === 0 && (
                                        <tr>
                                            <td colSpan={2} className="px-6 py-8 text-center text-sm text-slate-400">
                                                {t('noProjects')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Tasks Section */}
                    <section className="flex-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <h2 className="text-lg font-semibold text-blue-950">{t('currentTasks')}</h2>
                            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-950 px-2 text-xs font-medium text-white">
                                {tasks.length}
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/80">
                                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">State</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {tasks.map((task) => (
                                        <tr key={task.id} className="transition-colors hover:bg-slate-50">
                                            <td className="px-6 py-3.5 text-sm font-medium text-slate-800">{task.name}</td>
                                            <td className="px-6 py-3.5 text-sm">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClasses(task.status)}`}>
                                                    {task.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {tasks.length === 0 && (
                                        <tr>
                                            <td colSpan={2} className="px-6 py-8 text-center text-sm text-slate-400">
                                               {t('noTasks')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
