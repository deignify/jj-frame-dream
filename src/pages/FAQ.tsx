import Layout from '@/components/Layout';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQ = () => {
  const { data: settings } = useBusinessSettings();
  const businessName = settings?.business_name || 'JJ Frame Studio';

  const faqs = [
    {
      question: "What materials are your frames made from?",
      answer: "Our frames are crafted from premium materials including solid hardwoods (oak, walnut, mahogany), high-quality metals (aluminum, brass), and sustainable bamboo. Each material is carefully selected for durability and aesthetic appeal."
    },
    {
      question: "Do you offer custom frame sizes?",
      answer: "Yes! We offer custom sizing for all our frame styles. Simply contact us with your dimensions and we'll create a perfectly sized frame for your artwork or photograph."
    },
    {
      question: "How do I care for my frame?",
      answer: "For wooden frames, dust regularly with a soft, dry cloth. Avoid direct sunlight and high humidity. For metal frames, wipe with a slightly damp cloth and dry immediately. Never use harsh chemicals on any frame."
    },
    {
      question: "What type of glass do you use?",
      answer: "We use museum-grade glass with UV protection to prevent fading and damage to your precious photos and artwork. Anti-reflective options are also available for an additional charge."
    },
    {
      question: "Can I return or exchange a frame?",
      answer: "Yes, we accept returns within 30 days of purchase for unused items in original packaging. Custom orders are non-refundable but we'll work with you to ensure satisfaction."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 5-7 business days within India. Express shipping (2-3 days) is available at checkout. Custom orders may take an additional 3-5 days for production."
    },
    {
      question: "Do frames come with hanging hardware?",
      answer: "Yes! All our frames include appropriate hanging hardware - wall hooks and wire for wall mounting, and easel backs for tabletop display where applicable."
    },
    {
      question: "Are your frames eco-friendly?",
      answer: "We're committed to sustainability. Our wooden frames use FSC-certified wood, and we use recyclable packaging materials. We also offer a frame recycling program."
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-primary font-medium text-sm mb-2 block">Help Center</span>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-muted-foreground">
              Find answers to common questions about {businessName} products and services.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card rounded-2xl border border-border px-6"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 text-center bg-card rounded-3xl p-8">
            <h2 className="text-xl font-bold text-foreground mb-2">Still have questions?</h2>
            <p className="text-muted-foreground mb-4">
              We're here to help! Reach out to our customer support team.
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-6 py-2.5 font-medium hover:bg-primary/90 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQ;
