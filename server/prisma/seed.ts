import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user (Himanshi)
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'himanshiparashar44@gmail.com' },
    update: {},
    create: {
      email: 'himanshiparashar44@gmail.com',
      password: adminPassword,
      name: 'Himanshi',
      role: 'ADMIN',
      emailVerified: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create artist profile for Himanshi
  const artistPassword = await bcrypt.hash('artist123', 12);
  const artist = await prisma.user.upsert({
    where: { email: 'himanshi.artist@mehndidesign.com' },
    update: {},
    create: {
      email: 'himanshi.artist@mehndidesign.com',
      password: artistPassword,
      name: 'Himanshi',
      role: 'ARTIST',
      emailVerified: true,
    },
  });

  await prisma.artistProfile.upsert({
    where: { userId: artist.id },
    update: {},
    create: {
      userId: artist.id,
      bio: 'Professional mehndi artist based in Greater Noida, specializing in bridal and festive henna designs. Available on Sundays and Mondays. ₹100/hand. Contact: +91 7011489500',
      specialties: JSON.stringify(['Bridal', 'Arabic', 'Indo-Arabic', 'Mandala', 'Festive']),
      experience: 5,
      portfolio: JSON.stringify([
        'https://images.unsplash.com/photo-1595147389795-37094173bfd8?w=400',
        'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=400',
      ]),
      rating: 4.8,
      reviewCount: 50,
      available: true,
    },
  });
  console.log('✅ Artist created:', artist.email);

  // Create henna styles
  const styles = [
    {
      name: 'Regal Bloom',
      description: 'Intricate floral and paisley mehndi design suitable for grand occasions.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxAJLz5irj-Bjns_y5dVhmq1L-mydTwGUOkSg2ySegnF3bo-fzHfk7YV9qd2s9U-97xeos90F9JxS4D3SP-gKIpxgQfc5VMYWv5QqcAdPLanxAglR6zTW-o-k5Av2OwWqLQbb-xP2bj-JuOWjFiiTCx6KmyDTt530DPEIzX7QNpPl1JhGjGKBSNCtX6CaUq2O8a7-zBhhUIDQa81T3cZUjATp4T5XCkGYhiDF9pfi6b4s6sesCRmtsyjYQsUtL9j0hmdldsP506w',
      promptModifier: 'regal bloom style, intricate floral and paisley mehndi design',
      category: 'Traditional',
      complexity: 'High',
      coverage: 'Full',
    },
    {
      name: 'Modern Vine',
      description: 'A contemporary vine-like pattern trailing elegantly up the hand.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuWPAch47zv4IVC5CsrXCORQ1o3VujEzTFKZU6ZI_ga_ExLDvxN1NTWYK0NMA2Leq10lSa2dEAJrlb2m7GkjCXMHQFMZNAvmu_7Rdwx-ZHeA_1Ulsj7aP2dnHssGvQ11Q-jskHUIJoCV2nVaxnXZVeCOQUuPVh34cQyVCOo7Ujv-tUPyQIYeg79pnd3XetnOEyimc9Ymh90gi2ngR_ObW6oT_fZNRSKiiqHZazrWYKeEbLUgEs1YJQ03aCnXHkNzhJqhE9pZux6Q',
      promptModifier: 'modern vine style, trailing vine-like mehndi pattern',
      category: 'Modern',
      complexity: 'Medium',
      coverage: 'Partial',
    },
    {
      name: 'Royal Mandala',
      description: 'A grand, symmetrical mandala centerpiece for a majestic look.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkxyS7fIYgO3GbES7nKGKMNIA5ErhQoqLRooM1OpSUbL-hdZ-Q-W1x02saTGQrMkWNRJRQdQU-UK5l2tVR51m7_9X9S-bRYvKtZVxwHvl7v3Tt859ktY-iAiabCrakKUbPDN0R4uXdHyxON91-zmicTVfBc9n9Z6PiGNYIqGd-PZ80JLmjqWR6Bm75t6iUP3y5hMuBeJN6pz0SsVI_NWcLugoNhUfNhy8vFaEwYKqeqTyB1_o9B6IqhZdHcUNHKnNn71CJLuxC_A',
      promptModifier: 'royal mandala style, grand mandala design',
      category: 'Traditional',
      complexity: 'High',
      coverage: 'Full',
    },
    {
      name: 'Delicate Flora',
      description: 'Minimalist floral touches focusing on fingers and wrist.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMiq0nDG6lC6dGMBBMmxWXXeKROdSEhTNK45foL4Y-8whY6v1qwdbmLOHzVaAtNFqEzmI_jFPdAGRZBmBr7W7oonpED8FyQeTnMMWi9jraFgxArcf4Jzc8Fb2c4F-V_aaMl8a-O5i7x-EVVVNnDKWh4oF-nN2gi7x4EBK1bgZmoKhHzOY-p73dyDvqdlrlEunoMb3f8NtPdUbMjOFqMXLTKBLLqer02HGOLrH_a0f45tsvoiLT4jMHcETMHDZxLkWnQC77kp1YNw',
      promptModifier: 'delicate flora style, minimalist floral mehndi design',
      category: 'Minimalist',
      complexity: 'Low',
      coverage: 'Minimal',
    },
  ];

  for (const style of styles) {
    await prisma.hennaStyle.upsert({
      where: { name: style.name },
      update: style,
      create: style,
    });
  }
  console.log('✅ Henna styles created:', styles.length);

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
