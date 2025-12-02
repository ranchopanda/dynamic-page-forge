import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const blogPosts = [
  {
    title: 'Top 10 Bridal Mehendi Designs for 2025 - Latest Trends',
    slug: 'top-10-bridal-mehendi-designs-2025',
    excerpt: 'Discover the most stunning bridal mehendi designs trending in 2025. From traditional Indian patterns to modern Arabic fusion styles perfect for your wedding day.',
    category: 'Bridal Mehendi',
    tags: JSON.stringify(['bridal', 'wedding', '2025', 'trending', 'Indian']),
    keywords: 'bridal mehendi design 2025, wedding henna, dulhan mehendi, bridal mehendi Greater Noida',
    metaTitle: 'Top 10 Bridal Mehendi Designs 2025 | Latest Wedding Henna Trends',
    metaDescription: 'Explore the top 10 bridal mehendi designs for 2025. Beautiful dulhan mehendi patterns for Indian weddings. Book mehendi artist in Greater Noida.',
    isPublished: true,
    isFeatured: true,
    scheduledAt: new Date('2024-12-01'),
    content: `
<h2>Introduction to Bridal Mehendi 2025</h2>
<p>Your wedding day is one of the most special moments of your life, and <strong>bridal mehendi</strong> plays a crucial role in Indian weddings. In 2025, we're seeing a beautiful blend of traditional and contemporary designs that make every bride feel like a queen.</p>

<h2>1. Royal Rajasthani Full Hand Design</h2>
<p>The classic <strong>Rajasthani mehendi</strong> features intricate peacocks, elephants, and palace motifs. This design covers the entire hand and extends to the elbow, perfect for traditional Indian weddings.</p>
<p><em>Best for:</em> Traditional Hindu weddings, Rajasthani brides</p>

<h2>2. Modern Arabic Fusion</h2>
<p><strong>Arabic mehendi designs</strong> are known for their bold, flowing patterns. The 2025 trend combines Arabic boldness with Indian intricacy for a stunning fusion look.</p>

<h2>3. Minimalist Bridal Mehendi</h2>
<p>Not every bride wants heavy mehendi. <strong>Minimalist bridal designs</strong> focus on elegant patterns on fingers and a central mandala, perfect for modern brides.</p>

<h2>4. Portrait Mehendi</h2>
<p>A trending style where the <strong>bride and groom's portraits</strong> are incorporated into the mehendi design. This personalized touch makes your mehendi truly unique.</p>

<h2>5. Mandala Centerpiece Design</h2>
<p>A large, intricate <strong>mandala</strong> in the center of the palm surrounded by delicate patterns. This design is both traditional and eye-catching.</p>

<h2>6. Lotus and Peacock Theme</h2>
<p>Combining two auspicious symbols - the <strong>lotus</strong> representing purity and the <strong>peacock</strong> representing beauty - creates a meaningful bridal design.</p>

<h2>7. Jaali (Net) Pattern</h2>
<p>The <strong>jaali pattern</strong> creates a mesh-like effect that's both delicate and stunning. It's perfect for brides who want coverage without heaviness.</p>

<h2>8. Moroccan Geometric</h2>
<p><strong>Moroccan mehendi</strong> features bold geometric patterns that look incredibly modern while maintaining traditional appeal.</p>

<h2>9. Floral Trail Design</h2>
<p>Delicate <strong>floral trails</strong> running from fingertips to wrist create an elegant, feminine look perfect for engagement ceremonies.</p>

<h2>10. Customized Story Mehendi</h2>
<p>Tell your love story through mehendi! Include elements like where you met, your proposal, or meaningful symbols from your relationship.</p>

<h2>Book Your Bridal Mehendi in Greater Noida</h2>
<p>Looking for a professional <strong>mehendi artist in Greater Noida</strong>? Book Himanshi for your bridal mehendi at just ₹100/hand. Available on Sundays and Mondays.</p>
<p><strong>Contact:</strong> +91 7011489500 (WhatsApp)</p>

<h3>Why Choose Our AI Mehendi Design Generator?</h3>
<p>Can't decide on a design? Try our <strong>AI-powered mehendi design generator</strong> to preview custom designs on your actual hand before your wedding day!</p>
`
  },
  {
    title: 'Arabic Mehendi Designs: Simple Yet Elegant Patterns',
    slug: 'arabic-mehendi-designs-simple-elegant',
    excerpt: 'Learn about beautiful Arabic mehendi designs that are simple yet elegant. Perfect for festivals, parties, and casual occasions.',
    category: 'Arabic Designs',
    tags: JSON.stringify(['arabic', 'simple', 'elegant', 'party', 'festival']),
    keywords: 'Arabic mehendi design, simple henna, elegant mehendi, party mehendi Greater Noida',
    isPublished: true,
    scheduledAt: new Date('2024-12-01'),
    content: `
<h2>What Makes Arabic Mehendi Special?</h2>
<p><strong>Arabic mehendi</strong> is characterized by its bold, flowing patterns that leave more skin visible compared to Indian designs. This style originated in the Middle East and has become popular worldwide for its elegance and simplicity.</p>

<h2>Key Features of Arabic Mehendi</h2>
<ul>
<li><strong>Bold outlines</strong> with minimal filling</li>
<li><strong>Floral and leaf patterns</strong> that flow naturally</li>
<li><strong>Diagonal placement</strong> across the hand</li>
<li><strong>Quick application time</strong> - perfect for busy schedules</li>
</ul>

<h2>Popular Arabic Mehendi Patterns</h2>
<h3>1. Single Flower Trail</h3>
<p>A beautiful <strong>flower trail</strong> running diagonally across the back of the hand. Simple yet stunning.</p>

<h3>2. Vine and Leaf Design</h3>
<p>Delicate <strong>vines with leaves</strong> creating an organic, natural look.</p>

<h3>3. Bold Rose Pattern</h3>
<p>Large <strong>rose motifs</strong> with shaded petals - a signature Arabic style.</p>

<h2>Best Occasions for Arabic Mehendi</h2>
<p>Arabic mehendi is perfect for:</p>
<ul>
<li>Eid celebrations</li>
<li>Birthday parties</li>
<li>Engagement ceremonies</li>
<li>Casual get-togethers</li>
<li>Karwa Chauth</li>
</ul>

<h2>Book Arabic Mehendi in Greater Noida</h2>
<p>Want beautiful <strong>Arabic mehendi</strong> for your next event? Contact us at +91 7011489500. Service available in Greater Noida and nearby areas.</p>
`
  },
];

