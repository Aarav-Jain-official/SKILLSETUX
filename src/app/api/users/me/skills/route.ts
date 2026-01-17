import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

/**
 * GET - Get current user's skills with personal stats
 * * Returns:
 * - Skills user can teach (with lesson counts & ratings)
 * - Skills user wants to learn (with lesson counts & progress)
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Verify authentication
    const currentUser = requireAuth(request);
    
    // 2. Fetch user with skills and relation counts
    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: {
        skillsToTeach: {
          include: {
            _count: {
              select: { lessons: true, teachers: true }
            }
          }
        },
        skillsToLearn: {
          include: {
            _count: {
              select: { lessons: true, students: true }
            }
          }
        },
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // 3. Calculate statistics for Teaching Skills
    const teachingSkillsWithStats = await Promise.all(
      user.skillsToTeach.map(async (skill) => {
        // Count lessons explicitly taught by THIS user for this skill
        const lessonsTaught = await prisma.lesson.count({
          where: {
            teacherId: currentUser.userId,
            skillId: skill.id,
            status: 'COMPLETED',
          },
        });
        
        // Calculate average rating for this specific skill
        const reviews = await prisma.review.findMany({
          where: {
            receiverId: currentUser.userId,
            lesson: { skillId: skill.id },
          },
          select: { rating: true },
        });
        
        const avgRating = reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;
        
        return {
          ...skill,
          myStats: {
            lessonsTaught,
            totalReviews: reviews.length,
            averageRating: Number(avgRating.toFixed(1)),
          },
        };
      })
    );
    
    // 4. Calculate statistics for Learning Skills
    const learningSkillsWithStats = await Promise.all(
      user.skillsToLearn.map(async (skill) => {
        // Count lessons taken by THIS user for this skill
        const lessonsTaken = await prisma.lesson.count({
          where: {
            studentId: currentUser.userId,
            skillId: skill.id,
            status: 'COMPLETED',
          },
        });
        
        // Calculate arbitrary progress (e.g., 10 lessons = 100%)
        const progress = Math.min((lessonsTaken / 10) * 100, 100);
        
        return {
          ...skill,
          myStats: {
            lessonsTaken,
            progress: Number(progress.toFixed(0)),
          },
        };
      })
    );
    
    return NextResponse.json({
      teaching: teachingSkillsWithStats,
      learning: learningSkillsWithStats,
    });
    
  } catch (error: any) {
    console.error('Get user skills error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
  }
}

/**
 * POST - Smart "Find or Create" Skill Linker
 * * Logic:
 * 1. Accepts `skillId` (uuid) OR `skillName` (text).
 * 2. If `skillId` is provided, links immediately.
 * 3. If `skillName` is provided:
 * - Searches for case-insensitive match (e.g., "python" matches "Python").
 * - If found -> Links existing skill.
 * - If not found -> Creates new skill -> Links new skill.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication
    const currentUser = requireAuth(request);
    
    // 2. Parse request
    const { skillId, skillName, type } = await request.json();
    
    if (!type || (!skillId && !skillName)) {
      return NextResponse.json(
        { error: 'Invalid request. Provide skillId or skillName, and type (teach/learn)' },
        { status: 400 }
      );
    }

    let targetSkillId = skillId;

    // 3. Handle Manual Text Input (Find or Create)
    if (!targetSkillId && skillName) {
      const cleanName = skillName.trim();

      // A. Try to find existing skill (Case Insensitive)
      const existing = await prisma.skill.findFirst({
        where: { 
          name: { equals: cleanName, mode: 'insensitive' } 
        }
      });

      if (existing) {
        targetSkillId = existing.id;
      } else {
        // B. Create new skill if it doesn't exist
        const newSkill = await prisma.skill.create({
          data: {
            name: cleanName, // Save exactly as typed (or convert to Title Case here if preferred)
            category: 'User Added', // Default category for dynamic skills
            description: 'Community added skill'
          }
        });
        targetSkillId = newSkill.id;
      }
    }
    
    // 4. Link Skill to User
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.userId },
      data: {
        ...(type === 'teach' && {
          skillsToTeach: { connect: { id: targetSkillId } },
          // If user wasn't a teacher before, upgrade them to BOTH
          // Note: Logic implies if they are adding a teaching skill, they are now a teacher/both
          role: 'BOTH', 
        }),
        ...(type === 'learn' && {
          skillsToLearn: { connect: { id: targetSkillId } },
        }),
      },
      select: {
        id: true,
        role: true,
        skillsToTeach: { select: { id: true, name: true } },
        skillsToLearn: { select: { id: true, name: true } },
      },
    });
    
    return NextResponse.json({
      message: `Skill added to ${type === 'teach' ? 'teaching' : 'learning'} list`,
      skillId: targetSkillId,
      user: updatedUser,
    });
    
  } catch (error: any) {
    console.error('Add skill error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle "Already Connected" errors gracefully
    if (error.code === 'P2002' || error.message?.includes('connected')) {
       return NextResponse.json({ error: 'You already have this skill' }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Failed to add skill' }, { status: 500 });
  }
}

/**
 * DELETE - Remove skill from user profile
 */
export async function DELETE(request: NextRequest) {
  try {
    // 1. Verify authentication
    const currentUser = requireAuth(request);
    
    // 2. Parse request
    const { skillId, type } = await request.json();
    
    if (!skillId || !['teach', 'learn'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid request. Provide skillId and type (teach/learn)' },
        { status: 400 }
      );
    }
    
    // 3. Remove skill from user
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.userId },
      data: {
        ...(type === 'teach' && {
          skillsToTeach: { disconnect: { id: skillId } },
        }),
        ...(type === 'learn' && {
          skillsToLearn: { disconnect: { id: skillId } },
        }),
      },
      select: {
        skillsToLearn: { select: { id: true, name: true } },
        skillsToTeach: { select: { id: true, name: true } }
      }
    });
    
    return NextResponse.json({
      message: `Skill removed from ${type === 'teach' ? 'teaching' : 'learning'} list`,
      user: updatedUser
    });
    
  } catch (error: any) {
    console.error('Remove skill error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Failed to remove skill' }, { status: 500 });
  }
}