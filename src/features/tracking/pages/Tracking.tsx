'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpIcon } from '@heroicons/react/24/outline';
import { trackVehicle } from '@/features/tracking/api'; 

// --- Types ---
interface Message {
    text: string;
    sender: 'bot' | 'user';
    isLocation?: boolean;
}

const TrackingPage = () => {
    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // --- State ---
    const [messages, setMessages] = useState<Message[]>([
        {
            text: 'Please enter your vehicle number to track your delivery 🚚',
            sender: 'bot'
        }
    ]);
    const [inputValue, setInputValue] = useState<string>('');
    const [isMounted, setIsMounted] = useState(false);

    // --- Effects ---

    // Handle hydration
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // --- Handlers ---

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        // 1. Add User Message
        const vehicleNum = inputValue; // Capture value before clearing
        setMessages(prev => [...prev, { text: vehicleNum, sender: 'user' }]);
        setInputValue('');

        // 2. Add "Searching..." bot message
        setMessages(prev => [...prev, { text: 'Searching for vehicle...', sender: 'bot' }]);

        try {
            // 3. Call Real API
            const response = await trackVehicle(vehicleNum);

            // 4. Format the success response
            const locationMsg = `Current Location: ${response.data.currentLocation}\n\nStatus: ${response.data.status}`;

            setMessages(prev => [
                ...prev,
                {
                    text: locationMsg,
                    sender: 'bot',
                    isLocation: true // Keeps your Map link logic working
                }
            ]);
        } catch (err: any) {
            // 5. Handle Error (Vehicle not found, server error, etc.)
            setMessages(prev => [
                ...prev,
                {
                    text: err.message || "Could not track this vehicle. Please check the number.",
                    sender: 'bot'
                }
            ]);
        }
    };

    const formatMessage = (text: string) => {
        if (!text) return null;
        // Split by newlines and map to paragraphs
        return text.split('\n').map((line, i) => (
            <p key={i} className="mb-1">{line}</p>
        ));
    };

    // Prevent hydration mismatch
    if (!isMounted) return null;

    return (
        <div className="flex flex-col h-screen bg-[#efeae2]">
            {/* WhatsApp Header */}
            <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shadow z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/home')}
                        className="text-white p-1 -ml-2 rounded-full hover:bg-[#128C7E] transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <div>
                        <p className="font-medium leading-none">Track Your Delivery</p>
                        <p className="text-xs opacity-80">Mandi Plus</p>
                    </div>
                </div>
                {/* Optional Phone Icon */}
                <div className="p-2 rounded-full hover:bg-[#128C7E] transition-colors cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                </div>
            </div>

            {/* Chat Container */}
            <div
                className="flex-1 overflow-y-auto px-4 py-3 space-y-3 relative"
                style={{
                    backgroundColor: "#E5DDD5",
                    backgroundImage: "url('/images/whatsapp-bg.png')",
                    backgroundRepeat: 'repeat',
                }}
            >
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[75%] px-3 py-2 text-sm rounded-lg shadow-sm ${message.sender === 'user'
                                    ? 'bg-[#dcf8c6] rounded-br-none text-black'
                                    : 'bg-white rounded-bl-none text-black'
                                }`}
                        >
                            <div className="text-gray-800">
                                {formatMessage(message.text)}
                                {message.isLocation && (
                                    <a
                                        href="https://maps.google.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline block mt-1 text-sm font-medium"
                                    >
                                        View on Google Maps
                                    </a>
                                )}
                            </div>
                            <div className="text-right mt-1">
                                <span className="text-[10px] text-gray-500 opacity-70">
                                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-[#f0f0f0] px-3 py-2 border-t z-10">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Enter vehicle number..."
                        className="flex-1 rounded-full px-4 py-2 text-sm focus:outline-none bg-white text-black border border-gray-200"
                    />
                    <button
                        type="submit"
                        className="bg-[#25D366] p-2 rounded-full text-white hover:bg-[#20bd5a] shadow-sm transition-colors"
                    >
                        <ArrowUpIcon className="h-5 w-5 text-white" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TrackingPage;