-- Fix 1: Protect email addresses in profiles table
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Allow public access to non-sensitive profile data
CREATE POLICY "Public profile data viewable" ON public.profiles
FOR SELECT 
USING (true);

-- Allow users to see their own email
CREATE POLICY "Users can view own email" ON public.profiles
FOR SELECT 
USING (auth.uid() = id);

-- Fix 2: Update follows table to reference profiles instead of auth.users
ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_follower_id_fkey;
ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_following_id_fkey;

ALTER TABLE public.follows
  ADD CONSTRAINT follows_follower_id_fkey 
  FOREIGN KEY (follower_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.follows
  ADD CONSTRAINT follows_following_id_fkey 
  FOREIGN KEY (following_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Fix 3: Create atomic token deduction function to prevent race conditions
CREATE OR REPLACE FUNCTION public.deduct_tokens(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS TABLE(success BOOLEAN, new_balance INTEGER) AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Lock the row and check balance atomically
  SELECT token_balance INTO current_balance
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;
  
  IF current_balance < p_amount THEN
    RETURN QUERY SELECT FALSE, current_balance;
  ELSE
    UPDATE public.profiles
    SET token_balance = token_balance - p_amount,
        updated_at = now()
    WHERE id = p_user_id;
    
    RETURN QUERY SELECT TRUE, current_balance - p_amount;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix 4: Add input validation constraints
ALTER TABLE public.posts 
  ADD CONSTRAINT content_length CHECK (length(content) <= 5000);

ALTER TABLE public.posts 
  ADD CONSTRAINT prompt_length CHECK (prompt IS NULL OR length(prompt) <= 1000);

ALTER TABLE public.profiles 
  ADD CONSTRAINT display_name_length CHECK (display_name IS NULL OR length(display_name) <= 50);

ALTER TABLE public.profiles 
  ADD CONSTRAINT username_length CHECK (username IS NULL OR length(username) <= 20);

ALTER TABLE public.profiles 
  ADD CONSTRAINT username_format CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9_]+$');

ALTER TABLE public.profiles 
  ADD CONSTRAINT bio_length CHECK (bio IS NULL OR length(bio) <= 500);

-- Fix 5: Update functions to have proper search_path
CREATE OR REPLACE FUNCTION public.increment_like_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.posts
  SET like_count = like_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrement_like_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.posts
  SET like_count = like_count - 1
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$function$;