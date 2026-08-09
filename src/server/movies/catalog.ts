import { useMongo } from "@/lib/database/useMongo";
import { Movie } from "@/types/movies";

async function collection() {
  return (await useMongo()).db("movies").collection<Movie>("catalog");
}

export async function getFeaturedMovies() {
  const col = await collection();
  return col
    .find({ featured: true }, { projection: { _id: 0 } })
    .sort({ featuredOrder: 1, Name: 1 })
    .toArray();
}

export async function getMoviesSummary(options?: { page?: number; limit?: number; search?: string; category?: string; featuredOnly?: boolean }) {
  const page = Math.max(1, options?.page || 1);
  const limit = Math.max(1, Math.min(500, options?.limit || 100));
  const skip = (page - 1) * limit;
  const search = options?.search?.trim() || "";

  let query: any = {};
  if (search) {
    const searchRegex = new RegExp(search.replace(/[^a-zA-Z0-9]/g, ".*"), "i");
    query = {
      $or: [
        { Name: { $regex: searchRegex } },
        { Slug: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { type: { $regex: searchRegex } },
        { categories: { $regex: searchRegex } },
      ],
    };
  }

  if (options?.category) {
    if (options.category === "Others") {
      query.$or = [
        { categories: { $exists: false } },
        { categories: { $size: 0 } },
        { categories: null },
      ];
    } else {
      query.categories = options.category;
    }
  }

  if (options?.featuredOnly) {
    query.featured = true;
  }

  const col = await collection();
  const totalCount = await col.countDocuments(query);
  const items = await col
    .find(query, {
      projection: {
        _id: 0,
        Name: 1,
        Slug: 1,
        posterUrl: 1,
        heroUrl: 1,
        type: 1,
        description: 1,
        featured: 1,
        featuredOrder: 1,
        categories: 1,
      },
    })
    .sort(options?.featuredOnly ? { featuredOrder: 1, Name: 1 } : { Name: 1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  return {
    items,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: skip + items.length < totalCount,
    },
  };
}

export async function getMovies() {
  return (await collection()).find({}, { projection: { _id: 0 } }).sort({ Name: 1 }).toArray();
}

export async function getMovie(slug: string) {
  return (await collection()).findOne({ Slug: slug }, { projection: { _id: 0 } });
}

export async function createMovie(movie: Movie) {
  const col = await collection();
  const existing = await col.findOne({ Slug: movie.Slug });
  if (existing) {
    throw new Error(`Movie/Series with slug '${movie.Slug}' already exists.`);
  }

  await col.insertOne(movie);
  return movie;
}

export async function updateMovie(slug: string, movieData: Partial<Movie>) {
  const col = await collection();
  const { _id, ...updateFields } = movieData as any;

  const res = await col.findOneAndUpdate(
    { Slug: slug },
    { $set: updateFields },
    { returnDocument: "after" }
  );
  return res;
}

export async function deleteMovie(slug: string) {
  const col = await collection();
  const res = await col.deleteOne({ Slug: slug });
  return res.deletedCount > 0;
}

async function categoryOrdersCollection() {
  return (await useMongo()).db("movies").collection<{ name: string; order: number }>("category_orders");
}

export async function getCategoryOrders() {
  const col = await categoryOrdersCollection();
  return col.find({}).sort({ order: 1 }).toArray();
}

export async function saveCategoryOrders(orders: { name: string; order: number }[]) {
  const col = await categoryOrdersCollection();
  await col.deleteMany({});
  if (orders.length > 0) {
    await col.insertMany(orders);
  }
  return orders;
}