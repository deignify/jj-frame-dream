import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import FeatureCard from '@/components/FeatureCard';
import Layout from '@/components/Layout';
import { useFeaturedProducts } from '@/hooks/useProducts';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { Paintbrush, Shield, Ruler, Package, Heart, Loader2 } from 'lucide-react';
import heroImage from '@/assets/hero-frames.jpg';

const Index = () => {
  const { data: featuredProducts, isLoading } = useFeaturedProducts();
  const { data: settings } = useBusinessSettings();

  const businessTagline = settings?.business_tagline || 'Preserve Your Memories in Perfect Frames';

  const features = [
    {
      icon: Paintbrush,
      title: "Handcrafted Quality",
      description: "Each frame is carefully handcrafted by skilled artisans using time-honored techniques."
    },
    {
      icon: Shield,
      title: "Premium Materials",
      description: "We source only the finest materials - solid woods, quality metals, and museum-grade glass."
    },
    {
      icon: Ruler,
      title: "Custom Sizes",
      description: "Can't find the right size? We offer custom sizing to perfectly fit your precious photos."
    },
    {
      icon: Package,
      title: "Secure Packaging",
      description: "Every frame ships in protective packaging designed to ensure it arrives perfect."
    },
    {
      icon: Heart,
      title: "Made with Love",
      description: "We pour our passion into every frame, because your memories deserve nothing less."
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage}
            alt="Premium photo frames"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="py-24 md:py-32 lg:py-40 max-w-2xl">
            <span className="inline-block text-primary font-medium text-sm mb-4 bg-accent px-4 py-1.5 rounded-full">
              Handcrafted with Love
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              {businessTagline.split(' ').slice(0, -2).join(' ')}{' '}
              <span className="text-primary">{businessTagline.split(' ').slice(-2).join(' ')}</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Discover our collection of handcrafted premium photo frames designed to showcase 
              your most cherished moments with elegance and style.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products">
                <Button size="lg" className="rounded-full px-8 text-base">
                  Shop Frames
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="rounded-full px-8 text-base">
                  Our Story
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-medium text-sm mb-2 block">Our Collection</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Frames
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our most popular frames, loved by thousands of customers worldwide.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {featuredProducts?.map(product => (
                <ProductCard key={product.id} product={product} showActions />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/products">
              <Button variant="outline" size="lg" className="rounded-full px-8">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-medium text-sm mb-2 block">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              The JJ Frame Studio Difference
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're not just selling frames. We're helping you preserve moments that matter.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Frame Your Memories?
            </h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8 text-lg">
              Browse our collection and find the perfect frame to showcase your precious moments.
            </p>
            <Link to="/products">
              <Button 
                size="lg" 
                variant="secondary"
                className="rounded-full px-8 text-base"
              >
                Start Framing Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
