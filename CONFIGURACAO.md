# Guia de Configuração - Supabase e Google Sheets

## 1. Configuração do Supabase

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### Como obter essas informações:
1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** > **API**
4. Copie a **URL** e a **anon/public key**

## 2. Configuração da Edge Function no Supabase

A Edge Function `sync-registro-google-sheets` precisa das seguintes variáveis de ambiente configuradas no Supabase:

### Variáveis necessárias:
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: O email da conta de serviço (do arquivo JSON)
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`: A chave privada (do arquivo JSON)
- `GOOGLE_SPREADSHEET_ID`: O ID da planilha do Google Sheets

### Como configurar:

1. **Obter o email da conta de serviço:**
   - Do arquivo `applogisticareversa-5ce108573ed3.json`, copie o valor de `client_email`
   - Exemplo: `applogisticareversa@applogisticareversa.iam.gserviceaccount.com`

2. **Obter a chave privada:**
   - Do arquivo `applogisticareversa-5ce108573ed3.json`, copie o valor de `private_key`
   - É a chave completa entre `-----BEGIN PRIVATE KEY-----` e `-----END PRIVATE KEY-----`

3. **Obter o ID da planilha:**
   - Abra sua planilha do Google Sheets
   - O ID está na URL: `https://docs.google.com/spreadsheets/d/SEU_ID_AQUI/edit`
   - Copie o `SEU_ID_AQUI`

4. **Configurar no Supabase:**
   - Acesse o Dashboard do Supabase
   - Vá em **Edge Functions** > **sync-registro-google-sheets**
   - Clique em **Settings** > **Secrets**
   - Adicione as três variáveis:
     - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
     - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
     - `GOOGLE_SPREADSHEET_ID`

5. **Compartilhar a planilha com a conta de serviço:**
   - Abra sua planilha do Google Sheets
   - Clique em **Compartilhar**
   - Adicione o email da conta de serviço (o `client_email` do JSON)
   - Dê permissão de **Editor**

## 3. Estrutura da Tabela no Supabase

Certifique-se de que a tabela `registros` existe no Supabase com os seguintes campos:

- `id` (uuid, primary key)
- `data` (date)
- `cliente` (text)
- `promotor` (text)
- `fretista` (text)
- `rede` (text)
- `uf` (text)
- `vendedor` (text)
- `qtd_caixas` (numeric)
- `total` (numeric)
- `status_revisado` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## 4. Estrutura da Planilha no Google Sheets

A planilha deve ter uma aba chamada **"Registros"** com as seguintes colunas na primeira linha:

| id | data | cliente | promotor | fretista | rede | uf | vendedor | qtd_caixas | total | status_revisado | created_at | updated_at |

## 5. Testando a Conexão

Após configurar tudo:

1. Reinicie o servidor de desenvolvimento: `npm run dev`
2. Tente criar um novo registro no aplicativo
3. Verifique se o registro aparece no Supabase
4. Verifique se o registro foi exportado para o Google Sheets

## Troubleshooting

### Erro: "supabase is null"
- Verifique se o arquivo `.env.local` existe e tem as variáveis corretas
- Reinicie o servidor após criar/modificar o `.env.local`

### Erro: "missing_google_env" na Edge Function
- Verifique se todas as variáveis de ambiente estão configuradas no Supabase
- Certifique-se de que os nomes das variáveis estão corretos

### Erro: "sheets_append_failed"
- Verifique se a planilha foi compartilhada com a conta de serviço
- Verifique se o ID da planilha está correto
- Verifique se a aba "Registros" existe na planilha

