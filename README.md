# Samrudhi Seva Trust - Official Website

A modern, fully optimized Next.js website for Samrudhi Seva Trust NGO, featuring beautiful animations, dynamic content, and comprehensive SEO optimization.

## 🚀 Features

### ✨ Core Features

- **Hero Section** with dynamic background slider (Ken Burns effect)
- **Testimonials** with swipeable carousel and beautiful animations
- **Interactive Gallery** with category tabs, full-size dialog viewer, and navigation
- **Video Section** with custom video cards and real video playback controls
- **CTA Section** redesigned for NGO with impact statistics
- **Full SEO Optimization** with structured data and meta tags

### ⚡ Performance Optimizations

- **Dynamic Imports** - All components are code-split for optimal bundle size
- **Image Optimization** - Next.js Image component with AVIF/WebP support
- **React Compiler** - Enabled for automatic performance optimization
- **Lazy Loading** - Components load only when needed with Suspense
- **Code Splitting** - Automatic chunking for faster page loads

### 🎨 Design Features

- **Framer Motion** animations throughout
- **Responsive Design** - Mobile-first approach
- **Tailwind CSS** for styling
- **Custom Background Slider** with multiple effects
- **Interactive Video Cards** with custom controls
- **Full-screen Image Viewer** with keyboard navigation

### 📊 SEO Features

- Comprehensive meta tags (Open Graph, Twitter Cards)
- Structured Data (Schema.org for NGO)
- Sitemap generation
- Robots.txt configuration
- Canonical URLs
- Performance monitoring ready

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Image Optimization**: Next.js Image
- **Performance**: React Compiler

## 📁 Project Structure

```
samrudhi-trust/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with SEO
│   │   ├── page.tsx            # Home page with dynamic imports
│   │   ├── sitemap.ts          # Auto-generated sitemap
│   │   ├── robots.ts           # Robots.txt configuration
│   │   └── globals.css         # Global styles
│   ├── features/
│   │   └── components/
│   │       ├── HeroSection.tsx       # Hero with background slider
│   │       ├── Testimonials.tsx      # Swipeable testimonials
│   │       ├── Gallery.tsx           # Category-based gallery
│   │       ├── VideoSection.tsx      # Custom video cards
│   │       ├── CTASection.tsx        # NGO-focused CTA
│   │       ├── BackgroundSlider.tsx  # Reusable slider
│   │       ├── Navbar.tsx
│   │       ├── Footer.tsx
│   │       ├── WhatWeDo.tsx
│   │       ├── OurStory.tsx
│   │       └── RealTimeImpact.tsx
│   └── lib/
│       ├── seo.ts                # SEO utilities
│       ├── structured-data.ts    # Schema.org data
│       ├── animations.ts         # Reusable animations
│       └── web-vitals.ts         # Performance monitoring
├── public/                       # Static assets
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
└── tsconfig.json                # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd samrudhi-trust
```

2. Install dependencies:

```bash
pnpm install
```

3. Run the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
pnpm build
pnpm start
```

## 📦 Key Components

### Hero Section

- Dynamic background slider with 4 transition effects
- Animated text and CTAs
- Scroll indicator
- Ken Burns effect

### Gallery

- **Category Tabs**: Filter by Food Distribution, Blood Donation, Child Welfare
- **Grid Layout**: Responsive masonry-style grid
- **Full-size Viewer**: Modal with image navigation
- **Keyboard Support**: Arrow keys for navigation

### Video Section

- Custom video player controls
- Play/pause functionality
- Mute/unmute toggle
- Progress bar
- Hover controls

### Testimonials

- Swipeable carousel
- Drag support
- Auto-play option
- Star ratings
- Beautiful animations

## 🎨 Customization

### Colors

Update colors in `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: '#10b981',    // Emerald
      secondary: '#f97316',  // Orange
    }
  }
}
```

### SEO

Update SEO settings in `src/app/layout.tsx` and `src/lib/seo.ts`.

### Images

Replace placeholder images with your own in the components.

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SITE_URL=https://samrudhisevatrust.org
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Image Domains

Add your image domains in `next.config.ts`:

```typescript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'your-domain.com' },
  ],
}
```

## 📈 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Optimized for LCP, FID, CLS
- **Bundle Size**: Optimized with code splitting
- **Images**: AVIF/WebP with lazy loading

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Framer Motion for smooth animations
- Lucide for beautiful icons
- Unsplash for placeholder images

---

Built with ❤️ for Samrudhi Seva Trust
