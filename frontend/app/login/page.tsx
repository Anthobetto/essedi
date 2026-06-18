'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"


export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const router = useRouter()

    const handleLogin = async () => {
        const response = await fetch('http://localhost:4821/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        })
        const data = await response.json()
        localStorage.setItem('token', data.token)
        router.push('/dashboard')
    }

    return (
        <div className="flex justify-center m-5 p-5">
            <div className=" bg-gray-100 p-3 rounded-2xl">
                <form action="/send/">
                    <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                    <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" className="bg-amber-200 px-4 py-2 rounded-2xl" onClick={handleLogin}>Login</button>
                </form>
            </div>
        </div>
    )
}