'use client'
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Services() {
    const router = useRouter()
    const [services, setServices] = useState<{ id: number, name: string, code: string, price: number, vat: number | null }[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [name, setName] = useState('')
    const [code, setCode] = useState('')
    const [price, setPrice] = useState('')
    const [vat, setVat] = useState(0)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) { return router.push('/login') }

        const fetchServices = async () => {
            const response = await fetch('http://localhost:4821/services', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            const data = await response.json()
            setServices(data)
        }

        fetchServices()
    }, [])

    const saveNewService = async () => {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:4821/services', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` },
            body: JSON.stringify({name, code, price: price ? parseInt(price) : null, vat})
        })
        const data = await response.json()
        setServices([...services, data])
        setIsOpen(false)

    }
    return (
        <div>
            <div className="text-right p-6">
                <span className="bg-amber-600 p-3 rounded-2xl">
                    <button onClick={() => setIsOpen(true)}>New Service</button>
                </span>
            </div>
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6  flex flex-col gap-4">
                        <h2>New Service</h2>
                        <input placeholder="Service Name" onChange={(e) => setName(e.target.value)} />
                        <input placeholder="Code" onChange={(e) => setCode(e.target.value)} />
                        <input type="number" placeholder="Price" onChange={(e) => setPrice(e.target.value)} />
                        <select onChange={(e) => setVat(Number(e.target.value))}>
                            <option value="4">4 %</option>
                            <option value="10">10 %</option>
                            <option value="10">22 %</option>
                        </select>
                        <div className="flex gap-8 justify-between">
                            <button className="bg-red-400  rounded-2xl py-3 px-4" onClick={() => setIsOpen(false)}>Cancel</button>
                            <button className="bg-green-600 rounded-2xl py-2 px-3" onClick={() => saveNewService()}>Save</button>
                        </div>
                    </div>
                </div>
            )}
            <div>
                <div className="flex flex-col md:flex-row gap-8">
                    <table className="w-full border border-collapse">
                        <thead className="bg-amber-100">
                            <tr>
                                <th className="text-left py-2 px-3">Name</th>
                                <th className="text-left py-2 px-3">Code</th>
                                <th className="text-left py-2 px-3">Price</th>
                                <th className="text-left py-2 px-3">VAT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map((service) => (
                                <tr key={service.id}>
                                    <td className="text-left py-2 px-3">{service.name}</td>
                                    <td className="text-left py-2 px-3">{service.code}</td>
                                    <td className="text-left py-2 px-3">{service.price}</td>
                                    <td className="text-left py-2 px-3">{service.vat}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    )
}