export async function seedBlogPosts() {
  console.log('🌱 Seeding blog posts...');
  
  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }
  
  console.log('✅ Blog posts seeded:', blogPosts.length);
}


// Additional blog posts
const moreBlogPosts = [
  {
    title: 'Mehendi Care Tips: How to Make Your Henna Last Longer',
    slug: 'mehendi-care-tips-henna-last-longer',
    excerpt: 'Expert tips to make your mehendi darker and last longer. Learn the secrets to beautiful, long-lasting henna color.',
    category: 'Mehendi Care',
    tags: JSON.stringify(['care', 'tips', 'dark mehendi', 'aftercare']),
    keywords: 'mehendi care tips, dark henna, long lasting mehendi, henna aftercare',
    isPublished: true,
    scheduledAt: new Date('2024-12-02'),
    content: `
<h2>How to Get Dark Mehendi Color</h2>
<p>Everyone wants their <strong>mehendi to be dark and long-lasting</strong>. Here are expert tips from professional henna artists.</p>

<h2>Before Application</h2>
<ul>
<li><strong>Clean your hands</strong> thoroughly - remove any oils or lotions</li>
<li><strong>Exfoliate</strong> gently to remove dead skin</li>
<li><strong>Avoid waxing</strong> 24 hours before mehendi application</li>
</ul>

<h2>During Application</h2>
<ul>
<li>Keep hands <strong>warm</strong> - warmth helps color development</li>
<li>Stay <strong>still</strong> to avoid smudging</li>
<li>Let the paste dry naturally</li>
</ul>

<h2>After Application - The Secret to Dark Color</h2>
<h3>1. Keep It On Longer</h3>
<p>Leave the mehendi paste on for <strong>6-8 hours minimum</strong>. Overnight is best for bridal mehendi.</p>

<h3>2. Apply Lemon-Sugar Mixture</h3>
<p>Mix <strong>lemon juice with sugar</strong> and dab it on dried mehendi. This helps seal the design and darken the color.</p>

<h3>3. Heat Treatment</h3>
<p>Hold your hands near a <strong>warm tawa or heater</strong> (not too close!) to help the color develop.</p>

<h3>4. Avoid Water</h3>
<p><strong>Don't wash with water for 24 hours</strong> after removing the paste. Use oil to remove dried mehendi.</p>

<h2>What to Avoid</h2>
<ul>
<li>❌ Washing with soap immediately</li>
<li>❌ Swimming or excessive sweating</li>
<li>❌ Using harsh chemicals</li>
<li>❌ Scrubbing the design</li>
</ul>

<h2>Book Professional Mehendi Application</h2>
<p>For best results, book a professional mehendi artist. Contact Himanshi at +91 7011489500 for mehendi services in Greater Noida.</p>
`
  },
  {
    title: 'Karwa Chauth Mehendi Designs 2024: Beautiful Patterns for Married Women',
    slug: 'karwa-chauth-mehendi-designs-2024',
    excerpt: 'Special Karwa Chauth mehendi designs for married women. Traditional and modern patterns to celebrate this beautiful festival.',
    category: 'Festive Mehendi',
    tags: JSON.stringify(['karwa chauth', 'festival', 'married women', 'traditional']),
    keywords: 'Karwa Chauth mehendi, festival henna, married women mehendi, Karwa Chauth 2024',
    isPublished: true,
    scheduledAt: new Date('2024-12-02'),
    content: `
<h2>Karwa Chauth - A Festival of Love</h2>
<p><strong>Karwa Chauth</strong> is a beautiful festival where married women fast for their husband's long life. Mehendi is an essential part of this celebration.</p>

<h2>Traditional Karwa Chauth Mehendi Elements</h2>
<ul>
<li><strong>Moon and stars</strong> - symbolizing the festival</li>
<li><strong>Karwa (pot)</strong> - the traditional vessel</li>
<li><strong>Husband's name</strong> hidden in the design</li>
<li><strong>Couple motifs</strong> representing love</li>
</ul>

<h2>Popular Karwa Chauth Designs</h2>
<h3>1. Moon and Diya Design</h3>
<p>A beautiful <strong>crescent moon with diyas</strong> representing the moment of breaking the fast.</p>

<h3>2. Couple Portrait Mehendi</h3>
<p>Modern brides love having <strong>couple portraits</strong> in their Karwa Chauth mehendi.</p>

<h3>3. Traditional Karwa Pattern</h3>
<p>The <strong>karwa (pot)</strong> design with intricate patterns around it.</p>

<h2>Book Your Karwa Chauth Mehendi</h2>
<p>Make your Karwa Chauth special with beautiful mehendi. Book now at +91 7011489500. Available in Greater Noida.</p>
`
  },
  {
    title: 'Finger Mehendi Designs: Trendy Patterns for Modern Women',
    slug: 'finger-mehendi-designs-trendy-modern',
    excerpt: 'Explore beautiful finger mehendi designs perfect for modern women. Quick, stylish, and perfect for any occasion.',
    category: 'Modern Minimalist',
    tags: JSON.stringify(['finger mehendi', 'modern', 'trendy', 'quick', 'minimalist']),
    keywords: 'finger mehendi design, modern henna, trendy mehendi, minimalist henna',
    isPublished: true,
    scheduledAt: new Date('2024-12-03'),
    content: `
<h2>Why Finger Mehendi is Trending</h2>
<p><strong>Finger mehendi</strong> is perfect for women who want beautiful henna without the commitment of full hand designs. It's quick, stylish, and versatile.</p>

<h2>Benefits of Finger Mehendi</h2>
<ul>
<li>⏱️ <strong>Quick application</strong> - 15-30 minutes</li>
<li>💼 <strong>Office-friendly</strong> - subtle yet beautiful</li>
<li>📸 <strong>Instagram-worthy</strong> - perfect for photos</li>
<li>💰 <strong>Budget-friendly</strong> - less henna required</li>
</ul>

<h2>Popular Finger Mehendi Styles</h2>
<h3>1. Ring Style Mehendi</h3>
<p>Delicate patterns around fingers that look like <strong>henna rings</strong>.</p>

<h3>2. Mandala Fingertips</h3>
<p>Small <strong>mandalas on each fingertip</strong> - simple and elegant.</p>

<h3>3. Geometric Lines</h3>
<p>Modern <strong>geometric patterns</strong> running along fingers.</p>

<h3>4. Floral Finger Caps</h3>
<p>Beautiful <strong>flowers on fingertips</strong> with trailing vines.</p>

<h2>Try Our AI Design Generator</h2>
<p>Not sure which finger design suits you? Use our <strong>AI mehendi generator</strong> to preview designs on your actual hand!</p>
`
  },
  {
    title: 'Mehendi Artist in Greater Noida: Professional Henna Services',
    slug: 'mehendi-artist-greater-noida-services',
    excerpt: 'Looking for a professional mehendi artist in Greater Noida? Book Himanshi for bridal, party, and festive mehendi at affordable prices.',
    category: 'Tips & Tutorials',
    tags: JSON.stringify(['Greater Noida', 'mehendi artist', 'booking', 'professional']),
    keywords: 'mehendi artist Greater Noida, henna artist Noida, book mehendi artist, professional mehendi',
    isPublished: true,
    isFeatured: true,
    scheduledAt: new Date('2024-12-03'),
    content: `
<h2>Professional Mehendi Services in Greater Noida</h2>
<p>Looking for a skilled <strong>mehendi artist in Greater Noida</strong>? You've come to the right place! I'm Himanshi, a professional henna artist specializing in bridal and festive mehendi.</p>

<h2>Services Offered</h2>
<ul>
<li>✨ <strong>Bridal Mehendi</strong> - Full hands and feet</li>
<li>🎉 <strong>Party Mehendi</strong> - Quick and beautiful designs</li>
<li>🪔 <strong>Festive Mehendi</strong> - Diwali, Eid, Karwa Chauth</li>
<li>💍 <strong>Engagement Mehendi</strong> - Elegant designs for the bride-to-be</li>
</ul>

<h2>Pricing</h2>
<table>
<tr><td>Simple Design</td><td>₹100/hand</td></tr>
<tr><td>Medium Design</td><td>₹150/hand</td></tr>
<tr><td>Bridal Full Hand</td><td>₹500 onwards</td></tr>
</table>

<h2>Service Areas</h2>
<p>I provide mehendi services in:</p>
<ul>
<li>Greater Noida</li>
<li>Noida</li>
<li>Ghaziabad</li>
<li>Delhi NCR (on request)</li>
</ul>

<h2>Availability</h2>
<p><strong>Available Days:</strong> Sunday and Monday</p>
<p><strong>Advance Booking:</strong> Recommended for bridal mehendi</p>

<h2>How to Book</h2>
<p>📱 <strong>WhatsApp:</strong> +91 7011489500</p>
<p>📧 <strong>Email:</strong> himanshiparashar44@gmail.com</p>

<h2>Why Choose Me?</h2>
<ul>
<li>✅ 5+ years of experience</li>
<li>✅ Quality organic henna</li>
<li>✅ Punctual and professional</li>
<li>✅ Affordable pricing</li>
<li>✅ Home service available</li>
</ul>
`
  }
];

