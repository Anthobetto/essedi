'use client'
import { useParams } from "next/navigation"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Upload, ImageIcon } from "lucide-react"

export default function TaskId() {
    const { id } = useParams()
    const router = useRouter()
    const [task, setTask] = useState<{ id: number, project_id: number, project_name: string, name: string, company_name: string, user_id: number, status: string, created_at: string } | null>(null)
    const [photos, setPhotos] = useState<FileList | null>(null)
    const [uploadedPhotos, setUploadedPhotos] = useState<{ url: string }[]>([])

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) { return router.push('/login') }

        const fetchTask = async () => {
            const response = await fetch(`https://essedi-production.up.railway.app/tasks/${id}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` }
            })

            const data = await response.json()
            setTask(data)
        }
        fetchTask()

        const fetchUploadedPhotos = async () => {
            const response = await fetch(`https://essedi-production.up.railway.app/taskPhotos/${id}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` }
            })

            const data = await response.json()
            setUploadedPhotos(data)
        }
        fetchUploadedPhotos()
    }, [])

    const uploadPhotos = async () => {
        const token = localStorage.getItem('token')
        const formData = new FormData()

        if (!photos) return

        formData.append('task_id', id as string)

        for (const file of Array.from(photos)) {
            formData.append('photos', file, file.name)

        }

        const response = await fetch(`https://essedi-production.up.railway.app/taskPhotos`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        })


        const data = await response.json()
        setPhotos(data)
    }

    // Visual-only helper: maps a task status to badge color classes.
    const statusBadgeClasses = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-700'
            case 'in_progress':
                return 'bg-blue-100 text-blue-700'
            case 'pending':
                return 'bg-yellow-100 text-yellow-700'
            case 'cancelled':
                return 'bg-red-100 text-red-700'
            default:
                return 'bg-gray-100 text-gray-600'
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                {task ? (
                    <div className="flex flex-col gap-6">
                        {/* Header */}
                        <div className="flex flex-col gap-2">
                            <button onClick={() => router.back()} className="text-sm text-blue-950 hover:underline text-left">
                                ← Back
                            </button>
                            <h1 className="text-2xl font-semibold tracking-tight text-blue-950 text-balance">
                                {task.name}
                            </h1>
                            <p className="text-sm text-gray-500">Task details and photo documentation</p>
                        </div>

                        {/* Task info card */}
                        <div className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
                            <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-gray-400">
                                Task Information
                            </h2>
                            <dl className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                                <div className="flex flex-col gap-1">
                                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Name</dt>
                                    <dd className="text-sm font-medium text-gray-900">{task.name}</dd>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Project</dt>
                                    <dd className="text-sm font-medium text-gray-900">{task.project_name}</dd>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Client</dt>
                                    <dd className="text-sm font-medium text-gray-900">{task.company_name}</dd>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Status</dt>
                                    <dd>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadgeClasses(
                                                task.status,
                                            )}`}
                                        >
                                            {task.status.replace('_', ' ')}
                                        </span>
                                    </dd>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Date</dt>
                                    <dd className="text-sm font-medium text-gray-900">
                                        {new Date(task.created_at).toLocaleDateString()}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Upload photos card */}
                        <div className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
                            <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-gray-400">
                                Upload Photos
                            </h2>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 px-4 py-6 text-sm text-gray-500 transition-colors hover:border-blue-300 hover:bg-blue-50/50">
                                    <Upload className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    <span>{photos && photos.length > 0 ? `${photos.length} file(s) selected` : 'Choose photos to upload'}</span>
                                    <input
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => setPhotos(e.target.files)}
                                    />
                                </label>
                                <button
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-950 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                    onClick={() => uploadPhotos()}
                                >
                                    <Upload className="h-4 w-4" aria-hidden="true" />
                                    Save
                                </button>
                            </div>
                        </div>

                        {/* Uploaded photos card */}
                        <div className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
                            <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-gray-400">
                                Uploaded Photos
                            </h2>
                            {uploadedPhotos.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 py-16 text-center">
                                    <ImageIcon className="h-8 w-8 text-gray-300" aria-hidden="true" />
                                    <p className="text-sm text-gray-400">No photos yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {uploadedPhotos.map((photo) => (
                                        <a href={photo.url} target="_blank">
                                            <img
                                                key={photo.url}
                                                src={photo.url || "/placeholder.svg"}
                                                alt="task photo"
                                                className="aspect-square w-full rounded-xl object-contain shadow-md"
                                            />
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