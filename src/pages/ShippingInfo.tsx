import Layout from '@/components/Layout';
import { Truck, Clock, MapPin, Package, Shield, Phone } from 'lucide-react';

const ShippingInfo = () => {
  const shippingMethods = [
    {
      name: "Standard Shipping",
      time: "5-7 Business Days",
      price: "₹99 (Free on orders over ₹999)",
      description: "Reliable delivery with tracking"
    },
    {
      name: "Express Shipping",
      time: "2-3 Business Days",
      price: "₹199",
      description: "Priority handling and faster delivery"
    },
    {
      name: "Same Day Delivery",
      time: "Same Day (Order before 12 PM)",
      price: "₹349",
      description: "Available in select cities only"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-primary font-medium text-sm mb-2 block">Delivery</span>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Shipping Information
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We ensure your precious frames reach you safely and on time.
            </p>
          </div>

          {/* Shipping Methods */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {shippingMethods.map((method, index) => (
              <div key={index} className="bg-card rounded-3xl p-6 border border-border">
                <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center mb-4">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-1">{method.name}</h3>
                <p className="text-primary font-medium text-sm mb-2">{method.time}</p>
                <p className="text-lg font-bold text-foreground mb-2">{method.price}</p>
                <p className="text-muted-foreground text-sm">{method.description}</p>
              </div>
            ))}
          </div>

          {/* Info Sections */}
          <div className="space-y-8">
            <div className="bg-card rounded-3xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-3">Delivery Areas</h2>
                  <p className="text-muted-foreground mb-4">
                    We deliver to all major cities and towns across India. Remote areas may take an additional 2-3 days.
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Metro cities: Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad</li>
                    <li>Tier 2 cities: 5-7 business days</li>
                    <li>Remote areas: 7-10 business days</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-3xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center flex-shrink-0">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-3">Packaging</h2>
                  <p className="text-muted-foreground mb-4">
                    Every frame is carefully packaged to ensure safe delivery:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Corner protectors on all frames</li>
                    <li>Bubble wrap protection</li>
                    <li>Sturdy corrugated boxes</li>
                    <li>Fragile stickers and handling instructions</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-3xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-3">Shipping Insurance</h2>
                  <p className="text-muted-foreground">
                    All orders are automatically insured against damage during transit. If your frame arrives damaged, 
                    we'll replace it free of charge. Simply contact us within 48 hours of delivery with photos of the damage.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-3xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-3">Order Processing</h2>
                  <p className="text-muted-foreground">
                    Orders placed before 2 PM are processed the same day. Custom orders require 3-5 additional business days 
                    for production before shipping. You'll receive a tracking number via email once your order ships.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center bg-primary/10 rounded-3xl p-8">
            <Phone className="h-8 w-8 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Need Help?</h2>
            <p className="text-muted-foreground mb-4">
              Have questions about shipping? Our team is here to help.
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-6 py-2.5 font-medium hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ShippingInfo;
