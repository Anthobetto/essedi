'use client'
import { useTranslations } from 'next-intl'
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const t = useTranslations('login')

    const handleLogin = async () => {
        const response = await fetch('https://essedi-production.up.railway.app/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        const data = await response.json()

        if (!response.ok) {
            setError(t('error'))
            return
        }

        localStorage.setItem('token', data.token)
        router.push('/dashboard')
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md">
                <div className="flex items-center justify-center text-2xl font-semibold text-blue-950">
                    <img
                        src="/logo.png"
                        alt="Essedi"
                        className="h-9 w-auto rounded-md object-contain"
                    />
                </div>
                <p className="mt-1 text-center text-sm text-gray-500">{t('subtitle')}</p>

                <div className="mt-6 flex flex-col gap-3">
                    <input
                        type="email"
                        placeholder="Email"
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-md border border-gray-100 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-950 focus:ring-1 focus:ring-blue-950"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-md border border-gray-100 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-950 focus:ring-1 focus:ring-blue-950"
                    />
                </div>

                <button
                    type="button"
                    onClick={handleLogin}
                    className="mt-6 w-full rounded-md bg-blue-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-900"
                >
                    {t('button')}
                </button>
                {error && <p className="mt-2 text-center text-sm text-red-500">{error}</p>}
            </div>
        </div>
    )
}