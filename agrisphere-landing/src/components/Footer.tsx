import { Leaf } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative py-16 px-6 border-t border-border">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Leaf className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">AgriSphere</span>
        </div>

        <p className="text-sm text-muted-foreground mb-2">
          Project built for:{" "}
          <span className="text-foreground font-medium">
            Sustainable Planet – Water & Agriculture Resilience Hackathon
          </span>
        </p>

        <p className="text-sm text-gradient-hero font-medium italic mt-4">
          "Technology Serving Those Who Feed the World."
        </p>
      </div>
    </footer>
  );
};

export default Footer;
