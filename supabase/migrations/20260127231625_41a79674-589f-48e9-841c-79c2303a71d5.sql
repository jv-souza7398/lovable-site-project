-- Remove a constraint antiga e adiciona nova com "sublime"
ALTER TABLE public.drinks DROP CONSTRAINT IF EXISTS drinks_categoria_check;

ALTER TABLE public.drinks ADD CONSTRAINT drinks_categoria_check 
CHECK (categoria IN ('drinks-sem-alcool', 'drinks-padrao', 'sublime'));