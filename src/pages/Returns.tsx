import Layout from '@/components/Layout';
import { RotateCcw, Clock, CheckCircle, XCircle, ArrowRight, Mail } from 'lucide-react';

const Returns = () => {
  const steps = [
    {
      step: 1,
      title: "Initiate Return",
      description: "Contact us within 30 days of delivery with your order number and reason for return."
    },
    {
      step: 2,
      title: "Get Approval",
      description: "We'll review your request and send you a return shipping label within 24 hours."
    },
    {
      step: 3,
      title: "Ship It Back",
      description: "Pack the item securely in original packaging and ship it using the provided label."
    },
    {
      step: 4,
      title: "Get Refund",
      description: "Once received and inspected, your refund will be processed within 5-7 business days."
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-primary font-medium text-sm mb-2 block">Easy Returns</span>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Returns & Refunds
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Not completely satisfied? We make returns easy and hassle-free.
            </p>
          </div>

          {/* Return Policy Highlights */}
          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            <div className="bg-card rounded-3xl p-6 text-center border border-border">
              <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">30-Day Returns</h3>
              <p className="text-muted-foreground text-sm">
                Return within 30 days of delivery for a full refund
              </p>
            </div>
            <div className="bg-card rounded-3xl p-6 text-center border border-border">
              <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Free Returns</h3>
              <p className="text-muted-foreground text-sm">
                We provide prepaid return shipping labels
              </p>
            </div>
            <div className="bg-card rounded-3xl p-6 text-center border border-border">
              <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Easy Exchange</h3>
              <p className="text-muted-foreground text-sm">
                Exchange for a different size or style at no extra cost
              </p>
            </div>
          </div>

          {/* Return Process Steps */}
          <div className="bg-card rounded-3xl p-8 mb-12">
            <h2 className="text-xl font-bold text-foreground mb-8 text-center">How to Return</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((item, index) => (
                <div key={item.step} className="relative">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-4">
                      {item.step}
                    </div>
                    <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute top-5 -right-3 h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Eligibility */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-card rounded-3xl p-8 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-bold text-foreground">Eligible for Return</h2>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>Unused items in original packaging</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>Items returned within 30 days of delivery</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>Defective or damaged items (notify within 48 hours)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>Wrong item received</span>
                </li>
              </ul>
            </div>

            <div className="bg-card rounded-3xl p-8 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <XCircle className="h-6 w-6 text-destructive" />
                <h2 className="text-xl font-bold text-foreground">Not Eligible</h2>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                  <span>Custom-made or personalized frames</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                  <span>Items damaged due to misuse</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                  <span>Items without original packaging</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                  <span>Items returned after 30 days</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Refund Info */}
          <div className="bg-card rounded-3xl p-8 mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4">Refund Information</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">Processing Time:</strong> Refunds are processed within 5-7 business days 
                after we receive and inspect the returned item.
              </p>
              <p>
                <strong className="text-foreground">Refund Method:</strong> Refunds are issued to the original payment method. 
                Credit/debit card refunds may take an additional 5-10 business days to appear on your statement.
              </p>
              <p>
                <strong className="text-foreground">Partial Refunds:</strong> Items returned in used condition or without 
                original packaging may be subject to a restocking fee of up to 20%.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center bg-primary/10 rounded-3xl p-8">
            <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Start a Return</h2>
            <p className="text-muted-foreground mb-4">
              Ready to initiate a return? Contact our support team.
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

export default Returns;
