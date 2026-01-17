import { MapPin } from 'lucide-react';

const TopBanner = () => {
  return (
    <div className="bg-primary text-primary-foreground py-2 text-center text-sm">
      <div className="container mx-auto px-4 flex items-center justify-center gap-2">
        <MapPin className="h-4 w-4" />
        <span>Delivery only available in Hyderabad</span>
      </div>
    </div>
  );
};

export default TopBanner;