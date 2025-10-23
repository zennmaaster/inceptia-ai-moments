-- Fix search_path for follower count functions
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