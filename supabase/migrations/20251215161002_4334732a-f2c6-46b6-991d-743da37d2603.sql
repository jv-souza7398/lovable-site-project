-- Create drinks table
CREATE TABLE public.drinks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  video_url TEXT,
  imagem_url TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('drinks-sem-alcool', 'drinks-padrao')),
  caracteristicas JSONB DEFAULT '[]'::jsonb,
  ingredientes TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.drinks ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (drinks are public content)
CREATE POLICY "Drinks are publicly viewable" 
ON public.drinks 
FOR SELECT 
USING (true);

-- Create policy for authenticated users to manage drinks (admin)
CREATE POLICY "Authenticated users can insert drinks" 
ON public.drinks 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update drinks" 
ON public.drinks 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete drinks" 
ON public.drinks 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_drinks_updated_at
BEFORE UPDATE ON public.drinks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();