import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Build Where Clause
    const where: any = {
      role: { in: ['TEACHER', 'BOTH'] }, // Only fetch teachers
      // 1. Search Logic (Name, Bio, or Skills)
      OR: query ? [
        { name: { contains: query, mode: 'insensitive' } },
        { bio: { contains: query, mode: 'insensitive' } },
        { 
          skillsToTeach: { 
            some: { name: { contains: query, mode: 'insensitive' } } 
          } 
        }
      ] : undefined,
    };

    // 2. Price Filter
    if (minPrice || maxPrice) {
      where.hourlyRate = {};
      if (minPrice) where.hourlyRate.gte = parseFloat(minPrice);
      if (maxPrice) where.hourlyRate.lte = parseFloat(maxPrice);
    }

    // 3. Execute Query
    const [teachers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          bio: true,
          profileImage: true,
          hourlyRate: true,
          location: true,
          skillsToTeach: {
            select: { id: true, name: true, category: true },
            take: 3 // Show top 3 skills on card
          },
          _count: {
            select: { reviewsReceived: true }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        // Default sort: Verified teachers first, then by rating (mock logic if needed)
        orderBy: { verified: 'desc' } 
      }),
      prisma.user.count({ where })
    ]);

    // 4. Calculate Average Ratings (Manual aggregation needed per teacher)
    const teachersWithStats = await Promise.all(
      teachers.map(async (t) => {
        const aggregations = await prisma.review.aggregate({
          where: { receiverId: t.id },
          _avg: { rating: true }
        });
        return {
          ...t,
          averageRating: aggregations._avg.rating || 0,
          totalReviews: t._count.reviewsReceived
        };
      })
    );

    return NextResponse.json({
      teachers: teachersWithStats,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Teacher search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}