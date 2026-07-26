'use client'
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "@/lib/i18n"
import { jwtDecode } from "jwt-decode"

export default function TaskId() {
    const { id } = useParams()
    const router = useRouter()
    const t = useTranslations('taskDetail')
    const [project, setProject] = useState<{ id: number, project_id: number | null, project_name: string, name: string, company_name: string, user_id: number, status: string, created_at: string, due_date: string | null, assignees: { id: number, name: string, status: string }[] } | null>(null)
    const [relatedTasks, setRelatedTasks] = useState<{ project_id: number, id: number, project_name: string, name: string, company_name: string, user_id: number, status: string }[]>([])
    const [currentUserId, setCurrentUserId] = useState<number | null>(null)

    const fetchRelatedTasks = async () => {
        const token = localStorage.getItem('token')

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` }
        })
        const data = await response.json()
        setRelatedTasks(data.filter((t: any) => t.project_id === parseInt(id as string)))
        console.log(id)
    }

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) { return router.push('/login') }

        const decoded = jwtDecode<{ id: number }>(token)
        setCurrentUserId(decoded.id)

        const fetchProjects = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await response.json()
            setProject(data)
        }

        fetchProjects()
        fetchRelatedTasks()
    }, [])


    const closeProject = async () => {
        const token = localStorage.getItem('token')
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'ended' })
        })
        setProject(prev => prev ? { ...prev, status: 'ended' } : null)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                {project ? (
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <button onClick={() => router.back()} className="text-sm text-blue-950 hover:underline text-left">
                                {t('back')}
                            </button>
                            <h1 className="text-2xl font-semibold tracking-tight text-blue-950 text-balance">
                                {project.name}
                            </h1>
                            <p className="text-sm text-gray-500">{t('subtitle')}</p>
                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
                            <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-gray-400">
                                {t('taskInfo')}
                            </h2>
                            <dl className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                                <div className="flex flex-col gap-1">
                                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{t('name')}</dt>
                                    <dd className="text-sm font-medium text-gray-900">{project.name}</dd>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{t('client')}</dt>
                                    <dd className="text-sm font-medium text-gray-900">{project.company_name}</dd>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{t('status')}</dt>
                                    <dd>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${project.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                project.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    project.status === 'ended' ? 'bg-gray-100 text-gray-600' :
                                                        'bg-blue-100 text-blue-700'
                                            }`}>
                                            {t(project.status)}
                                        </span>
                                    </dd>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{t('date')}</dt>
                                    <dd className="text-sm font-medium text-gray-900">
                                        {new Date(project.created_at).toLocaleDateString()}
                                    </dd>
                                </div>
                            </dl>

                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
                            <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-gray-400">
                                {t('relatedTasks')}
                            </h2>
                            {relatedTasks.length > 0 && relatedTasks.every(t => t.status === 'completed') && (
                                <button onClick={() => closeProject()}>
                                    {t('closeProject')}
                                </button>
                            )}
                            {relatedTasks.map((rTask) => (
                                <div key={rTask.id} className="flex items-center justify-between border-b border-gray-100 py-3">
                                    <span className="text-sm text-gray-900">{rTask.name}</span>
                                    <span className={`text-xs rounded-full px-2 py-0.5 ${rTask.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            rTask.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                rTask.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                        }`}>{t(rTask.status)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className="h-8 w-64 animate-pulse rounded-md bg-gray-200" />
                        <div className="h-48 animate-pulse rounded-2xl bg-gray-200" />
                        <div className="h-32 animate-pulse rounded-2xl bg-gray-200" />
                    </div>
                )}
            </div>
        </div>
    )
}