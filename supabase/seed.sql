-- Seed data for Mehendi
-- Run this after the initial migration

-- Insert default henna styles
INSERT INTO public.henna_styles (name, description, image_url, prompt_modifier, category, complexity, coverage) VALUES
('Traditional Indian', 'Classic Indian bridal mehendi with intricate paisley patterns, peacocks, and traditional motifs', 'https://images.unsplash.com/photo-1595147389795-37094173bfd8?w=400', 'traditional Indian bridal mehendi with paisley patterns, peacocks, lotus flowers, intricate details', 'Traditional', 'Intricate', 'Full'),
('Arabic Style', 'Bold floral patterns with leaves and vines, featuring negative space and flowing designs', 'https://images.unsplash.com/photo-1591122947157-26bad3a117d2?w=400', 'Arabic mehendi style with bold flowers, leaves, vines, negative space, flowing elegant design', 'Arabic', 'Medium', 'Partial'),
('Moroccan', 'Geometric patterns inspired by Moroccan tiles and architecture', 'https://images.unsplash.com/photo-1583089892943-e02e5b017b6a?w=400', 'Moroccan geometric mehendi patterns, diamond shapes, triangles, symmetrical design', 'Moroccan', 'Medium', 'Full'),
('Indo-Arabic Fusion', 'Beautiful blend of Indian intricacy with Arabic boldness', 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=400', 'Indo-Arabic fusion mehendi combining Indian paisley with Arabic florals, elegant blend', 'Fusion', 'Complex', 'Full'),
('Minimalist Modern', 'Contemporary simple designs with clean lines and minimal patterns', 'https://images.unsplash.com/photo-1609757754287-e3a9f2e1e3e3?w=400', 'minimalist modern mehendi, simple clean lines, geometric shapes, contemporary style', 'Modern', 'Simple', 'Minimal'),
('Rajasthani', 'Royal Rajasthani patterns featuring elephants, peacocks, and palace motifs', 'https://images.unsplash.com/photo-1595147389795-37094173bfd8?w=400', 'Rajasthani royal mehendi with elephants, peacocks, palace architecture, royal motifs', 'Traditional', 'Intricate', 'Extended'),
('Pakistani', 'Detailed Pakistani style with dense filling and bold outlines', 'https://images.unsplash.com/photo-1591122947157-26bad3a117d2?w=400', 'Pakistani mehendi style, dense intricate filling, bold outlines, detailed patterns', 'Pakistani', 'Complex', 'Full'),
('Floral Garden', 'Beautiful garden-inspired designs with roses, lotuses, and botanical elements', 'https://images.unsplash.com/photo-1583089892943-e02e5b017b6a?w=400', 'floral garden mehendi with roses, lotus, botanical elements, nature inspired', 'Floral', 'Medium', 'Partial')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  prompt_modifier = EXCLUDED.prompt_modifier,
  category = EXCLUDED.category,
  complexity = EXCLUDED.complexity,
  coverage = EXCLUDED.coverage,
  updated_at = NOW();

-- Update default site settings (upsert)
INSERT INTO public.site_settings (id, site_name, tagline, owner_name, email, phone, whatsapp, address)
VALUES ('settings', 'Mehendi', 'AI-Powered Custom Mehendi Design Generator', 'Himanshi', 'himanshiparashar44@gmail.com', '+91 7011489500', '+91 7011489500', 'Greater Noida, Uttar Pradesh')
ON CONFLICT (id) DO UPDATE SET
  site_name = EXCLUDED.site_name,
  tagline = EXCLUDED.tagline,
  owner_name = EXCLUDED.owner_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  whatsapp = EXCLUDED.whatsapp,
  address = EXCLUDED.address,
  updated_at = NOW();

-- Insert sample blog posts
INSERT INTO public.blog_posts (title, slug, excerpt, content, category, tags, author, is_published, is_featured) VALUES
('The Art of Bridal Mehendi: A Complete Guide', 'bridal-mehendi-guide', 'Everything you need to know about bridal mehendi - from choosing the right design to aftercare tips.', 
'Bridal mehendi is one of the most important aspects of Indian weddings. This comprehensive guide covers everything from traditional designs to modern trends, helping brides make the perfect choice for their special day.

## Choosing Your Design
When selecting a bridal mehendi design, consider your outfit, personal style, and the overall wedding theme. Traditional brides often opt for full coverage designs with intricate patterns, while modern brides might prefer minimalist or fusion styles.

## Preparation Tips
- Exfoliate your hands a day before
- Avoid applying any lotions or oils
- Keep your hands warm for better color development

## Aftercare
- Leave the mehendi paste on for at least 6-8 hours
- Apply a mixture of lemon juice and sugar to seal the design
- Avoid water contact for the first 24 hours', 'Bridal', '["bridal", "wedding", "mehendi", "henna"]', 'Himanshi', true, true),

('Top 10 Mehendi Trends for 2024', 'mehendi-trends-2024', 'Discover the hottest mehendi trends that are taking the wedding season by storm.', 
'The world of mehendi is constantly evolving, with new trends emerging each season. Here are the top 10 trends dominating 2024:

1. **Minimalist Designs** - Less is more with clean, simple patterns
2. **Geometric Patterns** - Modern geometric shapes and lines
3. **Portrait Mehendi** - Incorporating faces and figures
4. **Glitter Accents** - Adding sparkle to traditional designs
5. **White Henna** - Perfect for non-traditional brides
6. **Mandala Focus** - Central mandala designs
7. **Finger-Only Designs** - Elegant finger patterns
8. **Negative Space Art** - Using empty space creatively
9. **Personalized Elements** - Names, dates, and symbols
10. **Fusion Styles** - Mixing cultural influences', 'Trends', '["trends", "2024", "modern", "design"]', 'Himanshi', true, false),

('How to Make Your Mehendi Last Longer', 'mehendi-aftercare-tips', 'Expert tips to ensure your mehendi stays dark and beautiful for weeks.', 
'Getting a beautiful mehendi design is just the first step. Here''s how to make it last:

## Before Application
- Clean and exfoliate your skin
- Avoid moisturizers and oils
- Ensure your hands are warm

## During Application
- Stay still and patient
- Keep the paste moist with lemon-sugar solution
- Leave it on as long as possible (8-12 hours ideal)

## After Removal
- Scrape off the dried paste, don''t wash
- Apply natural oil (coconut or olive)
- Avoid water for 24 hours
- Stay away from chlorine and harsh chemicals

Following these tips can help your mehendi last 2-3 weeks with a beautiful dark color!', 'Tips', '["aftercare", "tips", "longevity", "care"]', 'Himanshi', true, false)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  category = EXCLUDED.category,
  tags = EXCLUDED.tags,
  author = EXCLUDED.author,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  updated_at = NOW();
