'use client';    
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Client-side only component for device detection
function InsuranceWrapper() {
    const [isIOS, setIsIOS] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // This code runs only on the client side
        const userAgent = window.navigator.userAgent;
        const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
        const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);

        // Check if it's iOS Safari (not Chrome/Firefox on iOS)
        const isIOSSafari = isIOSDevice && isSafari;

        setIsIOS(isIOSSafari);
        setIsMounted(true);
    }, []);

    // Use dynamic imports to avoid SSR for the components
    const Insurance = dynamic(
        () => import('@/features/insurance/pages/Insurance'),
        { ssr: false }
    );

    const InsuranceIOS = dynamic(
        () => import('@/features/insurance/pages/InsuranceIOS'),
        { ssr: false }
    );

    // Don't render anything until we know the device type
    if (!isMounted) {
        return null;
    }

    return isIOS ? <InsuranceIOS /> : <Insurance />;
}

export default function InsurancePage() {
    return <InsuranceWrapper />;
}