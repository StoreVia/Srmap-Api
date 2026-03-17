"use client";
import { useIsMobile } from "./useMobile";
import { useState, useEffect, useCallback } from "react";

export const useScrollIndicator = () => {
    const isMobile = useIsMobile();
    const [showScrollIcon, setShowScrollIcon] = useState(true);
    const [scrollingToBottom, setScrollingToBottom] = useState(false);

    const handleScroll = useCallback(() => {
        const scrollPosition = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

        if (scrollPosition > 0 && !scrollingToBottom) {
            setShowScrollIcon(false);
        }

        if (scrollPosition === maxScroll) {
            setScrollingToBottom(true);
        }
    }, [scrollingToBottom]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    const ScrollIndicator = () => (
        <div
            className={`fixed ${isMobile ? 'bottom-24' : 'bottom-8'} left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ${showScrollIcon ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            <svg
                className="size-6 cursor-pointer animate-bounce text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                onClick={() => setShowScrollIcon(false)}
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
            </svg>
        </div>
    );

    return { ScrollIndicator };
};