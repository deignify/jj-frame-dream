import Layout from '@/components/Layout';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';

const RefundPolicy = () => {
  const { data: settings } = useBusinessSettings();
  const businessName = settings?.business_name || 'JJ Frame Studio';
  const businessEmail = settings?.business_email || 'hello@jjframestudio.com';
  const businessPhone = settings?.business_phone || '+91 98765 43210';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Refund & Cancellation Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Order Cancellation</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You may cancel your order under the following conditions:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Before dispatch:</strong> Full refund will be processed within 5-7 business days</li>
                <li><strong>After dispatch:</strong> Order cannot be cancelled. Please refuse delivery or initiate a return after receiving the product</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Refund Eligibility</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Refunds are applicable in the following cases:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Product received is damaged or defective</li>
                <li>Wrong product delivered</li>
                <li>Product significantly different from the description</li>
                <li>Order cancelled before dispatch</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Non-Refundable Items</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The following items are not eligible for refund:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Custom-made or personalized frames</li>
                <li>Products with signs of use or damage caused by the customer</li>
                <li>Products returned without original packaging</li>
                <li>Items marked as "Final Sale" or "Non-Returnable"</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Refund Process</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">To initiate a refund:</p>
              <ol className="list-decimal list-inside text-muted-foreground space-y-2 ml-4">
                <li>Contact our customer support within 7 days of delivery</li>
                <li>Provide your order ID and reason for refund</li>
                <li>Submit photos of the product (if damaged or defective)</li>
                <li>Await approval from our team (usually within 24-48 hours)</li>
                <li>Return the product in original packaging (if applicable)</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Refund Timeline</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>UPI/Net Banking:</strong> 5-7 business days</li>
                <li><strong>Credit/Debit Card:</strong> 7-10 business days</li>
                <li><strong>Cash on Delivery:</strong> Bank transfer within 7-10 business days (bank details required)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Exchange Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We offer exchanges for products of equal or higher value. For higher-value products, 
                you will need to pay the difference. Exchanges are subject to product availability.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Damaged Products</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you receive a damaged product, please take photos/videos while unboxing and report 
                within 24 hours of delivery. We will arrange for a replacement or full refund at no additional cost.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Contact for Refunds</h2>
              <p className="text-muted-foreground leading-relaxed">
                For refund-related queries, please contact us:
              </p>
              <ul className="list-none text-muted-foreground space-y-2 mt-4">
                <li>Email: <a href={`mailto:${businessEmail}`} className="text-primary hover:underline">{businessEmail}</a></li>
                <li>Phone: <a href={`tel:${businessPhone}`} className="text-primary hover:underline">{businessPhone}</a></li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RefundPolicy;