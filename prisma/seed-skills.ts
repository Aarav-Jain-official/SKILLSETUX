import { PrismaClient } from '@prisma/client';

// We use the standard PrismaClient which automatically reads from your .env
const prisma = new PrismaClient();

const skillsData = [
  {
    category: 'Programming',
    skills: [
      { name: 'Python', description: 'Learn Python programming from basics to advanced' },
      { name: 'JavaScript', description: 'Master JavaScript for web development' },
      { name: 'Java', description: 'Object-oriented programming with Java' },
      { name: 'C++', description: 'Systems programming and competitive coding' },
      { name: 'TypeScript', description: 'Typed superset of JavaScript' },
      { name: 'Go', description: 'Modern programming language by Google' },
      { name: 'Rust', description: 'Safe systems programming language' },
    ],
  },
  {
    category: 'Web Development',
    skills: [
      { name: 'React', description: 'Build interactive user interfaces' },
      { name: 'Next.js', description: 'React framework for production' },
      { name: 'Node.js', description: 'JavaScript runtime for backend' },
      { name: 'Tailwind CSS', description: 'Utility-first CSS framework' },
      { name: 'HTML/CSS', description: 'Web fundamentals and styling' },
    ],
  },
  {
    category: 'Data Science',
    skills: [
      { name: 'Machine Learning', description: 'Build intelligent systems' },
      { name: 'Deep Learning', description: 'Neural networks and AI' },
      { name: 'Data Analysis', description: 'Extract insights from data' },
      { name: 'SQL', description: 'Database querying language' },
    ],
  },
  {
    category: 'Design',
    skills: [
      { name: 'UI/UX Design', description: 'Create user-friendly interfaces' },
      { name: 'Figma', description: 'Collaborative design tool' },
      { name: 'Graphic Design', description: 'Visual communication design' },
    ],
  },
  {
    category: 'Languages',
    skills: [
      { name: 'Spanish', description: 'Learn Spanish language' },
      { name: 'French', description: 'Learn French language' },
      { name: 'German', description: 'Learn German language' },
      { name: 'English', description: 'Learn English language' },
    ],
  },
  {
    category: 'Music',
    skills: [
      { name: 'Guitar', description: 'Learn acoustic or electric guitar' },
      { name: 'Piano', description: 'Master the piano' },
      { name: 'Singing', description: 'Vocal training and techniques' },
    ],
  }
];

async function main() {
  console.log('🌱 Starting Skillsetu Database Seeding...');
  
  let totalProcessed = 0;

  for (const categoryData of skillsData) {
    console.log(`\n📂 Category: ${categoryData.category}`);
    
    for (const skill of categoryData.skills) {
      try {
        // Use upsert to prevent unique constraint errors on [name, category]
        await prisma.skill.upsert({
          where: {
            name_category: {
              name: skill.name,
              category: categoryData.category,
            },
          },
          update: {
            description: skill.description, // Update description if it changed
          },
          create: {
            name: skill.name,
            category: categoryData.category,
            description: skill.description,
          },
        });
        
        console.log(`   ✅ Success: ${skill.name}`);
        totalProcessed++;
      } catch (error) {
        console.error(`   ❌ Error processing ${skill.name}:`, error);
      }
    }
  }

  console.log('\n' + '='.repeat(40));
  console.log(`✨ Seeding Complete!`);
  console.log(`📊 Total skills in database: ${totalProcessed}`);
  console.log('='.repeat(40));
}

main()
  .catch((e) => {
    console.error('❌ Fatal Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });