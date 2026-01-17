import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useSubmitReview } from '@/hooks/useReviews';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

const ReviewForm = ({ productId, onSuccess }: ReviewFormProps) => {
  const submitReview = useSubmitReview();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reviewText, setReviewText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      return;
    }

    await submitReview.mutateAsync({
      product_id: productId,
      customer_name: name,
      customer_email: email,
      rating,
      review_text: reviewText || null
    });

    // Reset form
    setRating(0);
    setName('');
    setEmail('');
    setReviewText('');
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Rating *</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1"
            >
              <Star
                className={cn(
                  "h-6 w-6 transition-colors",
                  (hoverRating || rating) >= star
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-muted text-muted hover:text-yellow-400"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="rounded-full"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="rounded-full"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="review">Review (optional)</Label>
        <Textarea
          id="review"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your experience with this product..."
          className="rounded-2xl min-h-[100px]"
        />
      </div>

      <Button
        type="submit"
        className="rounded-full"
        disabled={rating === 0 || !name || !email || submitReview.isPending}
      >
        {submitReview.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Submit Review
      </Button>
    </form>
  );
};

export default ReviewForm;
