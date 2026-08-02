import { Hero } from '@/components/home/Hero';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { FeaturedSnippets } from '@/components/home/FeaturedSnippets';
import { ToolsShowcase } from '@/components/home/ToolsShowcase';

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <FeaturedSnippets />
      <ToolsShowcase />
    </>
  );
}
