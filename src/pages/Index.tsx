import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Glow Background */}
        <div className="absolute inset-0 gradient-glow opacity-60" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            {/* Logo/Brand */}
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-primary/30">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary">Welcome to Mmmaya</span>
            </div>

            {/* Hero Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Share Your World,{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse-glow">
                Enhanced by AI
              </span>
            </h1>

            {/* Hero Subheadline */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Create stunning AI-generated images and videos from your ideas. Share moments that matter with a token-powered creative economy.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link to="/feed">
                <Button size="lg" className="gradient-primary text-primary-foreground font-semibold px-8 py-6 text-lg rounded-full hover:scale-105 transition-transform glow-primary">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Creating
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10 px-8 py-6 text-lg rounded-full">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8 border-t border-border/50">
              <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <div className="text-3xl font-bold text-primary">100+</div>
                <div className="text-sm text-muted-foreground">Free Tokens</div>
              </div>
              <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <div className="text-3xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Creators</div>
              </div>
              <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
                <div className="text-3xl font-bold text-primary">1M+</div>
                <div className="text-sm text-muted-foreground">AI Creations</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl font-bold mb-4">Why Creators Love Mmmaya</h2>
          <p className="text-xl text-muted-foreground">Everything you need to create, share, and monetize your AI-enhanced content</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 shadow-card hover:shadow-elevated animate-scale-in">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-7 h-7 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">AI-Powered Creation</h3>
            <p className="text-muted-foreground leading-relaxed">
              Turn your ideas into stunning visuals and videos. Just describe what you want, and watch AI bring it to life in seconds.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 shadow-card hover:shadow-elevated animate-scale-in" style={{ animationDelay: "0.1s" }}>
            <div className="w-14 h-14 rounded-2xl gradient-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Discover Your Tribe</h3>
            <p className="text-muted-foreground leading-relaxed">
              Find creators with similar vibes. Our affinity algorithm connects you with your creative twins and inspiring content.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 shadow-card hover:shadow-elevated animate-scale-in" style={{ animationDelay: "0.2s" }}>
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-7 h-7 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Token Economy</h3>
            <p className="text-muted-foreground leading-relaxed">
              Earn tokens by referring friends. Spend them on premium AI generations. Build your creative empire with rewards.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-card/50 backdrop-blur-sm border border-primary/30 shadow-elevated animate-fade-in">
          <h2 className="text-4xl font-bold mb-4">Ready to Create Something Amazing?</h2>
          <p className="text-xl text-muted-foreground mb-8">Join thousands of creators turning ideas into reality with AI</p>
          <Link to="/auth">
            <Button size="lg" className="gradient-primary text-primary-foreground font-semibold px-10 py-6 text-lg rounded-full hover:scale-105 transition-transform glow-primary">
              <Sparkles className="w-5 h-5 mr-2" />
              Get Started - 100 Free Tokens
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
