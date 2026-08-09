import { NextRequest, NextResponse } from "next/server";
import { getCategoryOrders, saveCategoryOrders, getMovies } from "@/server/movies/catalog";
import { errorResponse, requireAuthResponseAdmin } from "@/server/utils/functions";

export async function GET(request: NextRequest) {
  const auth = await requireAuthResponseAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const savedOrders = await getCategoryOrders();
    const allMovies = await getMovies();

    const orderMap: { [key: string]: number } = {};
    savedOrders.forEach((item) => {
      orderMap[item.name] = item.order;
    });

    const categoriesSet = new Set<string>();
    allMovies.forEach((m) => {
      if (Array.isArray(m.categories)) {
        m.categories.forEach((cat) => {
          if (cat && cat.trim()) categoriesSet.add(cat.trim());
        });
      }
    });

    const categoryList = Array.from(categoriesSet).map((name) => ({
      name,
      order: orderMap[name] !== undefined ? orderMap[name] : 999,
    }));

    categoryList.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

    return NextResponse.json({
      success: true,
      data: categoryList,
      orderMap,
    });
  } catch (error: any) {
    console.error("Error loading category orders (admin):", error);
    return errorResponse(error?.message || "Failed to load categories.", {}, 500);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuthResponseAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const categories: { name: string; order: number }[] = body.categories || [];
    const saved = await saveCategoryOrders(categories);
    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    console.error("Error saving category orders:", error);
    return errorResponse(error?.message || "Failed to save category orders.", {}, 500);
  }
}