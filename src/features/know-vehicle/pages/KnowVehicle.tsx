'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpIcon } from '@heroicons/react/24/outline';
import { getVehicleDetails } from '@/features/know-vehicle/api'; // Import the API

// --- Types ---
interface Message {
    text?: string;
    sender: 'bot' | 'user';
    timestamp: Date;
    isQuestion?: boolean;
    hasImage?: boolean;
    imageUrl?: string; // Added to handle dynamic images
}

const KnowVehiclePage = () => {
    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // --- State ---
    const [messages, setMessages] = useState<Message[]>([
        {
            text: 'Please enter your vehicle number 🚗\nकृपया अपना वाहन नंबर दर्ज करें',
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState<string>('');
    const [showButtons, setShowButtons] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // --- Effects ---
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // --- Handlers ---
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isProcessing) return;

        const vehicleNum = inputValue.trim();
        setIsProcessing(true); // Disable input while processing

        // 1. Add User Message
        const userMessage: Message = {
            text: vehicleNum,
            sender: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');

        // 2. Add "Searching..." placeholder
        setMessages(prev => [...prev, { text: '🔍 Checking details...', sender: 'bot', timestamp: new Date() }]);

        try {
            // 3. Call Real API
            const data = await getVehicleDetails(vehicleNum);

            // 4. Format the response text based on API data
            const detailsText = `
Permit – ${data.permitStatus}
परमिट – ${data.permitStatus === 'Active' ? 'एक्टिव' : 'निष्क्रिय'}

Driver License – ${data.driverLicenseStatus}
ड्राइवर लाइसेंस – ${data.driverLicenseStatus === 'Available' ? 'उपलब्ध' : 'अनुपलब्ध'}

Vehicle Condition – ${data.vehicleCondition}
गाड़ी की स्थिति – ${data.vehicleCondition === 'OK' ? 'ठीक' : 'खराब'}

Challan – ${data.challanStatus}
चालान – ${data.challanStatus}

EMI – ${data.emiStatus}
ईएमआई – ${data.emiStatus}

Vehicle Fitness – ${data.fitnessStatus}
गाड़ी फिटनेस – ${data.fitnessStatus}

✅ ${data.isVerified ? 'You can take **MandiPlus Verified Vehicle**' : 'Vehicle Verification Pending'}
✅ ${data.isVerified ? 'आप **MandiPlus सत्यापित वाहन** ले सकते हैं' : 'वाहन सत्यापन लंबित है'}
            `.trim();

            // 5. Update Chat with Details
            setMessages(prev => {
                const newHistory = prev.slice(0, -1); // Remove "Searching..."
                return [
                    ...newHistory,
                    {
                        text: detailsText,
                        sender: 'bot',
                        timestamp: new Date()
                    },
                    {
                        text: `Want to see your vehicle? 🚚\nक्या आप अपना वाहन देखना चाहते हैं?\nKya aap apna vehicle dekhna chahte hain?`,
                        sender: 'bot',
                        isQuestion: true,
                        timestamp: new Date()
                    }
                ];
            });
            setShowButtons(true);

        } catch (err: any) {
            // Handle Error
            setMessages(prev => {
                const newHistory = prev.slice(0, -1);
                return [
                    ...newHistory,
                    {
                        text: err.message || "❌ Vehicle details not found. Please check the number.",
                        sender: 'bot',
                        timestamp: new Date()
                    }
                ];
            });
            setIsProcessing(false); // Re-enable input so they can try again
        }
    };

    const renderMessageContent = (message: Message) => {
        if (message.hasImage) {
            // Use a placeholder if no specific URL is provided, or the API image
            const imgSource = message.imageUrl || "/images/truck-image.jpg";
            return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={imgSource}
                    alt="Vehicle"
                    className="rounded-lg mt-2 max-w-[200px] sm:max-w-[240px] w-full object-cover"
                />
            );
        }

        return message.text?.split('\n').map((line, idx) => (
            <p key={idx} className="mb-1 min-h-[1.2em]">{line}</p>
        ));
    };

    if (!isMounted) return null;

    return (
        <div className="flex flex-col h-screen bg-[#efeae2]">
            {/* HEADER */}
            <div className="bg-[#075E54] text-white px-3 sm:px-4 py-2.5 sm:py-3 flex items-center shadow z-10">
                <button onClick={() => router.push('/home')} className="mr-2 sm:mr-3 p-1 rounded-full hover:bg-[#128C7E] touch-manipulation">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </button>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">Know Your Vehicle</p>
                    <p className="text-xs opacity-80">Mandi Plus</p>
                </div>
                {/* Header Icons */}
                <div className="flex gap-2 sm:gap-4">
                    <div className="p-1 hover:bg-[#128C7E] rounded-full cursor-pointer touch-manipulation">
                        <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z" />
                            <path d="M3 6a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" />
                        </svg>
                    </div>
                    <div className="p-1 hover:bg-[#128C7E] rounded-full cursor-pointer touch-manipulation">
                        <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* CHAT AREA */}
            <div
                className="flex-1 overflow-y-auto px-2 sm:px-4 py-2 sm:py-3 space-y-2 sm:space-y-3 relative"
                style={{
                    backgroundColor: "#E5DDD5",
                    backgroundImage: "url('/images/whatsapp-bg.png')",
                    backgroundRepeat: 'repeat',
                }}
            >
                {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[85%] sm:max-w-[90%] px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg shadow-sm
                            ${message.sender === 'user'
                                    ? 'bg-[#DCF8C6] rounded-tr-none text-black'
                                    : 'bg-white rounded-tl-none text-black'}`}
                        >
                            <div className="text-gray-800">
                                {renderMessageContent(message)}

                                {message.isQuestion && showButtons && (
                                    <div className="flex gap-2 mt-3 flex-wrap">
                                        <button
                                            className="bg-[#25D366] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm hover:bg-[#20bd5a] transition-colors touch-manipulation"
                                            onClick={() => {
                                                setShowButtons(false);
                                                setMessages(prev => [
                                                    ...prev,
                                                    { text: "Here's your vehicle 🚚", sender: 'bot', timestamp: new Date() },
                                                    // Pass the real image URL from the API if available, else standard image
                                                    { hasImage: true, sender: 'bot', timestamp: new Date() }
                                                ]);
                                                setIsProcessing(false); // Allow new searches
                                            }}
                                        >
                                            Yes / हाँ / Haan
                                        </button>
                                        <button
                                            className="bg-gray-200 text-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm hover:bg-gray-300 transition-colors touch-manipulation"
                                            onClick={() => {
                                                setShowButtons(false);
                                                setIsProcessing(false); // Allow new searches
                                            }}
                                        >
                                            No / नहीं / Nahi
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="text-right mt-1 text-[10px] text-gray-500 opacity-70">
                                {new Date(message.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                                {message.sender === 'user' && ' ✓✓'}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="bg-[#F0F0F0] px-2 sm:px-3 py-2 border-t z-10">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Enter vehicle number..."
                        className="flex-1 rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm focus:outline-none bg-white text-black border border-gray-200"
                        disabled={isProcessing}
                    />
                    <button
                        type="submit"
                        disabled={isProcessing}
                        className={`p-2 sm:p-2.5 rounded-full text-white transition-colors min-w-[40px] sm:min-w-[44px] flex items-center justify-center ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#25D366] hover:bg-[#20bd5a]'
                            }`}
                    >
                        <ArrowUpIcon className="h-5 w-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default KnowVehiclePage;