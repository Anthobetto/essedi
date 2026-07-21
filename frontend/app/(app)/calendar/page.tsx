'use client'
import FullCalendar from "@fullcalendar/react";
import themePlugin from "@fullcalendar/react/themes/monarch";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import timeGridPlugin from '@fullcalendar/react/timegrid'
import listPlugin from '@fullcalendar/react/list'
import multiMonthPlugin from '@fullcalendar/react/multimonth'
import esLocale from '@fullcalendar/react/locales/es'
import itLocale from '@fullcalendar/react/locales/it'

import '@fullcalendar/react/skeleton.css';
import '@fullcalendar/react/themes/monarch/theme.css';
import '@fullcalendar/react/themes/monarch/palettes/blue.css';
import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getLocale } from "@/lib/i18n";


export default function Calendar() {
  const router = useRouter()
  const [tasks, setTasks] = useState<{ id: number, project_id: number, project_name: string, name: string, company_name: string, user_id: number, status: string, created_at: string, due_date: string | null }[]>([])
  const locale = getLocale()
  const [currentLocale, setCurrentLocale] = useState('it')


  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    }

    setCurrentLocale(getLocale())

    const fetchEvents = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()
      setTasks(data)
    }

    fetchEvents()
  }, [])

  return (
    <FullCalendar
      locales={[esLocale, itLocale]}
      locale={currentLocale}
      plugins={[themePlugin, dayGridPlugin, timeGridPlugin, listPlugin, multiMonthPlugin]}
      headerToolbar={{
        start: 'today prev,next title',
        end: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek,multiMonthYear',
      }}

      initialView="dayGridMonth"
      events={tasks.map((event) => ({ title: event.name, date: event.due_date || event.created_at, id: event.id.toString() }))}
    />
  );
}