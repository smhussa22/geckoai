"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LoadingPage from "./components/LoadingPage";

export default function LoadingWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (loading) {
            const timer = setTimeout(() => setLoading(false), 1500);
            return () => clearTimeout(timer);
        }

        const isMajorRoute =
            pathname?.startsWith("/auth") ||
            pathname?.startsWith("/checkout") ||
            pathname?.startsWith("/plus");

        if (isMajorRoute) {
            setLoading(true);
            const timer = setTimeout(() => setLoading(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [pathname]);

    return (
        <>
            {children}

            <AnimatePresence>
                {loading && (
                    <motion.div
                        key="loading-overlay"
                        className="fixed inset-0 z-50 bg-night flex items-center justify-center"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <LoadingPage />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
