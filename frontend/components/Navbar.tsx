"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, Menu, X } from "lucide-react"
import { useTranslations } from "@/lib/i18n"
import { setLocale, getLocale, Locale } from "@/lib/i18n"
import { jwtDecode } from 'jwt-decode'

export default function Navbar() {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const [currentLocale, setCurrentLocale] = useState(getLocale())
  const t = useTranslations('nav')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const decoded = jwtDecode<{ role: string }>(token)
      setRole(decoded.role)
    }
  }, [])

  const navLinks = [
    { href: "/dashboard", label: t('dashboard') },
    ...(role === 'superadmin' || role === 'admin' ? [{ href: "/users", label: t('users') }] : []),
    { href: "/calendar", label: t('calendar') },
    { href: "/clients", label: t('clients') },
    { href: "/projects", label: t('projects') },
    { href: "/services", label: t('services') },
    { href: "/tasks", label: t('tasks') },
  ]

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-blue-900/40 bg-blue-950 text-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/dashboard"
          className="flex items-center transition-opacity hover:opacity-80"
        >
          <img
            src="/logo.png"
            alt="Essedi"
            className="h-9 w-auto rounded-md object-contain"
          />
        </Link>

        <div className="hidden items-center gap-1 md:flex md:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-blue-900 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="ml-1 inline-flex items-center gap-2 rounded-md border border-blue-800 bg-blue-900/40 px-3 py-2 text-sm font-medium text-gray-100 transition-colors hover:border-red-500/60 hover:bg-red-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-950 md:ml-2"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {t('logout')}
          </button>
          <div>
            <select
              value={currentLocale}
              onChange={(e) => {
                setCurrentLocale(e.target.value as Locale)
                setLocale(e.target.value as Locale)
              }}
            >
              <option value='it'>🇮🇹</option>
              <option value='es'>🇦🇷</option>
              <option value='en'>🇬🇧</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-200 transition-colors hover:bg-blue-900 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 md:hidden"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-blue-900/40 bg-blue-950 md:hidden">
          <div className="space-y-1 px-4 py-3 sm:px-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-200 transition-colors hover:bg-blue-900 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setIsOpen(false)
                handleLogout()
              }}
              className="mt-1 inline-flex w-full items-center gap-2 rounded-md border border-blue-800 bg-blue-900/40 px-3 py-2 text-base font-medium text-gray-100 transition-colors hover:border-red-500/60 hover:bg-red-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {t('logout')}
            </button>
            <div>
              <select
                value={currentLocale}
                onChange={(e) => {
                  setCurrentLocale(e.target.value as Locale)
                  setLocale(e.target.value as Locale)
                }}
              >
                <option value='it'>🇮🇹</option>
                <option value='es'>🇦🇷</option>
                <option value='en'>🇬🇧</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}