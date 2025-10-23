-- Create follows table for user following functionality
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS on follows
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for follows
CREATE POLICY "Follows are viewable by everyone"
ON public.follows FOR SELECT USING (true);

CREATE POLICY "Users can follow others"
ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Create storage bucket for user uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-images', 'user-images', true);

-- Storage policies for user uploads
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'user-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Images are publicly accessible"
ON storage.objects FOR SELECT 
USING (bucket_id = 'user-images');

CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'user-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'user-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Function for daily token refresh
CREATE OR REPLACE FUNCTION public.refresh_daily_tokens()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET 
    token_balance = token_balance + 10,
    updated_at = now()
  WHERE 
    -- Only refresh if last update was more than 24 hours ago
    updated_at < now() - interval '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add last_token_refresh column to track when tokens were last refreshed
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_token_refresh TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update the refresh function to use the new column
CREATE OR REPLACE FUNCTION public.refresh_daily_tokens()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET 
    token_balance = token_balance + 10,
    last_token_refresh = now(),
    updated_at = now()
  WHERE 
    last_token_refresh < now() - interval '24 hours'
    OR last_token_refresh IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add follower and following counts to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Functions to update follow counts
CREATE OR REPLACE FUNCTION public.increment_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
  UPDATE public.profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.decrement_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles SET follower_count = follower_count - 1 WHERE id = OLD.following_id;
  UPDATE public.profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for follow counts
CREATE TRIGGER on_follow_created
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.increment_follower_count();

CREATE TRIGGER on_follow_deleted
  AFTER DELETE ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.decrement_follower_count();