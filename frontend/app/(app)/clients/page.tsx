'use client'
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Clients() {
    const router = useRouter()
    const [clients, setClients] = useState<{ id: number, company_name: string, contact_name: string, email: string, phone: string, address: string }[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [name, setName] = useState('')
    const [contact, setContact] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) { return router.push('/login') }

        const fetchClients = async () => {
            const response = await fetch('https://essedi-production.up.railway.app/clients', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            const data = await response.json()
            setClients(data)
        }

        fetchClients()
    }, [])

    const saveNewClient = async () => {
        const token = localStorage.getItem('token')
        const response = await fetch('https://essedi-production.up.railway.app/clients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ company_name: name, contact, email, phone, address })
        })
        const data = await response.json()
        setClients([...clients, data])
        setIsOpen(false)
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-blue-950">Clients</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage your client directory</p>
                    </div>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="rounded-md bg-blue-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-900"
                    >
                        New Client
                    </button>
                </div>

                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                            <h2 className="mb-5 text-lg font-semibold text-blue-950">New Client</h2>
                            <div className="flex flex-col gap-3">
                                <input
                                    placeholder="Client Name"
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full rounded-md border border-gray-100 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-950 focus:ring-1 focus:ring-blue-950"
                                />
                                <input
                                    placeholder="Contact Name"
                                    onChange={(e) => setContact(e.target.value)}
                                    className="w-full rounded-md border border-gray-100 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-950 focus:ring-1 focus:ring-blue-950"
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-md border border-gray-100 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-950 focus:ring-1 focus:ring-blue-950"
                                />
                                <input
                                    placeholder="Phone"
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full rounded-md border border-gray-100 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-950 focus:ring-1 focus:ring-blue-950"
                                />
                                <input
                                    placeholder="Address"
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full rounded-md border border-gray-100 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-950 focus:ring-1 focus:ring-blue-950"
                                />
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    className="rounded-md border border-gray-100 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="rounded-md bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
                                    onClick={() => saveNewClient()}
                                >
                                    Save
                                </button>
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
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Contact Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Phone</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">
                                            No clients yet
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
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}