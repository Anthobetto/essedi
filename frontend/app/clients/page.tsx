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
            const response = await fetch('http://localhost:4821/clients', {
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
        const response = await fetch('http://localhost:4821/clients', {
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
        <div>
            <div className="text-right p-6">
                <span className="bg-amber-600 p-3 rounded-2xl">
                    <button onClick={() => setIsOpen(true)}>New Client</button>
                </span>
            </div>
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6  flex flex-col gap-4">
                        <h2>New Client</h2>
                        <input placeholder="Client Name" onChange={(e) => setName(e.target.value)} />
                        <input placeholder="Contact Name" onChange={(e) => setContact(e.target.value)} />
                        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                        <input placeholder="Phone" onChange={(e) => setPhone(e.target.value)} />
                        <input placeholder="Address" onChange={(e) => setAddress(e.target.value)} />
                        <div className="flex gap-8 justify-between">
                            <button className="bg-red-400  rounded-2xl py-2 px-" onClick={() => setIsOpen(false)}>Cancel</button>
                            <button className="bg-green-600 rounded-2xl py-3 px-4" onClick={() => saveNewClient()}>Save</button>
                        </div>
                    </div>
                </div>
            )}
            <div>
                <div className="flex flex-col md:flex-row gap-8">
                    <table className="w-full border border-collapse">
                        <thead className="bg-amber-100">
                            <tr>
                                <th className="text-left py-3 px-4">Name</th>
                                <th className="text-left py-3 px-4">Contact Name</th>
                                <th className="text-left py-3 px-4">Email</th>
                                <th className="text-left py-3 px-4">Phone</th>
                                <th className="text-left py-3 px-4">Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map((client) => (
                                <tr key={client.id}>
                                    <td className="text-left py-3 px-4">{client.company_name}</td>
                                    <td className="text-left py-3 px-4">{client.contact_name}</td>
                                    <td className="text-left py-3 px-4">{client.email}</td>
                                    <td className="text-left py-3 px-4">{client.phone}</td>
                                    <td className="text-left py-3 px-4">{client.address}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}