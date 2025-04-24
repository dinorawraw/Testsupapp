// Este script contém o SQL para criar um usuário administrador
// Execute este script no editor SQL do Supabase

export const createAdminUserSQL = `
-- Verificar se a tabela profiles existe, se não, criar
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar campo role à tabela profiles se ainda não existir
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Criar um índice para consultas mais rápidas por role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Criar um trigger para inserir automaticamente um perfil quando um novo usuário é criado
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se o trigger já existe antes de criar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'create_profile_for_user_trigger'
  ) THEN
    CREATE TRIGGER create_profile_for_user_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_profile_for_user();
  END IF;
END
$$;

-- Atualizar o usuário específico para administrador
UPDATE profiles 
SET role = 'admin' 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'contato@dinoraw.com.br'
);

-- Se o usuário ainda não existe, você precisará criá-lo manualmente através da interface do Supabase
-- ou usando a API de autenticação do Supabase
`
