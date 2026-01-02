'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import { createInsuranceForm } from '../api';

// --- Types ---

interface FormData {
    supplierName: string;
    supplierAddress: string;
    placeOfSupply: string;
    buyerName: string;
    buyerAddress: string;
    itemName: string;
    hsn: string;
    quantity: string | number;
    rate: string | number;
    vehicleNumber: string;
    cashOrCommission: string;
    notes: string;
}

interface QuestionText {
    en: string;
    hi: string;
}

interface Question {
    field: keyof FormData | 'language' | 'weightmentSlip';
    type: 'text' | 'number' | 'language' | 'file';
    text: QuestionText;
    optional?: boolean;
    step?: string;
}

interface Message {
    text: string;
    sender: 'bot' | 'user';
}

// --- Constants ---

const questions: Question[] = [
    {
        field: 'language',
        type: 'language',
        text: {
            en: "Bhasha / Language\nType 1 - English\nType 2 - Hindi",
            hi: "भाषा चुनें \nType 1 - English\nType 2 - Hindi"
        }
    },
    {
        field: 'supplierName',
        type: 'text',
        text: {
            en: "Supplier Kaun",
            hi: "माल भेजने वाला"
        }
    },
    {
        field: 'supplierAddress',
        type: 'text',
        text: {
            en: "Place of Supply/Supply kahan se",
            hi: "भेजने वाले का पता"
        }
    },
    {
        field: 'buyerName',
        type: 'text',
        text: {
            en: "Party Ka Naam",
            hi: "पार्टी का नाम"
        }
    },
    {
        field: 'buyerAddress',
        type: 'text',
        text: {
            en: "Party Address",
            hi: "पार्टी का पता"
        }
    },
    {
        field: 'itemName',
        type: 'text',
        text: {
            en: "Item Kya hai",
            hi: "आइटम का नाम"
        }
    },
    {
        field: 'quantity',
        type: 'number',
        step: "0.01",
        text: {
            en: "Kitna Maal",
            hi: "कुल मात्रा/QTY"
        }
    },
    {
        field: 'rate',
        type: 'number',
        step: "0.01",
        text: {
            en: "Kya Bhaav Lgaya",
            hi: "रेट/भाव"
        }
    },
    {
        field: 'vehicleNumber',
        type: 'text',
        text: {
            en: "Gaadi No.",
            hi: "गाड़ी नंबर"
        }
    },
    {
        field: 'notes',
        type: 'text',
        optional: true,
        text: {
            en: "Cash ya Commission",
            hi: "नकद या कमीशन"
        }
    },
    {
        field: 'weightmentSlip',
        type: 'file',
        optional: true,
        text: {
            en: "Kanta Parchi Photo",
            hi: "कांटा पर्ची"
        }
    },
];

/* ---------------- COMPONENT ---------------- */

