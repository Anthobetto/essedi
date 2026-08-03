'use client'
import { Suspense } from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Lock, CheckCircle2, AlertCircle } from "lucide-react"

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async () => {
        setError('')

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword })
        })

        if (!response.ok) {
            setError('Invalid or expired link')
            return
        }

        setSuccess(true)
        setTimeout(() => router.push('/login'), 2000)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
            {success ? (
                <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-md">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                        <CheckCircle2 className="h-6 w-6 text-green-600" aria-hidden="true" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                        Password updated. Redirecting to login...
                    </p>
                </div>
            ) : (
                <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
                    <div className="mb-6 flex flex-col items-center gap-3 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-950">
                            <Lock className="h-6 w-6 text-white" aria-hidden="true" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h1 className="text-2xl font-semibold tracking-tight text-blue-950 text-balance">
                                Reset your password
                            </h1>
                            <p className="text-sm text-gray-500">
                                Enter and confirm your new password below.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                                New password
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                placeholder="New password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-blue-950 focus:ring-1 focus:ring-blue-950"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                                Confirm password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-blue-950 focus:ring-1 focus:ring-blue-950"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700 ring-1 ring-inset ring-red-600/20">
                                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            className="mt-2 w-full rounded-md bg-blue-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-950/40 focus:ring-offset-2"
                        >
                            Reset Password
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function ResetPassword() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    )
}