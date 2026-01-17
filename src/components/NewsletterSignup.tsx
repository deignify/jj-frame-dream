import { useState } from 'react';
import { Mail, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSubscribe } from '@/hooks/useNewsletter';

interface NewsletterSignupProps {
  variant?: 'inline' | 'card';
}

const NewsletterSignup = ({ variant = 'inline' }: NewsletterSignupProps) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const subscribe = useSubscribe();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      await subscribe.mutateAsync(email);
      setSubmitted(true);
      setEmail('');
    } catch (error) {
      // Error handled by the hook
    }
  };

  if (submitted) {
    return (
      <div className={variant === 'card' ? "bg-card rounded-3xl p-8 text-center" : "text-center py-4"}>
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">You're subscribed!</h3>
        <p className="text-muted-foreground text-sm">
          Thanks for subscribing to our newsletter.
        </p>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="bg-card rounded-3xl p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Stay Updated</h3>
          <p className="text-muted-foreground text-sm">
            Subscribe to get special offers, new arrivals, and styling tips.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="rounded-full"
            required
          />
          <Button
            type="submit"
            className="w-full rounded-full"
            disabled={subscribe.isPending}
          >
            {subscribe.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Subscribe
          </Button>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="rounded-full flex-1"
        required
      />
      <Button
        type="submit"
        className="rounded-full"
        disabled={subscribe.isPending}
      >
        {subscribe.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Subscribe'}
      </Button>
    </form>
  );
};

export default NewsletterSignup;