const InsuranceIOS = () => {
    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textInputRef = useRef<HTMLInputElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState<FormData>({
        supplierName: '',
        supplierAddress: '',
        placeOfSupply: '',
        buyerName: '',
        buyerAddress: '',
        itemName: 'Tender Coconut',
        hsn: '08011910',
        quantity: '',
        rate: '',
        vehicleNumber: '',
        cashOrCommission: '',
        notes: '',
    });

    const [weightmentSlip, setWeightmentSlip] = useState<File | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [inputValue, setInputValue] = useState<string>('');
    const [language, setLanguage] = useState<'en' | 'hi' | null>(null);
    const [messages, setMessages] = useState<Message[]>([
        { text: questions[0].text.en, sender: 'bot' },
    ]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [viewportHeight, setViewportHeight] = useState<string>('100vh');
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const viewportRef = useRef<HTMLDivElement>(null);
    const lastHeight = useRef<number>(0);

    // Handle viewport height changes (mobile keyboard) with Visual Viewport API
    useEffect(() => {
        if (typeof window === 'undefined' || !('visualViewport' in window)) return;

        const visualViewport = window.visualViewport!;

        const updateViewport = () => {
            const newHeight = visualViewport.height;
            const offsetTop = visualViewport.offsetTop;

            // Only update if height changed significantly (more than 1px)
            if (Math.abs(newHeight - lastHeight.current) > 1) {
                lastHeight.current = newHeight;
                setViewportHeight(`${newHeight}px`);

                // Check if keyboard is visible
                const keyboardVisible = newHeight < window.innerHeight * 0.7;
                if (keyboardVisible !== isKeyboardVisible) {
                    setIsKeyboardVisible(keyboardVisible);

                    // Scroll to bottom when keyboard appears
                    if (keyboardVisible) {
                        setTimeout(() => {
                            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                    }
                }
            }

            // Apply transform to handle viewport offset
            if (viewportRef.current) {
                viewportRef.current.style.transform = `translateY(${offsetTop}px)`;
            }
        };

        const handleScroll = (e: Event) => {
            // Prevent rubber-banding effect
            if (visualViewport.pageTop > 0) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'auto' });
                return false;
            }
            return true;
        };

        // Initial setup
        updateViewport();

        // Add event listeners with passive: false to allow preventDefault
        visualViewport.addEventListener('resize', updateViewport);
        visualViewport.addEventListener('scroll', updateViewport);
        window.addEventListener('scroll', handleScroll, { passive: false });

        return () => {
            visualViewport.removeEventListener('resize', updateViewport);
            visualViewport.removeEventListener('scroll', updateViewport);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isKeyboardVisible]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const currentQuestion = questions[currentQuestionIndex];
    const isFileInput = currentQuestion.type === 'file';

    const submitInsuranceForm = async (fileArgument: File | null = null) => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        setMessages(prev => [
            ...prev,
            { text: 'Submitting details...', sender: 'bot' },
        ]);

        try {
            const submitData = new FormData();

            // Add user ID from localStorage if available
            const userData = localStorage.getItem('user');
            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    if (user.id) {
                        submitData.append('userId', user.id);
                    }
                } catch (e) {
                    console.error('Error parsing user data from localStorage', e);
                }
            }

            // --- 1. GENERATED FIELDS ---
            submitData.append('invoiceNumber', `INV-${Date.now()}`);
            submitData.append('invoiceDate', new Date().toISOString());
            submitData.append('placeOfSupply', formData.supplierAddress || 'State');

            // --- 2. ARRAY FIELDS (Use [] suffix) ---
            const supAddr = formData.supplierAddress || 'Unknown Address';
            submitData.append('supplierAddress[]', supAddr);

            const buyAddr = formData.buyerAddress || 'Unknown Address';
            submitData.append('billToAddress[]', buyAddr);
            submitData.append('shipToAddress[]', buyAddr);

            const prodName = formData.itemName || 'Item';
            submitData.append('productName', prodName);

            // --- 3. STRING FIELDS ---
            submitData.append('supplierName', formData.supplierName || 'Unknown Supplier');
            submitData.append('billToName', formData.buyerName || 'Unknown Buyer');
            submitData.append('shipToName', formData.buyerName || 'Unknown Buyer');

            // --- 4. NUMERIC FIELDS ---
            const qty = formData.quantity ? Number(formData.quantity) : 0;
            const rate = formData.rate ? Number(formData.rate) : 0;
            const amount = qty * rate;

            submitData.append('quantity', String(qty));
            submitData.append('rate', String(rate));
            submitData.append('amount', String(amount));

            // --- 5. OPTIONAL FIELDS ---
            if (formData.vehicleNumber) {
                submitData.append('vehicleNumber', formData.vehicleNumber);
                submitData.append('truckNumber', formData.vehicleNumber);
            }
            if (formData.hsn) submitData.append('hsnCode', formData.hsn);
            if (formData.notes) submitData.append('weighmentSlipNote', formData.notes);

            // --- 6. FILE UPLOAD ---
            const finalFile = fileArgument || weightmentSlip;
            if (finalFile) {
                submitData.append('weighmentSlips', finalFile);
            }

            // Call API with proper error handling
            let invoice;
            try {
                invoice = await createInsuranceForm(submitData);
            } catch (error) {
                console.error('Error creating invoice:', error);
                throw new Error('Failed to create invoice. Please try again.');
            }

            // Handle response
            const rawPdfUrl = invoice.pdfUrl || invoice.pdfURL;

            setMessages(prev => [
                ...prev,
                { text: 'Success! Invoice created.', sender: 'bot' }
            ]);

            if (rawPdfUrl) {
                const finalLink = rawPdfUrl.startsWith('http')
                    ? rawPdfUrl
                    : `http://localhost:3000${rawPdfUrl}`;

                window.location.href = finalLink;
            } else {
                setMessages(prev => [
                    ...prev,
                    { text: 'PDF is generating... Redirecting to My Forms.', sender: 'bot' }
                ]);
                setTimeout(() => {
                    router.push("/home");
                }, 2000);
            }

        } catch (err: any) {
            console.error(err);
            let errorMsg = 'Submission failed.';
            if (err.message) {
                if (Array.isArray(err.message)) {
                    errorMsg = err.message.join(', ');
                } else {
                    errorMsg = err.message;
                }
            }
            setMessages(prev => [
                ...prev,
                { text: errorMsg, sender: 'bot' },
            ]);
            setIsSubmitting(false);
        }
    };

    /* ========================= FLOW ========================= */
    const getQuestionText = (question: Question) => {
        return language ? question.text[language] : question.text.en;
    };

    const goToNextQuestion = () => {
        const currentQuestion = questions[currentQuestionIndex];

        // Skip itemName and hsn questions as they have default values
        let nextIndex = currentQuestionIndex + 1;
        if (currentQuestion.field === 'buyerAddress') {
            // After buyerAddress, skip to quantity
            nextIndex = questions.findIndex(q => q.field === 'quantity');

            // Add auto-filled values to messages
            setMessages(prev => [
                ...prev,
                { text: 'Tender Coconut', sender: 'user' },
            ]);
        }

        if (nextIndex < questions.length) {
            setCurrentQuestionIndex(nextIndex);
            const nextQuestion = questions[nextIndex];
            setMessages(prev => [...prev, {
                text: getQuestionText(nextQuestion),
                sender: 'bot'
            }]);

            if (nextQuestion.type === 'file') {
                setTimeout(() => fileInputRef.current?.click(), 300);
            }
        } else {
            submitInsuranceForm();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const q = questions[currentQuestionIndex];
        const currentInput = inputValue.trim();

        // Handle language selection
        if (q.field === 'language') {
            if (currentInput === '1' || currentInput === '2') {
                const selectedLanguage = currentInput === '1' ? 'en' : 'hi';
                const languageName = selectedLanguage === 'en' ? 'English' : 'हिंदी';

                setLanguage(selectedLanguage);
                setMessages(prev => [
                    ...prev,
                    { text: languageName, sender: 'user' },
                    {
                        text: questions[1].text[selectedLanguage],
                        sender: 'bot'
                    }
                ]);
                setInputValue('');
                setCurrentQuestionIndex(1);
                return;
            } else {
                setError('Please type 1 or 2 / कृपया 1 या 2 टाइप करें');
                return;
            }
        }

        if (!q.optional && !currentInput) {
            setError(language === 'hi' ? 'यह फ़ील्ड आवश्यक है' : 'This field is required');
            return;
        }

        setError('');

        // Handle form data updates
        const isFormField = (field: keyof FormData | 'language' | 'weightmentSlip'): field is keyof FormData => {
            return field !== 'language' && field !== 'weightmentSlip';
        };

        if (isFormField(q.field)) {
            const valueToStore = (q.type === 'number' && currentInput)
                ? parseFloat(currentInput)
                : currentInput;
            setFormData(prev => ({ ...prev, [q.field]: valueToStore }));
        }

        setMessages(prev => [...prev, { text: currentInput, sender: 'user' }]);
        setInputValue('');
        goToNextQuestion();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Update state (for UI display if needed later)
        setWeightmentSlip(file);

        setMessages(prev => [...prev, { text: `📎 ${file.name}`, sender: 'user' }]);

        setMessages(prev => [
            ...prev,
            {
                text: language === 'hi'
                    ? 'सबमिट किया जा रहा है...'
                    : 'Submitting...',
                sender: 'bot'
            }
        ]);

        await submitInsuranceForm(file);
    };

    // ... (previous code remains the same)

    return (
        <div
            ref={viewportRef}
            className="fixed top-0 left-0 right-0 flex flex-col bg-gray-50 overflow-hidden"
            style={{
                height: viewportHeight,
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y',
                overscrollBehavior: 'none',
                transform: 'translateZ(0)'
            }}
        >
            {/* WhatsApp Header - Fixed Height */}
            <div className="bg-[#075E54] text-white px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between shadow z-10 shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-1 -ml-1 sm:-ml-2 rounded-full hover:bg-[#128C7E] transition-colors touch-manipulation"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    </button>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full shrink-0">
                        <img className="w-full h-full rounded-full object-cover" src="/images/logo.jpeg" alt="" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-medium leading-none text-sm sm:text-base truncate">Mandi Plus</p>
                        <p className="text-xs opacity-80">online</p>
                    </div>
                </div>
            </div>

            {/* CHAT CONTAINER */}
            <div
                className="flex-1 overflow-y-auto p-4 space-y-4"
                style={{
                    backgroundImage: 'url("/images/whatsapp-bg.png")',
                    backgroundSize: 'contain',
                    backgroundAttachment: 'fixed',
                    WebkitOverflowScrolling: 'touch',
                    overscrollBehavior: 'contain',
                    touchAction: 'pan-y',
                    paddingBottom: isKeyboardVisible ? 'env(safe-area-inset-bottom, 20px)' : '0'
                }}
                ref={chatContainerRef}
            >
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg p-3 text-black ${message.sender === 'user'
                                ? 'bg-green-100 rounded-tr-none'
                                : 'bg-white rounded-tl-none'
                                }`}
                        >
                            <p className="whitespace-pre-line">{message.text}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT AREA */}
            <div
                className="border-t bg-white p-3 flex-none"
                style={{
                    paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)',
                    paddingLeft: 'max(env(safe-area-inset-left, 0px), 12px)',
                    paddingRight: 'max(env(safe-area-inset-right, 0px), 12px)'
                }}
            >
                <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-2 rounded-full ${isFileInput ? 'text-green-600' : 'text-gray-400'}`}
                        disabled={!isFileInput || isSubmitting}
                    >
                        <PaperClipIcon className="w-6 h-6" />
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        disabled={!isFileInput || isSubmitting}
                    />

                    <div className="flex-1 relative">
                        <input
                            ref={textInputRef}
                            type={currentQuestion.type === 'number' ? 'number' : 'text'}
                            step={currentQuestion.step}
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            className="w-full border rounded-full px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-[16px] text-black"
                            style={{ WebkitAppearance: 'none' }}
                            inputMode={currentQuestion.type === 'number' ? 'decimal' : 'text'}
                            placeholder={
                                currentQuestion.type === 'number'
                                    ? language === 'hi'
                                        ? 'संख्या दर्ज करें...'
                                        : 'Enter a number...'
                                    : language === 'hi'
                                        ? 'अपना उत्तर टाइप करें...'
                                        : 'Type your answer...'
                            }
                            disabled={isFileInput || isSubmitting}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || (!inputValue.trim() && !isFileInput)}
                        className="p-2 bg-green-600 text-white rounded-full disabled:opacity-50"
                    >
                        <ArrowUpIcon className="w-6 h-6" />
                    </button>
                </form>
            </div>

            {error && (
                <div className="fixed bottom-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}
        </div>
    );
};

export default InsuranceIOS;
