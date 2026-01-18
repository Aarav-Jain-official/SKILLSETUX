import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Update the type definition: params is a Promise now
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Await the params to get the ID
    const { id: teacherId } = await params;

    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      select: {
        id: true,
        name: true,
        bio: true,
        location: true,
        profileImage: true,
        hourlyRate: true,
        skillsToTeach: { select: { id: true, name: true, category: true } },
        availability: true,
        
        // Get future lessons to calculate blocked slots
        teacherLessons: {
          where: { 
            scheduledAt: { gte: new Date() },
            status: { in: ['PENDING', 'CONFIRMED'] }
          },
          select: { scheduledAt: true, duration: true }
        },
        
        // Stats
        _count: { select: { reviewsReceived: true, teacherLessons: true } }
      }
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Calculate Average Rating
    const agg = await prisma.review.aggregate({
      where: { receiverId: teacherId },
      _avg: { rating: true }
    });

    return NextResponse.json({
      ...teacher,
      averageRating: agg._avg.rating || 0,
      totalReviews: teacher._count.reviewsReceived,
      lessonsGiven: teacher._count.teacherLessons
    });

  } catch (error) {
    console.error('Error fetching teacher:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}