import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 1. Update the type definition here
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 2. Await the params object to get the ID
    const { id } = await params;

    // ... The rest of your existing logic uses 'id' ...
    
    // Example logic based on your error message's return type:
    const skill = await prisma.skill.findUnique({
      where: { id },
      include: {
        _count: {
          select: { teachers: true, students: true, lessons: true }
        }
      }
    });

    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    // Fetch top teachers for this skill
    const topTeachers = await prisma.user.findMany({
      where: {
        skillsToTeach: { some: { id } },
        role: { in: ['TEACHER', 'BOTH'] }
      },
      take: 5,
      orderBy: {
        reviewsReceived: {
          _count: 'desc'
        }
      },
      select: {
        id: true,
        name: true,
        profileImage: true,
        averageRating: true // Assuming you have this or calculate it
      }
    });

    return NextResponse.json({
      skill,
      stats: {
        totalTeachers: skill._count.teachers,
        totalStudents: skill._count.students,
        totalLessons: skill._count.lessons
      },
      topTeachers
    });

  } catch (error) {
    console.error('Error fetching skill stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}