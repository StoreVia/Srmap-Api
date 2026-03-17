import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white dark:bg-gray-900">
      <Image
        src="/icons/round_corner_logo.png"
        alt="Loading"
        width={130}
        height={130}
        priority
        className="
          w-20 h-20
          sm:w-24 sm:h-24
          md:w-[130px] md:h-[130px]
        "
      />
      <Loader2 className="h-5 w-5 animate-spin text-gray-600 dark:text-gray-300" />
    </div>
  );
}