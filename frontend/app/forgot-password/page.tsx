"use client"

import { useState } from "react"
import { Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')

    const handleSubmit = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        })
        const data = await response.json()
        setMessage(data.message)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md">
                {/* Header */}
                <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                        <Mail className="h-6 w-6 text-blue-950" aria-hidden="true" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-semibold tracking-tight text-blue-950">Reset password</h1>
                        <p className="mt-1 text-sm text-gray-500 text-pretty">
                            Enter your email to receive a reset link
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="mt-6 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-950 focus:ring-1 focus:ring-blue-950"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="w-full rounded-md bg-blue-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-950/40 focus-visible:ring-offset-2"
                    >
                        Send reset link
                    </button>

                    {message && (
                        <p className="rounded-md bg-gray-50 px-3 py-2 text-center text-sm text-gray-600 ring-1 ring-inset ring-gray-200">
                            {message}
                        </p>
                    )}
                </div>

                {/* Footer */}
                <Link
                    href="/login"
                    className="mt-6 inline-flex w-full items-center justify-center gap-1 text-sm font-medium text-blue-950 transition-colors hover:underline"
                >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Back to login
                </Link>
            </div>
        </div>
    )
}