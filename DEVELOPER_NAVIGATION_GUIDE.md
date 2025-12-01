# 🛠️ Developer Guide - Navigation System

## Quick Reference for Developers

### 📦 New Components Created

#### 1. **Breadcrumb Component**
```typescript
// src/components/Breadcrumb.tsx
interface BreadcrumbItem {
  label: string;
  onClick?: () => void;  // Optional - last item has no onClick
}

// Usage:
<Breadcrumb items={[
  { label: 'Home', onClick: goHome },
  { label: 'Gallery' }  // Current page - no onClick
]} />
```

#### 2. **ScrollToTop Component**
```typescript
// src/components/ScrollToTop.tsx
// No props needed - just add to page
<ScrollToTop />

// Appears after scrolling 300px
// Smooth scrolls to top on click
```

---

### 🔧 Component Props Updated

#### **All Page Components Now Accept:**
```typescript
interface PageProps {
  // Required
  onBack: () => void;
  
  // Optional navigation callbacks
  onStartDesign?: () => void;  // or onDesign
  onGallery?: () => void;
  onArtists?: () => void;
  onSaved?: () => void;
  onBooking?: () => void;
  onAuth?: () => void;
  
  // Page-specific props
  // ... existing props
}
```

#### **Updated Components:**
- `DesignFlow.tsx` - Added onGallery, onArtists
- `SavedDesigns.tsx` - Added onGallery, onArtists, onBooking
- `Gallery.tsx` - Added onStartDesign, onBooking
- `Artists.tsx` - Added onStartDesign, onGallery
- `Profile.tsx` - Added full navigation props + Header

---

### 📝 Implementation Patterns

#### **Pattern 1: Add Breadcrumb**
```typescript
import Breadcrumb from './Breadcrumb';

// In component:
<Breadcrumb items={[
  { label: 'Home', onClick: onBack },
  { label: 'Current Page' }
]} />
```

#### **Pattern 2: Add Footer**
```typescript
import Footer from './Footer';

// At end of component:
return (
  <div>
    {/* Page content */}
    <Footer />
  </div>
);
```

#### **Pattern 3: Add Scroll to Top**
```typescript
import ScrollToTop from './ScrollToTop';

// At end of component (after Footer):
return (
  <div>
    {/* Page content */}
    <Footer />
    <ScrollToTop />
  </div>
);
```

#### **Pattern 4: Add CTA Section**
```typescript
{/* After main content, before footer */}
<section className="py-16 mt-12">
  <div className="bg-gradient-to-br from-primary to-[#a15842] rounded-3xl p-8 md:p-12 text-center text-white">
    <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4">
      Call to Action Title
    </h2>
    <p className="text-white/80 max-w-2xl mx-auto mb-8">
      Description text
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      {onPrimaryAction && (
        <button
          onClick={onPrimaryAction}
          className="px-8 py-4 bg-white text-primary rounded-full font-bold hover:bg-white/90 transition-colors"
        >
          Primary Action
        </button>
      )}
      {onSecondaryAction && (
        <button
          onClick={onSecondaryAction}
          className="px-8 py-4 border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition-colors"
        >
          Secondary Action
        </button>
      )}
    </div>
  </div>
</section>
```

---

### 🎨 Styling Conventions

#### **Breadcrumb Styling**
```css
/* Already styled in component */
/* Text: text-sm text-text-primary-light/60 */
/* Active: text-primary font-medium */
/* Separator: material-symbols-outlined chevron_right */
```

#### **CTA Section Styling**
```css
/* Container: py-16 mt-12 */
/* Card: bg-gradient-to-br from-primary to-[#a15842] rounded-3xl p-8 md:p-12 */
/* Title: font-headline text-3xl md:text-4xl font-bold mb-4 */
/* Description: text-white/80 max-w-2xl mx-auto mb-8 */
/* Buttons: px-8 py-4 rounded-full font-bold */
```

#### **Empty State Styling**
```css
/* Container: py-24 text-center bg-white/50 rounded-3xl border border-dashed border-primary/20 */
/* Icon: text-9xl text-primary/20 */
/* Title: font-headline text-2xl font-bold */
/* Description: text-base text-text-primary-light/60 */
```

---

### 🔄 Navigation Flow in App.tsx

#### **Current Structure:**
```typescript
// App.tsx passes navigation callbacks to all pages
<DesignFlow 
  onBack={goHome} 
  onViewSaved={goToSaved} 
  onBookConsultation={goToBooking}
  onGallery={goToGallery}
  onArtists={goToArtists}
/>

<SavedDesigns 
  onStartNew={startFlow} 
  onBack={goHome}
  onGallery={goToGallery}
  onArtists={goToArtists}
  onBooking={goToBooking}
/>

// etc...
```

#### **Adding New Navigation:**
1. Add callback to page props interface
2. Pass callback from App.tsx
3. Use callback in page component
4. Add button/link with onClick={callback}

---

### 📱 Responsive Considerations

#### **Breadcrumbs:**
```typescript
// Hide on mobile if needed
<div className="hidden md:flex items-center gap-2">
  <Breadcrumb items={...} />
</div>
```

