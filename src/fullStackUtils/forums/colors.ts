export function getStatusColor(status: string) {
    switch (status) {
        case "open":
            return "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800";
        case "closed":
            return "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700";
        default:
            return "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800";
    }
};

export function getCategoryColor(category: string) {
    switch (category) {
        case "Academics":
            return "bg-[#4A90E2]/20 text-[#4A90E2] dark:bg-[#4A90E2]/30 dark:text-[#4A90E2]";
        case "Events":
            return "bg-[#50C878]/20 text-[#50C878] dark:bg-[#50C878]/30 dark:text-[#50C878]";
        case "Transport":
            return "bg-[#FFA500]/20 text-[#FFA500] dark:bg-[#FFA500]/30 dark:text-[#FFA500]";
        case "Lost":
            return "bg-[#FF6B6B]/20 text-[#FF6B6B] dark:bg-[#FF6B6B]/30 dark:text-[#FF6B6B]";
        case "Hostels":
            return "bg-[#9B59B6]/20 text-[#9B59B6] dark:bg-[#9B59B6]/30 dark:text-[#9B59B6]";
        case "Others":
            return "bg-[#95A5A6]/20 text-[#95A5A6] dark:bg-[#95A5A6]/30 dark:text-[#95A5A6]";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
};