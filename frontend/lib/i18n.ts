import it from '../messages/it.json'
import en from '../messages/en.json'
import es from '../messages/es.json'
import { useState, useEffect } from 'react'


const messages = { it, en, es }

export type Locale = 'it' | 'en' | 'es'

export function getLocale(): Locale {
    if (typeof window === 'undefined') return 'it'
    return (localStorage.getItem('locale') as Locale) || 'it'
}

export function setLocale(locale: Locale) {
    localStorage.setItem('locale', locale)
    window.location.reload()
}

export function useTranslations(namespace: string) {
    const [locale, setLocaleState] = useState<Locale>('it')
    
    useEffect(() => {
        setLocaleState(getLocale())
    }, [])
    
    const allMessages = messages[locale] as Record<string, Record<string, string>>
    const section = allMessages[namespace] || {}
    
    return (key: string) => section[key] || `${namespace}.${key}`
}