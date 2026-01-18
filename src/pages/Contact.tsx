import { Mail, Phone, MapPin, Clock, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Layout from '@/components/Layout';
import { useState } from 'react';
import { useSubmitInquiry } from '@/hooks/useInquiries';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const submitInquiry = useSubmitInquiry();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitInquiry.mutateAsync(formData);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-card py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have a question about our frames or need help with an order? 
            We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-card rounded-3xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email Us</h3>
                    <p className="text-muted-foreground text-sm">hello@jjframestudio.com</p>
                    <p className="text-muted-foreground text-sm">support@jjframestudio.com</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-3xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Call Us</h3>
                    <p className="text-muted-foreground text-sm">+1 (555) 123-4567</p>
                    <p className="text-muted-foreground text-sm">+1 (555) 987-6543</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-3xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Visit Us</h3>
                    <p className="text-muted-foreground text-sm">123 Frame Street</p>
                    <p className="text-muted-foreground text-sm">Art District, NY 10001</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-3xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Business Hours</h3>
                    <p className="text-muted-foreground text-sm">Mon - Fri: 9AM - 6PM</p>
                    <p className="text-muted-foreground text-sm">Sat: 10AM - 4PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-3xl p-6 md:p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="rounded-full"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="rounded-full"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="rounded-full"
                      placeholder="How can we help?"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="rounded-2xl min-h-[150px]"
                      placeholder="Tell us more about your inquiry..."
                      required
                    />
                  </div>

                  <Button type="submit" className="rounded-full px-8" disabled={submitInquiry.isPending}>
                    {submitInquiry.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {submitInquiry.isPending ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
