'use client'
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, ImageIcon } from "lucide-react"
import { useTranslations } from "@/lib/i18n"
import { jwtDecode } from "jwt-decode"

export default function TaskId() {
    const { id } = useParams()
    const router = useRouter()
    const t = useTranslations('taskDetail')
    const [task, setTask] = useState<{ id: number, project_id: number | null, project_name: string, name: string, company_name: string, user_id: number, status: string, created_at: string, due_date: string | null, assignees: { id: number, name: string, status: string }[] } | null>(null)
    const [photos, setPhotos] = useState<FileList | null>(null)
    const [uploadedPhotos, setUploadedPhotos] = useState<{ url: string }[]>([])
    const [success, setSuccess] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<number | null>(null)
    const [taskHours, setTaskHours] = useState<{ id: number, task_id: number, user_id: number, user_name: string, start_time: string, end_time: string, notes: string }[]>([])
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    const [notes, setNotes] = useState('')

    const fetchUploadedPhotos = async () => {
        const token = localStorage.getItem('token')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/taskPhotos/${id}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` }
        })
        const data = await response.json()
        setUploadedPhotos(data)
    }

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) { return router.push('/login') }

        const decoded = jwtDecode<{ id: number }>(token)
        setCurrentUserId(decoded.id)

        const fetchTask = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${id}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await response.json()
            setTask(data)
        }

        const fetchRecordedHours = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/taskHours/${id}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await response.json()
            setTaskHours(data)
        }

        fetchTask()
        fetchUploadedPhotos()
        fetchRecordedHours()
    }, [])

    const uploadPhotos = async () => {
        const token = localStorage.getItem('token')
        const formData = new FormData()
        if (!photos) return
        formData.append('task_id', id as string)
        for (const file of Array.from(photos)) {
            formData.append('photos', file, file.name)
        }
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/taskPhotos`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        })
        setPhotos(null)
        fetchUploadedPhotos()
        setSuccess(true)
    }

    const updateMyStatus = async (status: string) => {
        const token = localStorage.getItem('token')
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        })
        setTask(prev => prev ? {
            ...prev,
            assignees: prev.assignees.map(a => a.id === currentUserId ? { ...a, status } : a)
        } : null)
    }

    const statusBadgeClasses = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700'
            case 'in_progress': return 'bg-blue-100 text-blue-700'
            case 'pending': return 'bg-yellow-100 text-yellow-700'
            case 'cancelled': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-600'
        }
    }

    const saveHours = async () => {
        const token = localStorage.getItem('token')
        const today = new Date().toISOString().split('T')[0]
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/taskHours`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ task_id: id, start_time: `${today} ${startTime}`, end_time: `${today} ${endTime}`, notes })
        })
        const data = await response.json()
        setTaskHours([...taskHours, data])
        setStartTime('')
        setEndTime('')
        setNotes('')
    }


    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                {task ? (
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <button onClick={() => router.back()} className="text-sm text-blue-950 hover:underline text-left">
                                {t('back')}
                            </button>
                            <h1 className="text-2xl font-semibold tracking-tight text-blue-950 text-balance">
                                {task.name}
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
                                    <dd className="text-sm font-medium text-gray-900">{task.name}</dd>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{t('project')}</dt>
                                    <dd className="text-sm font-medium text-gray-900">{task.project_name}</dd>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{t('client')}</dt>
                                    <dd className="text-sm font-medium text-gray-900">{task.company_name}</dd>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{t('status')}</dt>
                                    <dd>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadgeClasses(task.status)}`}>
                                            {task.status?.replace('_', ' ')}
                                        </span>
                                    </dd>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{t('date')}</dt>
                                    <dd className="text-sm font-medium text-gray-900">
                                        {new Date(task.created_at).toLocaleDateString()}
                                    </dd>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{t('assignees')}</dt>
                                    <dd className="text-sm font-medium text-gray-900">
                                        {task.assignees?.map(a => (
                                            <div key={a.id} className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">{a.name}</span>
                                                {a.id === currentUserId ? (
                                                    <div className="flex flex-col gap-1">
                                                        <select value={a.status} onChange={(e) => updateMyStatus(e.target.value)} className="rounded-md border border-gray-100 px-2 py-1 text-xs">
                                                            <option value="pending">{t('pending')}</option>
                                                            <option value="in_progress">{t('in_progress')}</option>
                                                            <option value="completed">{t('completed')}</option>
                                                            <option value="cancelled">{t('cancelled')}</option>
                                                        </select>
                                                        <div className="mt-3">
                                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{t('workHours')}</p>
                                                            <input type="time" onChange={(e) => setStartTime(e.target.value)} />
                                                            <input type="time" onChange={(e) => setEndTime(e.target.value)} />
                                                            <input type="text" onChange={(e) => setNotes(e.target.value)} />
                                                            <button
                                                                className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
                                                                onClick={() => {
                                                                    saveHours()
                                                                }}
                                                            >
                                                                {t('save')}
                                                            </button>
                                                        </div>
                                                    </div>

                                                ) : (
                                                    <span className={`text-xs rounded-full px-2 py-0.5 w-fit ${a.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        a.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                            a.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-red-100 text-red-700'
                                                        }`}>{a.status ? t(a.status) : ''}</span>
                                                )}
                                            </div>
                                        ))}
                                    </dd>
                                    {taskHours.map((hours) => (
                                        <div key={hours.id} className="flex items-center justify-between border-b border-gray-100 py-2">
                                            <span className="text-xs text-gray-500">{hours.user_name}</span>
                                            <span className="text-sm text-gray-900">{new Date(hours.start_time).toLocaleTimeString()} - {new Date(hours.end_time).toLocaleTimeString()}</span>
                                            <span className="text-xs text-gray-500">{hours.notes}</span>
                                        </div>
                                    ))}
                                </div>
                            </dl>
                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
                            <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-gray-400">
                                {t('uploadPhotos')}
                            </h2>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 px-4 py-6 text-sm text-gray-500 transition-colors hover:border-blue-300 hover:bg-blue-50/50">
                                    <Upload className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    <span>{photos && photos.length > 0 ? `${photos.length} ${t('filesSelected')}` : t('choosePhotos')}</span>
                                    <input type="file" multiple className="hidden" onChange={(e) => setPhotos(e.target.files)} />
                                </label>
                                <button
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-950 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-900"
                                    onClick={() => uploadPhotos()}
                                >
                                    <Upload className="h-4 w-4" aria-hidden="true" />
                                    {t('save')}
                                </button>
                            </div>
                            {success && <p className="mt-2 text-sm text-green-600">{t('uploadSuccess')}</p>}
                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
                            <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-gray-400">
                                {t('uploadedPhotos')}
                            </h2>
                            {uploadedPhotos.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 py-16 text-center">
                                    <ImageIcon className="h-8 w-8 text-gray-300" aria-hidden="true" />
                                    <p className="text-sm text-gray-400">{t('noPhotos')}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {uploadedPhotos.map((photo) => (
                                        <a href={photo.url} target="_blank" key={photo.url}>
                                            <img src={photo.url || "/placeholder.svg"} alt="task photo" className="aspect-square w-full rounded-xl object-contain shadow-md" />
                                        </a>
                                    ))}
                                </div>
                            )}
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