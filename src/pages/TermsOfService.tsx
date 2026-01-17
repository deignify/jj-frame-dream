import Layout from '@/components/Layout';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';

const TermsOfService = () => {
  const { data: settings } = useBusinessSettings();
  const businessName = settings?.business_name || 'JJ Frame Studio';
  const businessEmail = settings?.business_email || 'hello@jjframestudio.com';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using the {businessName} website and services, you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Products and Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                We offer handcrafted photo frames and related products. All products are subject to availability. 
                We reserve the right to discontinue any product at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Ordering and Payment</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>All orders are subject to acceptance and availability</li>
                <li>Prices are displayed in Indian Rupees (INR) and include applicable taxes</li>
                <li>We accept payments through Razorpay and Cash on Delivery</li>
                <li>Payment must be received in full before order dispatch (for online payments)</li>
                <li>We reserve the right to refuse any order at our discretion</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Shipping and Delivery</h2>
              <p className="text-muted-foreground leading-relaxed">
                We currently deliver only within Hyderabad. Delivery times are estimates and may vary based on 
                location and product availability. We are not responsible for delays caused by circumstances beyond our control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Returns and Refunds</h2>
              <p className="text-muted-foreground leading-relaxed">
                Please refer to our Returns Policy for detailed information about returns, exchanges, and refunds. 
                Products must be returned in original condition within the specified return period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content on this website, including text, images, logos, and designs, is the property of {businessName} 
                and is protected by copyright and trademark laws. Unauthorized use is prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. User Responsibilities</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">When using our services, you agree to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Provide accurate and complete information</li>
                <li>Not use the website for any unlawful purpose</li>
                <li>Not interfere with the website's operation</li>
                <li>Not attempt to gain unauthorized access to our systems</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, {businessName} shall not be liable for any indirect, incidental, 
                special, or consequential damages arising from your use of our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms of Service shall be governed by and construed in accordance with the laws of India. 
                Any disputes shall be subject to the exclusive jurisdiction of the courts in Hyderabad.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. 
                Your continued use of our services constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms of Service, please contact us at{' '}
                <a href={`mailto:${businessEmail}`} className="text-primary hover:underline">{businessEmail}</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TermsOfService;