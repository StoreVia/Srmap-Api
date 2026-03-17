"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { motion, useAnimation, Variants } from "framer-motion";
import LogoImg from "../../../../public/icons/round_corner_logo.png";
import AppDownloads from "@/components/page/index/DownloadCard";
import { Sun, Moon, CalendarCheck, Calculator, BarChart2, CheckSquare, QrCode, Clock, LogIn, Calendar, RefreshCw, Presentation } from "lucide-react";

const features = [
    {
        icon: Presentation,
        title: "Empty Classrooms",
        description: "Check which university classes are currently unoccupied.",
        status: "beta",
    },
    {
        icon: CalendarCheck,
        title: "Bunk Management",
        description: "Monitor your attendance and see how many classes you can safely bunk.",
        status: "stable",
    },
    {
        icon: Calculator,
        title: "Future Attendance Calculation",
        description: "Calculate your attendance after attending specific classes to plan ahead.",
        status: "stable",
    },
    {
        icon: BarChart2,
        title: "Bunk Calculation",
        description: "Check attendance if you bunk a certain number of upcoming classes.",
        status: "stable",
    },
    {
        icon: CheckSquare,
        title: "Auto-Submit Feedback",
        description: "Automatically submit your semester feedback forms without touching them.",
        status: "stable",
    },
    {
        icon: QrCode,
        title: "AttendanceCode",
        description: "One-click attendance marking with fast check-in automation.",
        status: "beta",
    },
    {
        icon: Clock,
        title: "24/7 Persistent Login",
        description: "Stay logged in permanently without repeated authentication.",
        status: "stable",
    },
    {
        icon: LogIn,
        title: "Auto Login",
        description: "Automatically logs you in every time you open the website.",
        status: "stable",
    },
    {
        icon: Calendar,
        title: "Smart Timetable",
        description: "View upcoming and ongoing classes with clean real-time UI.",
        status: "stable",
    },
    {
        icon: RefreshCw,
        title: "Auto Updates",
        description: "Data refreshes automatically daily at 1:00 AM after your first login.",
        status: "stable",
    },
];

const pros = [
    {
        title: "Time-Saving",
        description: "Automates login, captcha solving, and feedback submission.",
    },
    {
        title: "Data-Driven Decisions",
        description: "Accurate calculations for better attendance planning.",
    },
    {
        title: "Convenience",
        description: "Persistent login removes repeated authentication.",
    },
    {
        title: "Always Updated",
        description: "Your data stays automatically refreshed.",
    },
    {
        title: "User-Friendly",
        description: "Clean UI made specifically for SRM AP students.",
    },
];

const stagger = {
    initial: { opacity: 0, y: 30 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { staggerChildren: 0.08, duration: 0.6 },
    },
};

const cardMotion: Variants = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 160,
            damping: 18,
        },
    },
};

const float: Variants = {
    initial: { y: 0 },
    animate: {
        y: [0, -6, 0, 4, 0],
        transition: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
};

function IconWrapper({ children, bg }: any) {
    return (
        <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center p-2 transition-colors ${bg}`}
        >
            {children}
        </div>
    );
}

function StatusBadge({ status }: { status: "stable" | "beta" | "development" }) {
    const { theme } = useTheme();

    const styles = {
        stable: theme === "dark"
            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            : "bg-emerald-100 text-emerald-700",
        beta: theme === "dark"
            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
            : "bg-blue-100 text-blue-700",
        development: theme === "dark"
            ? "bg-red-500/20 text-red-300 border border-red-500/30"
            : "bg-red-100 text-red-700"
    };

    return (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${styles[status]}`}>
            {status}
        </span>
    );
}

function FeatureCard({ f, delay }: any) {
    return (
        <motion.div
            variants={cardMotion}
            initial="initial"
            animate="animate"
            transition={{ delay: delay }}
            className="h-full flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
        >
            <div className="flex items-center gap-4 mb-4">
                <IconWrapper bg="bg-black dark:bg-white group-hover:scale-110 transition-transform duration-300">
                    <div className="text-white dark:text-black">
                        {React.createElement(f.icon, { className: "w-6 h-6" })}
                    </div>
                </IconWrapper>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {f.title}
                </h4>
            </div>

            <p className="flex-grow text-gray-600 dark:text-gray-300 leading-relaxed">
                {f.description}
            </p>

            <div className="mt-6 flex items-center justify-between">
                <StatusBadge status={f.status} />
            </div>
        </motion.div>
    );
}

