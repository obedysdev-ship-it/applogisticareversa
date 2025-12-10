# ⚙️ Configuração do Ambiente

## Passo 1: Criar arquivo .env.local

Crie um arquivo chamado `.env.local` na raiz do projeto com o seguinte conteúdo:

```env
VITE_SUPABASE_URL=https://kcqhbfchvegfcbfvqqtv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjcWhiZmNodmVnZmNiZnZxcXR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMjA5NTcsImV4cCI6MjA4MDg5Njk1N30.KXSSm08XzSgOKNPWrhvqAgz7okuuWThuUqwI80K5WT4
```

## Passo 2: Reiniciar o servidor

Após criar o arquivo `.env.local`, reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

## Passo 3: Verificar no console do navegador

Abra o console do navegador (F12) e verifique se aparecem as mensagens:
- ✅ X clientes carregados
- ✅ X fretistas carregados  
- ✅ X promotores carregados

Se aparecer "⚠️ Supabase não está configurado", verifique se o arquivo `.env.local` foi criado corretamente.

