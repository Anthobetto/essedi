"use client"

import { useState } from "react"
import { useRef } from "react"
import { useEffect } from "react"
import ReactMarkdown from 'react-markdown'

export default function AssistantWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState<{ role: string, content: string }[]>([])
    const messagesEndRef = useRef <HTMLDivElement>(null)

    const saveNewMessage = async () => {
        const token = localStorage.getItem('token')
        setMessages([...messages, { role: 'user', content: input }])
        setInput('')
        const userMessage = { role: 'user', content: input }
        const updatedMessages = [...messages, userMessage]
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assistant`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message: input })
        })

        const data = await response.json()
        setMessages([...updatedMessages, { role: 'assistant', content: data[0] }])
        }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {isOpen && (
                <div className="w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between bg-blue-950 px-4 py-3 text-white">
                        <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900">

                            </span>
                            <div className="flex flex-col leading-tight">
                                <span className="text-sm font-semibold">Essedi Assistant</span>
                                <span className="text-xs text-blue-200">Online</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="rounded-md p-1 text-blue-200 transition-colors hover:bg-blue-900 hover:text-white"
                            aria-label="Close assistant"
                        >
                            __
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex h-64 flex-col gap-3 overflow-y-auto bg-gray-50 px-4 py-4">
                        {messages.map((message, index) => (
                            <div key={index} className={message.role === 'user' ? 'max-w-[80%] self-end rounded-2xl rounded-tl-sm bg-blue-200 px-3 py-2 text-sm text-gray-700 shadow-sm' : 'max-w-[80%] self-start rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-sm text-gray-700 shadow-sm'}>
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="flex items-center gap-2 border-t border-gray-200 bg-white px-3 py-3">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-800 outline-none transition-colors focus:border-blue-950 focus:bg-white"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-950 text-white transition-colors hover:bg-blue-900"
                            aria-label="Send message"
                            onClick={() => saveNewMessage()}
                        >
                            →
                        </button>
                    </div>
                </div>
            )}

            {/* Floating toggle button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-950 text-white shadow-lg transition-all hover:bg-blue-900 hover:shadow-xl"
                aria-label={isOpen ? "Close assistant" : "Open assistant"}
            >
                {isOpen ? (
                    <h2 onClick={() => {setMessages([]); setIsOpen(false)}}>X</h2>
                ) : (
                    <h2>AI</h2>
                )}
            </button>
        </div>
    )
}