import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, mediaType, content, imageUrl } = await req.json();
    
    // Validate prompt
    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (prompt.length < 10 || prompt.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Prompt must be between 10 and 1000 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate content if provided
    if (content && content.length > 5000) {
      return new Response(
        JSON.stringify({ error: 'Content must be less than 5000 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Atomically deduct tokens before AI generation
    const tokenCost = mediaType === 'video' ? 100 : 10;
    
    const { data: deductionResult, error: deductionError } = await supabase
      .rpc('deduct_tokens', {
        p_user_id: user.id,
        p_amount: tokenCost
      });

    if (deductionError) {
      console.error('Token deduction error:', deductionError);
      return new Response(
        JSON.stringify({ error: 'Failed to process token deduction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if deduction was successful
    if (!deductionResult || deductionResult.length === 0 || !deductionResult[0].success) {
      const balance = deductionResult?.[0]?.new_balance ?? 0;
      return new Response(
        JSON.stringify({ error: 'Insufficient tokens', required: tokenCost, balance }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newBalance = deductionResult[0].new_balance;

    // Generate AI content using Lovable AI
    console.log('Generating AI content with prompt:', prompt, 'Image URL:', imageUrl);
    
    const messages: any[] = imageUrl 
      ? [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ]
      : [
          {
            role: 'user',
            content: prompt
          }
        ];
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages,
        modalities: ['image', 'text']
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI Gateway error:', aiResponse.status, await aiResponse.text());
      return new Response(
        JSON.stringify({ error: 'AI generation failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const generatedImageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      console.error('No image in response:', aiData);
      return new Response(
        JSON.stringify({ error: 'No image generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create post with generated content
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content: content || `Generated with AI: "${prompt}"`,
        prompt: prompt,
        media_url: generatedImageUrl,
        media_type: mediaType,
        token_cost: tokenCost,
        is_ai_generated: true,
        generation_status: 'completed'
      })
      .select()
      .single();

    if (postError) {
      console.error('Failed to create post:', postError);
      return new Response(
        JSON.stringify({ error: 'Failed to create post' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        post,
        tokensSpent: tokenCost,
        remainingTokens: newBalance
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in generate-ai-content:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