function AnimatedBlob() {
    const { theme } = useTheme();

    return (
        <motion.div
            variants={float}
            initial="initial"
            animate="animate"
            className={`absolute -z-10 w-96 h-96 rounded-3xl filter blur-3xl opacity-70 transition-opacity duration-500
        ${theme === "dark"
                    ? "bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-600/20"
                    : "bg-gradient-to-r from-blue-200/60 via-indigo-200/40 to-pink-200/30"
                }`}
        />
    );
}

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-300"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            <Sun className="w-4 h-4 block dark:hidden" />
            <Moon className="w-4 h-4 hidden dark:block" />
        </motion.button>
    );
}

export default function Landing() {
    const router = useRouter();
    const controls = useAnimation();
    const { theme } = useTheme();

    React.useEffect(() => {
        controls.start("animate");
    }, []);

    return (
        <div className={`min-h-screen transition-colors duration-500 ${theme === "dark"
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-blue-50 via-white to-blue-100"
            }`}>
            <div className="relative overflow-hidden">
                <AnimatedBlob />

                <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md">
                            <Image src={LogoImg} alt="logo" className="w-8 h-8 object-contain" />
                        </div>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
                            className="text-xl font-bold text-gray-900 dark:text-white"
                        >
                            SRMAP API
                        </motion.h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />

                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => router.push("/login")}
                            className="px-4 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-gray-900 font-medium shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            Dashboard
                        </motion.button>
                    </div>
                </nav>

                <main className="container mx-auto px-6 py-12 md:py-24">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                        <div className="md:col-span-7">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                                className="flex items-center gap-2 mb-4"
                            >
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Built for SRM AP Students
                                </span>
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight"
                            >
                                Your Academic
                                <span className="bg-gradient-to-r from-blue-600 to-blue-200 bg-clip-text text-transparent">
                                    {" "}Dashboard
                                </span>
                                , Reimagined
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.8 }}
                                className="mt-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed"
                            >
                                A modern toolkit built for SRM AP students to automate
                                mundane tasks, plan attendance, and never miss a class
                                check-in again.
                            </motion.p>

                            <div className="mt-8 flex gap-4 flex-wrap">
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => router.push("/login")}
                                    className="px-6 py-3 rounded-lg font-medium bg-black text-white dark:bg-white dark:text-gray-900 shadow-sm hover:shadow-md transition-all duration-300"
                                >
                                    Login
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() =>
                                        document
                                            .getElementById("features")
                                            ?.scrollIntoView({ behavior: "smooth" })
                                    }
                                    className="px-6 py-3 rounded-lg bg-blue-600 text-white shadow-sm hover:shadow-md transition-all duration-300"
                                >
                                    Explore Features
                                </motion.button>
                            </div>

                            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {[
                                    "Auto Login",
                                    "Persistent Login",
                                    "Smart Timetable",
                                    "Auto Updates",
                                    "Bunk Calc",
                                    "Feedback Bot",
                                ].map((t, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + i * 0.05 }}
                                        className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm text-gray-700 dark:text-gray-300 text-sm font-medium border border-gray-200 dark:border-gray-700"
                                    >
                                        {t}
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-5 relative">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    delay: 0.5,
                                    type: "spring",
                                    stiffness: 120,
                                    damping: 14,
                                }}
                                className={`w-full h-80 rounded-3xl flex items-center justify-center shadow-2xl ${theme === "dark"
                                    ? "bg-gradient-to-br from-gray-800 to-blue-900/30"
                                    : "bg-gradient-to-br from-blue-100 to-white"
                                    }`}
                            >
                                <div className="origin-top-left transform">
                                    <motion.div
                                        initial={{ rotate: -15, y: -20, opacity: 0 }}
                                        animate={{
                                            rotate: [-15, 6, -4, 3, -2, 1, 0],
                                            y: [-20, 0],
                                            opacity: 1
                                        }}
                                        transition={{
                                            duration: 1.8,
                                            ease: "easeOut"
                                        }}
                                        className="w-64 rounded-xl p-4 shadow-xl bg-card/90 text-card-foreground"
                                        style={{ transformOrigin: "top left" }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold">Data Structures</span>
                                            <span className="text-xl font-bold">82%</span>
                                        </div>

                                        <div className="mt-3">
                                            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                                                <div
                                                    className="h-2 rounded-full bg-blue-600 transition-all"
                                                    style={{ width: "82%" }}
                                                />
                                            </div>
                                            <div className="flex justify-between mt-1 text-xs">
                                                <span>Min: 75%</span>
                                                <span>Current: 82%</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-3">
                                            <div className="bg-muted p-2 rounded">
                                                <p className="text-xs">Present</p>
                                                <p className="text-lg font-bold text-green-600">24</p>
                                            </div>

                                            <div className="bg-muted p-2 rounded">
                                                <p className="text-xs">Absent</p>
                                                <p className="text-lg font-bold text-red-600">5</p>
                                            </div>

                                            <div className="bg-muted p-2 rounded">
                                                <p className="text-xs">Total</p>
                                                <p className="text-lg font-bold">29</p>
                                            </div>

                                            <div className="bg-muted p-2 rounded">
                                                <p className="text-xs">Can Skip</p>
                                                <p className="text-lg font-bold">3</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>

                    </div>
                </main>

                <section id="download" className="container mx-auto px-6 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <AppDownloads />
                    </motion.div>
                </section>
                <section id="features" className="container mx-auto px-6 py-14">
                    <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl font-bold text-center text-gray-900 dark:text-white"
                    >
                        Powerful Features Designed for Students
                    </motion.h3>

                    <motion.div
                        variants={stagger}
                        initial="initial"
                        animate="animate"
                        className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {features.map((f, i) => (
                            <FeatureCard key={i} f={f} delay={0.08 * i} />
                        ))}
                    </motion.div>
                </section>

                <section className="container mx-auto px-6 py-12">
                    <motion.h4
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl font-bold text-center text-gray-900 dark:text-white"
                    >
                        Why Students Love It
                    </motion.h4>

                    <motion.div className="mt-8 grid md:grid-cols-3 gap-6">
                        {pros.map((p, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 + i * 0.06 }}
                                className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                            >
                                <div className="text-xl font-semibold mb-2">{p.title}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {p.description}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* CTA */}
                <section className="container mx-auto px-6 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className={`p-10 rounded-3xl shadow-sm ${theme === "dark"
                            ? "bg-gradient-to-br from-gray-800 to-blue-900/30"
                            : "bg-gradient-to-br from-blue-50 to-white"
                            }`}
                    >
                        <div className="text-center max-w-3xl mx-auto">
                            <motion.h3
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-3xl font-bold text-gray-900 dark:text-white"
                            >
                                Ready To Transform Your Academic Experience?
                            </motion.h3>

                            <div className="mt-6 flex items-center justify-center">
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => router.push("/login")}
                                    className="px-8 py-4 bg-black text-white dark:bg-white dark:text-gray-900 rounded-lg text-lg font-medium shadow-sm hover:shadow-md transition-all duration-300"
                                >
                                    Login to Get Started
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </section>

                <footer className={`py-12 transition-colors duration-500 ${theme === "dark" ? "bg-gray-900/60 text-gray-300" : "bg-blue-50/50 text-gray-600"}`}>
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-3 gap-6 items-start">
                            <div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                        <Image
                                            src={LogoImg}
                                            alt="logo"
                                            className="w-8 h-8 object-contain"
                                        />
                                    </div>
                                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                                        SRMAP API
                                    </div>
                                </div>
                                <div className="mt-6 text-sm">Not affiliated with SRM University AP.</div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">Quick Links</div>
                                <div className="flex flex-col gap-2 text-sm">
                                    <a href="/login" className="hover:underline transition-colors">
                                        Login
                                    </a>
                                    <a href="/privacy" className="hover:underline transition-colors">
                                        Privacy Policy
                                    </a>
                                    <a href="/terms" className="hover:underline transition-colors">
                                        Terms And Conditions
                                    </a>
                                </div>
                            </div>

                            <div className="text-sm">
                                <div className="font-semibold text-gray-900 dark:text-white">Contact</div>
                                <div className="mt-2">srmap.api@gmail.com</div>
                            </div>
                        </div>

                        <div className="mt-8 text-center text-xs">
                            © 2025 SRMAP API Portal.
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}