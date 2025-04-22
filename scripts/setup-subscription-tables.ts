// Este arquivo contém o SQL para configurar as tabelas de assinatura
// Execute este script no editor SQL do Supabase

export const setupSubscriptionTablesSQL = `
-- Criar tabela de planos de assinatura
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  interval VARCHAR(20) NOT NULL,
  stripe_price_id VARCHAR(100),
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES subscription_plans(id),
  status VARCHAR(20) NOT NULL,
  stripe_subscription_id VARCHAR(100),
  stripe_customer_id VARCHAR(100),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir planos de assinatura padrão
INSERT INTO subscription_plans (name, description, price, interval, stripe_price_id, features)
VALUES 
  ('free', 'Plano gratuito com recursos básicos', 0.00, 'month', NULL, '{"features": ["Calculadora básica", "Ferramentas básicas de stream", "Suporte padrão"]}'),
  ('premium', 'Plano premium com todos os recursos', 9.99, 'month', '${process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID}', '{"features": ["Ferramentas avançadas de stream", "Ferramentas de criação", "Análises de stream", "Acesso à API", "Suporte prioritário"]}');

-- Criar índices para melhorar a performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
`
