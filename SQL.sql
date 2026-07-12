-- ============================================
-- TABELA DE SALAS
-- ============================================
CREATE TABLE IF NOT EXISTS public.salas (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    criador TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA DE PRODUTOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.produtos (
    id TEXT PRIMARY KEY,
    sala_id TEXT REFERENCES public.salas(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cat TEXT DEFAULT 'Geral',
    price NUMERIC DEFAULT 0,
    pix TEXT,
    img TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA DE MENSAGENS (CHAT)
-- ============================================
CREATE TABLE IF NOT EXISTS public.mensagens (
    id BIGSERIAL PRIMARY KEY,
    sala_id TEXT REFERENCES public.salas(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    remetente TEXT DEFAULT 'cliente',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_produtos_sala ON public.produtos(sala_id);
CREATE INDEX IF NOT EXISTS idx_produtos_cat ON public.produtos(cat);
CREATE INDEX IF NOT EXISTS idx_mensagens_sala ON public.mensagens(sala_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_created ON public.mensagens(created_at DESC);

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE public.salas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público
CREATE POLICY "Acesso público às salas" ON public.salas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público aos produtos" ON public.produtos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público às mensagens" ON public.mensagens FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- TRIGGER PARA updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_salas_updated_at BEFORE UPDATE ON public.salas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON public.produtos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SALA DE EXEMPLO
-- ============================================
INSERT INTO public.salas (id, nome, criador) 
VALUES ('loja1', 'Loja Exemplo', 'admin') 
ON CONFLICT (id) DO NOTHING;

-- Produto de exemplo
INSERT INTO public.produtos (id, sala_id, name, cat, price, pix)
VALUES ('prod1', 'loja1', 'Produto Exemplo', 'Categoria', 10.00, 'chave-pix-exemplo@email.com')
ON CONFLICT (id) DO NOTHING;
