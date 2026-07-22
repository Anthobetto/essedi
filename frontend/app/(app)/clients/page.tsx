'use client'
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useTranslations } from "@/lib/i18n"
import { Trash2, Loader2, Pencil } from "lucide-react"
import { jwtDecode } from 'jwt-decode'

export default function Clients() {
    const router = useRouter()
    const t = useTranslations('clients')
    const [clients, setClients] = useState<{ id: number, company_name: string, contact_name: string, email: string, phone: string, address: string }[]>([])
    const [editingClient, setEditingClient] = useState<{ id: number, company_name: string, contact_name: string, email: string, phone: string, address: string } | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [currentUserRole, setCurrentUserRole] = useState('')
    const [name, setName] = useState('')
    const [contact, setContact] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [loading, setLoading] = useState(true)


    const fetchClients = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            setClients(data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) { return router.push('/login') }

        fetchClients()

        const decoded = jwtDecode<{ role: string }>(token)
        setCurrentUserRole(decoded.role)
    }, [])

    const saveNewClient = async () => {
        const token = localStorage.getItem('token')
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ company_name: name, contact_name: contact, email, phone, address })
        })

        setIsOpen(false)
        fetchClients()
    }

    const deleteClient = async (id: number) => {
        const token = localStorage.getItem('token')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!response.ok) {
            alert(t('deleteError'))
            return
        }
        setClients(clients.filter(c => c.id !== id))
    }

    const editClient = async (id: number) => {
        const token = localStorage.getItem('token')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ company_name: name, contact_name: contact, email, phone, address })
        })
        const data = await response.json()
        setClients(clients.map(c => c.id === id ? data : c))
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
                                    placeholder={t('clientName')}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full rounded-md border border-gray-100 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-950 focus:ring-1 focus:ring-blue-950"
                                />
                                <input
                                    placeholder={t('contactName')}
                                    onChange={(e) => setContact(e.target.value)}
                                    className="w-full rounded-md border border-gray-100 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-950 focus:ring-1 focus:ring-blue-950"
                                />
                                <input
                                    type="email"
                                    placeholder={t('email')}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-md border border-gray-100 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-950 focus:ring-1 focus:ring-blue-950"
                                />
                                <input
                                    placeholder={t('phone')}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full rounded-md border border-gray-100 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-950 focus:ring-1 focus:ring-blue-950"
                                />
                                <input
                                    placeholder={t('address')}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full rounded-md border border-gray-100 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-950 focus:ring-1 focus:ring-blue-950"
                                />
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    className="rounded-md border border-gray-100 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                    onClick={() => {
                                        setIsOpen(false)
                                        setEditingClient(null)
                                    }}
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    className="rounded-md bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
                                    onClick={() => {
                                        editingClient ? editClient(editingClient.id) : saveNewClient()
                                        setEditingClient(null)
                                    }}
                                >
                                    {t('save')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-950" />
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50">
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('clientName')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('contactName')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('email')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('phone')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('address')}</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"></th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"></th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {clients.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">
                                                {t('empty')}
                                            </td>
                                        </tr>
                                    ) : (
                                        clients.map((client) => (
                                            <tr key={client.id} className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50">
                                                <td className="px-4 py-3 text-left text-sm font-medium text-gray-900">{client.company_name}</td>
                                                <td className="px-4 py-3 text-left text-sm text-gray-600">{client.contact_name}</td>
                                                <td className="px-4 py-3 text-left text-sm text-gray-600">{client.email}</td>
                                                <td className="px-4 py-3 text-left text-sm text-gray-600">{client.phone}</td>
                                                <td className="px-4 py-3 text-left text-sm text-gray-600">{client.address}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        {currentUserRole === 'superadmin' && (
                                                            <Pencil
                                                                className="h-4 w-4 cursor-pointer text-blue-600"
                                                                onClick={() => {
                                                                    setEditingClient(client)
                                                                    setName(client.company_name || '')
                                                                    setContact(client.contact_name || '')
                                                                    setEmail(client.email || '')
                                                                    setPhone(client.phone || '')
                                                                    setAddress(client.address || '')
                                                                    setIsOpen(true)
                                                                }}
                                                            />
                                                        )}
                                                        {currentUserRole === 'superadmin' && (
                                                            <Trash2
                                                                className="h-4 w-4 cursor-pointer text-red-600"
                                                                onClick={() => {
                                                                    const confirmed = confirm(t('deleteConfirm'))
                                                                    if (confirmed) deleteClient(client.id)
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