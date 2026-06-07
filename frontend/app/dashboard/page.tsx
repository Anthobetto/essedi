'use client'
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Dashboard() {
    const router = useRouter()
    const [user, setUser] = useState<{name: string, email: string} | null>(null)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
        }

        const fetchUser = async () => {
            const response = await fetch('http://localhost:4821/users/me', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            setUser(data)

        }
        fetchUser()

    }, [])

    return (
        <div>
            {user && <h1>Hola, {user.name}</h1>}
        </div>
    )
}