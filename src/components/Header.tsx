import { Button } from "@/components/ui/button";
import { Sparkles, Coins, Bell, User, Search } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  const tokenBalance = 850; // Example token balance

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Inceptia
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search posts, prompts, creators..."
                className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Token Balance */}
            <Link to="/tokens">
              <Button 
                variant="outline" 
                className="border-primary/50 hover:bg-primary/10 rounded-full gap-2 group"
              >
                <Coins className="w-5 h-5 text-primary group-hover:rotate-12 transition-transform" />
                <span className="font-bold text-primary">{tokenBalance}</span>
              </Button>
            </Link>

            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full hover:bg-card relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
            </Button>

            {/* Profile */}
            <Link to="/profile">
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full hover:bg-card"
              >
                <User className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
