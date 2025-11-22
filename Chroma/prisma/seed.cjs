const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a sample personality
  await prisma.personality.upsert({
    where: { id: 'p_sample_1' },
    update: {},
    create: {
      id: 'p_sample_1',
      ownerUid: 'user_dev',
      name: 'Default Helpful',
      description: 'A friendly, helpful assistant',
      systemPrompt: 'You are helpful.'
    }
  });

  // Create a sample conversation
  await prisma.conversation.upsert({
    where: { id: 'c_sample_1' },
    update: {},
    create: {
      id: 'c_sample_1',
      uid: 'user_dev',
      mode: 'coding',
      title: 'Seed Conversation',
      messages: [
        { role: 'user', content: 'Hello', timestamp: Date.now() },
        { role: 'assistant', content: 'Hi, how can I help?', timestamp: Date.now() }
      ]
    }
  });

  // Create a sample animation cache entry
  await prisma.animationGifCache.upsert({
    where: { id: 'gif_sample_1' },
    update: {},
    create: {
      id: 'gif_sample_1',
      ownerUid: 'user_dev',
      cacheKey: 'red_roc_1-25',
      gifUrl: 'https://example.com/sample.gif',
      powerType: 'Red Roc',
      strengthRange: '1-25'
    }
  });

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