export { moreBlogPosts };


// Even more blog posts for complete SEO coverage
const finalBlogPosts = [
  {
    title: 'Diwali Mehendi Designs: Festive Patterns to Light Up Your Hands',
    slug: 'diwali-mehendi-designs-festive-patterns',
    excerpt: 'Beautiful Diwali mehendi designs featuring diyas, rangoli patterns, and festive motifs. Celebrate the festival of lights with stunning henna.',
    category: 'Festive Mehendi',
    tags: JSON.stringify(['diwali', 'festival', 'diya', 'rangoli', 'festive']),
    keywords: 'Diwali mehendi design, festival henna, diya mehendi, Diwali 2024 mehendi',
    isPublished: true,
    scheduledAt: new Date('2024-12-04'),
    content: `
<h2>Celebrate Diwali with Beautiful Mehendi</h2>
<p><strong>Diwali</strong>, the festival of lights, is incomplete without beautiful mehendi. Here are the best designs to make your celebration special.</p>

<h2>Diwali-Themed Mehendi Elements</h2>
<ul>
<li>🪔 <strong>Diyas</strong> - oil lamps symbolizing light</li>
<li>🎆 <strong>Fireworks</strong> - celebration motifs</li>
<li>🌸 <strong>Rangoli patterns</strong> - traditional floor art</li>
<li>🕉️ <strong>Om and Swastik</strong> - auspicious symbols</li>
</ul>

<h2>Top Diwali Mehendi Designs</h2>
<h3>1. Diya Trail Design</h3>
<p>Beautiful <strong>diyas arranged in a trail</strong> from fingertips to wrist.</p>

<h3>2. Rangoli Mandala</h3>
<p>A stunning <strong>rangoli-inspired mandala</strong> in the center of your palm.</p>

<h3>3. Lakshmi Feet Design</h3>
<p>Traditional <strong>Goddess Lakshmi feet</strong> for prosperity and blessings.</p>

<h2>Book Diwali Mehendi</h2>
<p>Make your Diwali special! Book mehendi at +91 7011489500. Greater Noida service available.</p>
`
  },
  {
    title: 'Eid Mehendi Designs: Beautiful Henna for Eid Celebrations',
    slug: 'eid-mehendi-designs-beautiful-henna',
    excerpt: 'Stunning Eid mehendi designs combining Arabic and Indian styles. Perfect patterns for Eid-ul-Fitr and Eid-ul-Adha celebrations.',
    category: 'Festive Mehendi',
    tags: JSON.stringify(['eid', 'arabic', 'festival', 'muslim', 'celebration']),
    keywords: 'Eid mehendi design, Eid henna, Arabic mehendi Eid, Eid ul Fitr mehendi',
    isPublished: true,
    scheduledAt: new Date('2024-12-04'),
    content: `
<h2>Eid Mehendi Traditions</h2>
<p><strong>Mehendi</strong> is an important part of Eid celebrations. Women apply beautiful henna designs to celebrate this joyous occasion.</p>

<h2>Popular Eid Mehendi Styles</h2>
<h3>1. Classic Arabic Design</h3>
<p>Bold, flowing <strong>Arabic patterns</strong> are the most popular choice for Eid.</p>

<h3>2. Crescent Moon Motif</h3>
<p>The <strong>crescent moon</strong> symbolizing Eid incorporated into beautiful designs.</p>

<h3>3. Floral Arabic Fusion</h3>
<p>Combining <strong>Arabic boldness with Indian florals</strong> for a unique look.</p>

<h2>Eid Mehendi Tips</h2>
<ul>
<li>Apply mehendi <strong>2-3 days before Eid</strong> for best color</li>
<li>Choose <strong>Arabic designs</strong> for quick application</li>
<li>Include <strong>moon and star motifs</strong> for festive feel</li>
</ul>

<h2>Book Your Eid Mehendi</h2>
<p>Celebrate Eid with beautiful mehendi! Contact +91 7011489500 for booking in Greater Noida.</p>
`
  },
  {
    title: 'How to Use AI Mehendi Design Generator: Step-by-Step Guide',
    slug: 'how-to-use-ai-mehendi-design-generator',
    excerpt: 'Learn how to use our AI-powered mehendi design generator to create custom henna patterns. Preview designs on your actual hand!',
    category: 'Tips & Tutorials',
    tags: JSON.stringify(['AI', 'tutorial', 'guide', 'technology', 'custom design']),
    keywords: 'AI mehendi generator, custom henna design, mehendi design app, AI henna',
    isPublished: true,
    isFeatured: true,
    scheduledAt: new Date('2024-12-05'),
    content: `
<h2>What is AI Mehendi Design Generator?</h2>
<p>Our <strong>AI-powered mehendi design generator</strong> uses advanced technology to create custom henna designs based on your hand shape and style preferences.</p>

<h2>How It Works - 3 Simple Steps</h2>
<h3>Step 1: Upload Your Hand Photo</h3>
<p>Take a clear photo of your hand and upload it to our platform. Our AI analyzes your <strong>hand shape and contours</strong>.</p>

<h3>Step 2: Choose Your Style</h3>
<p>Select from various styles:</p>
<ul>
<li>🌸 <strong>Indian Bridal</strong></li>
<li>🌿 <strong>Arabic</strong></li>
<li>✨ <strong>Modern Minimalist</strong></li>
<li>🔷 <strong>Moroccan Geometric</strong></li>
<li>🌺 <strong>Floral Mandala</strong></li>
</ul>

<h3>Step 3: Get Your Custom Design</h3>
<p>In just <strong>30 seconds</strong>, receive a custom mehendi design perfectly fitted to your hand!</p>

<h2>Benefits of AI Mehendi Generator</h2>
<ul>
<li>✅ <strong>Preview before applying</strong> - see exactly how it will look</li>
<li>✅ <strong>Personalized designs</strong> - fitted to your hand shape</li>
<li>✅ <strong>Save favorites</strong> - build your design collection</li>
<li>✅ <strong>Free to try</strong> - no cost to generate designs</li>
</ul>

<h2>Try It Now!</h2>
<p>Ready to create your perfect mehendi design? <strong>Click "Design My Hand"</strong> to get started!</p>
`
  },
  {
    title: 'Back Hand Mehendi Designs: Stunning Patterns for Every Occasion',
    slug: 'back-hand-mehendi-designs-patterns',
    excerpt: 'Explore beautiful back hand mehendi designs from simple to intricate. Perfect patterns for weddings, festivals, and parties.',
    category: 'Design Inspiration',
    tags: JSON.stringify(['back hand', 'designs', 'patterns', 'wedding', 'party']),
    keywords: 'back hand mehendi design, henna back hand, mehendi patterns, hand mehendi',
    isPublished: true,
    scheduledAt: new Date('2024-12-05'),
    content: `
<h2>Why Back Hand Mehendi is Popular</h2>
<p><strong>Back hand mehendi</strong> is highly visible and makes a statement. It's the first thing people notice when you gesture or wave.</p>

<h2>Types of Back Hand Designs</h2>
<h3>1. Full Coverage Design</h3>
<p>Intricate patterns covering the <strong>entire back of the hand</strong> - perfect for brides.</p>

<h3>2. Central Mandala</h3>
<p>A beautiful <strong>mandala in the center</strong> with patterns extending to fingers.</p>

<h3>3. Diagonal Trail</h3>
<p><strong>Arabic-style diagonal patterns</strong> flowing across the hand.</p>

<h3>4. Finger Focus</h3>
<p>Detailed patterns on <strong>fingers with minimal palm design</strong>.</p>

<h2>Choosing the Right Design</h2>
<ul>
<li><strong>Weddings:</strong> Full coverage with intricate details</li>
<li><strong>Parties:</strong> Medium coverage with bold patterns</li>
<li><strong>Casual:</strong> Simple finger designs or small motifs</li>
</ul>

<h2>Get Your Perfect Back Hand Design</h2>
<p>Use our AI generator to preview back hand designs on your actual hand!</p>
`
  }
];

export { finalBlogPosts };
