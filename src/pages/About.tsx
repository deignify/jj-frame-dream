import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Heart, Award, Users, Leaf } from 'lucide-react';

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-card py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Our Story
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              JJ Frame Studio was born from a simple belief: every memory deserves 
              a beautiful home. What started as a small workshop in 2010 has grown 
              into a trusted name in premium photo frames.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary font-medium text-sm mb-2 block">Our Mission</span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Preserving Moments That Matter
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                We believe that photographs are more than just images—they're gateways 
                to our most precious memories. That's why we craft each frame with the 
                utmost care and attention to detail.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                From the selection of materials to the final finishing touches, every 
                step of our process is guided by our commitment to quality and our 
                passion for preserving the moments that matter most to you.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-3xl p-6 text-center">
                <Heart className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-2xl text-foreground mb-1">10K+</h3>
                <p className="text-muted-foreground text-sm">Happy Customers</p>
              </div>
              <div className="bg-card rounded-3xl p-6 text-center">
                <Award className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-2xl text-foreground mb-1">14+</h3>
                <p className="text-muted-foreground text-sm">Years Experience</p>
              </div>
              <div className="bg-card rounded-3xl p-6 text-center">
                <Users className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-2xl text-foreground mb-1">25+</h3>
                <p className="text-muted-foreground text-sm">Expert Artisans</p>
              </div>
              <div className="bg-card rounded-3xl p-6 text-center">
                <Leaf className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-2xl text-foreground mb-1">100%</h3>
                <p className="text-muted-foreground text-sm">Sustainable</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-medium text-sm mb-2 block">Our Values</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              What We Stand For
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-2">Craftsmanship</h3>
              <p className="text-muted-foreground">
                Every frame is handcrafted with precision and care by our skilled artisans.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌿</span>
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-2">Sustainability</h3>
              <p className="text-muted-foreground">
                We source materials responsibly and minimize our environmental footprint.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💝</span>
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-2">Customer First</h3>
              <p className="text-muted-foreground">
                Your satisfaction is our priority. We're here to help you find the perfect frame.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Frame Your Memories?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Explore our collection and find the perfect frame for your precious moments.
          </p>
          <Link to="/products">
            <Button size="lg" className="rounded-full px-8">
              Shop Now
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default About;
