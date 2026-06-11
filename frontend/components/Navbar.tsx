'use client'
import Link from "next/link"

export default function Navbar() {

    return (
        <div className="flex justify-between items-center p-4 bg-gray-900 text-white">
            <span>
            <Link href="/home">Essedi</Link>
            </span>
            <span className="flex gap-6">
            <Link href="/dashboard" className="hover:text-gray-300">Dashboard</Link>
            <Link href="/clients" className="hover:text-gray-300">Clients</Link>
            <Link href="/projects" className="hover:text-gray-300">Projects</Link>
            <Link href="/services" className="hover:text-gray-300">Services</Link>
            <Link href="/tasks" className="hover:text-gray-300">Tasks</Link>
            </span>
        </div>
    )
}