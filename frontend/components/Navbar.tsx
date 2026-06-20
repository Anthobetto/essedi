"use client"

import Link from "next/link"

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clients", label: "Clients" },
  { href: "/projects", label: "Projects" },
  { href: "/services", label: "Services" },
  { href: "/tasks", label: "Tasks" },
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-blue-900/40 bg-blue-950 text-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/home"
          className="text-lg font-semibold tracking-tight transition-colors hover:text-gray-300"
        >
          Essedi
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-blue-900 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}