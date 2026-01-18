import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const currentUser = requireAuth(request);
    const { teacherId, skillId, startTime, price } = await request.json();

    // Create the lesson
    const lesson = await prisma.lesson.create({
      data: {
        title: "1-on-1 Session", // Default title, can be customized
        teacherId,
        studentId: currentUser.userId,
        skillId,
        scheduledAt: new Date(startTime),
        duration: 60, // Defaulting to 1 hour for MVP
        price: parseFloat(price),
        status: 'PENDING', // Waiting for teacher approval
      }
    });

    // Send Notification to Teacher
    await prisma.notification.create({
      data: {
        userId: teacherId,
        type: 'LESSON_BOOKED',
        title: 'New Booking Request',
        message: `You have a new booking request for ${new Date(startTime).toLocaleString()}`,
        link: '/dashboard/lessons'
      }
    });

    return NextResponse.json({ success: true, lessonId: lesson.id });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Booking failed' }, { status: 500 });
  }
}