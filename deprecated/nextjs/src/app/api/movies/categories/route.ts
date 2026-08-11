import { NextRequest, NextResponse } from "next/server";
import { getCategoryOrders } from "@/server/movies/catalog";
import { errorResponse, requireAuthResponse } from "@/server/utils/functions";

export async function GET(request: NextRequest) {
  const auth = await requireAuthResponse(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const savedOrders = await getCategoryOrders();

    const orderMap: { [key: string]: number } = {};
    savedOrders.forEach((item) => {
      orderMap[item.name] = item.order;
    });

    return NextResponse.json({
      success: true,
      orderMap,
    });
  } catch (error: any) {
    console.error("Error loading category orders:", error);
    return errorResponse(error?.message || "Failed to load categories.", {}, 500);
  }
}