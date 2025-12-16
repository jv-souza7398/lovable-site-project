-- Add destacar_home column to drinks table
ALTER TABLE public.drinks 
ADD COLUMN destacar_home boolean NOT NULL DEFAULT false;