#### **CTA Sections:**
```typescript
// Stack buttons on mobile
<div className="flex flex-col sm:flex-row gap-4 justify-center">
  {/* Buttons */}
</div>
```

#### **Navigation:**
```typescript
// Header has built-in mobile menu
// QuickNav FAB is mobile-friendly
// ScrollToTop positioned for mobile (bottom-24 right-8)
```

---

### 🧪 Testing Checklist

When adding navigation to a new page:

- [ ] Breadcrumb shows correct path
- [ ] Back button works
- [ ] Header navigation present (if applicable)
- [ ] Footer present (if applicable)
- [ ] QuickNav FAB accessible
- [ ] Scroll to top appears after scrolling
- [ ] All CTAs have onClick handlers
- [ ] Mobile menu works
- [ ] Keyboard navigation works
- [ ] No console errors
- [ ] TypeScript compiles
- [ ] Build succeeds

---

### 🐛 Common Issues & Solutions

#### **Issue: Breadcrumb not showing**
```typescript
// Solution: Import and add component
import Breadcrumb from './Breadcrumb';

<Breadcrumb items={[
  { label: 'Home', onClick: onBack },
  { label: 'Current Page' }
]} />
```

#### **Issue: Footer overlapping content**
```typescript
// Solution: Ensure parent has proper structure
<div className="min-h-screen">
  <main className="flex-1">
    {/* Content */}
  </main>
  <Footer />
</div>
```

#### **Issue: QuickNav not showing**
```typescript
// Solution: Check App.tsx - only shows on non-landing pages
{view !== AppView.LANDING && (
  <QuickNav
    onHome={goHome}
    onDesign={startFlow}
    onSaved={goToSaved}
    onGallery={goToGallery}
    onArtists={goToArtists}
  />
)}
```

#### **Issue: Scroll to top not appearing**
```typescript
// Solution: Check scroll position (needs 300px)
// Ensure component is imported and added
import ScrollToTop from './ScrollToTop';
<ScrollToTop />
```

---

### 📚 File Structure

```
src/
├── components/
│   ├── Breadcrumb.tsx          ← NEW
│   ├── ScrollToTop.tsx         ← NEW
│   ├── Header.tsx              ← Updated
│   ├── Footer.tsx              ← Existing
│   ├── QuickNav.tsx            ← Existing
│   ├── DesignFlow.tsx          ← Enhanced
│   ├── SavedDesigns.tsx        ← Enhanced
│   ├── Gallery.tsx             ← Enhanced
│   ├── Artists.tsx             ← Enhanced
│   ├── Booking.tsx             ← Enhanced
│   └── Profile.tsx             ← Enhanced
├── App.tsx                     ← Updated navigation props
└── types.ts                    ← Existing types
```

---

### 🎯 Best Practices

#### **1. Always Provide Navigation**
Every page should have:
- Way to go back (breadcrumb or back button)
- Way to access main sections (header or QuickNav)
- Way to take next action (CTAs)

#### **2. Use Consistent Patterns**
- Breadcrumbs at top of content
- CTAs before footer
- Footer at bottom
- ScrollToTop after footer

#### **3. Make CTAs Contextual**
- Gallery → "Start Designing"
- Artists → "Design Your Henna"
- Saved Designs → "Book Consultation"
- Design Result → "View Saved Designs"

#### **4. Handle Empty States**
Always provide:
- Helpful message
- Clear icon
- Action buttons
- Suggestions

#### **5. Mobile First**
- Test on mobile viewport
- Ensure touch targets are 44px+
- Stack buttons on small screens
- Hide non-essential elements

---

### 🚀 Quick Start for New Pages

```typescript
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Breadcrumb from './Breadcrumb';
import ScrollToTop from './ScrollToTop';

interface NewPageProps {
  onBack: () => void;
  onStartDesign?: () => void;
  // ... other navigation props
}

const NewPage: React.FC<NewPageProps> = ({ onBack, onStartDesign }) => {
  return (
    <div className="min-h-screen animate-fadeIn">
      {/* Header (if needed) */}
      <Header {...headerProps} />

      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Breadcrumb */}
        <Breadcrumb items={[
          { label: 'Home', onClick: onBack },
          { label: 'New Page' }
        ]} />

        {/* Page Content */}
        <main>
          {/* Your content here */}
        </main>

        {/* CTA Section (optional) */}
        <section className="py-16 mt-12">
          {/* CTA content */}
        </section>
      </div>

      {/* Footer */}
      <Footer />

      {/* Scroll to Top */}
      <ScrollToTop />
    </div>
  );
};

export default NewPage;
```

---

### 📖 Additional Resources

- **Navigation Flow Diagram**: See `NAVIGATION_FLOW_DIAGRAM.md`
- **UX Improvements**: See `NAVIGATION_UX_IMPROVEMENTS.md`
- **User Experience Summary**: See `UX_ENHANCEMENT_SUMMARY.md`

---

### 💡 Tips

1. **Reuse patterns** - Copy from existing enhanced pages
2. **Test navigation** - Click through all links
3. **Check mobile** - Use responsive design mode
4. **Verify TypeScript** - Run `npm run build`
5. **Follow conventions** - Match existing styling

---

**Happy coding! 🎨✨**
