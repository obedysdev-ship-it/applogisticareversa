# 🔧 Configurar Edge Function do Supabase

A Edge Function `sync-registro-google-sheets` precisa das seguintes variáveis de ambiente configuradas no Supabase.

## Variáveis Necessárias

### 1. GOOGLE_SERVICE_ACCOUNT_EMAIL
```
applogisticareversa@applogisticareversa.iam.gserviceaccount.com
```

### 2. GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
Copie a chave privada completa do arquivo `applogisticareversa-5ce108573ed3.json`:
```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC/+u+phX9a8iw4
z+9YUuqbce40raqEhR4qPMluTPLAH4WOsucMJNikVBnGzMcJZyR/YAHUzYCFkB5X
wVqSpS36HV7/LxrWg1/JsHl6RqRAsufTzk1t7pNFyC9lLiLpGsB2t6jFtRtAu55S
xOuUBCePaP9YQu/0eNKkmxv++oH350kROSA/T/JkVLMq3zs3DWBJp+u0DU9C/k4H
4RLPnS/9etpjI//loAwz0eeBkJp1xvdCBxQMrj59JFnOlJ2pKsom5vy25IpgpYBC
LUzhCXoB/q+HZqg9CJjJGtoaLPhZQhlCacIY4yZYJcCmbmS5lFM2WLJlRsyv/1yO
XE5tTT6fAgMBAAECggEAJFymGiiz54jpAVW5ErSZxRl+MbIXEwSXow5iZKbkb6lI
xa9y/aTY978KJtJQfKJxkkKf9it6RVH3vU1dF1t76ty3SoQkhC7b7LqlN5i7sZlx
OXfgyIqgkF4LRBHKAPbVL2c360KTR96BbVHpAN8Mkygi/ReolVhxJUZPtirChS6Q
cVd3ZpHhjzwZEVyglN+ytfTgt5tyuAhsdLTWeG6tyUvZOjda0pXjo3SPYltQq7F/
McoIYPifw37ZODOY8nJyUlFPoB/Ns91nyRkYzj21Gldn8MSg5das/w4J5qt9ZOJn
/ebg7Zc/Gf572D82btmqFDlr6t+kh5wAhzft1Ah9QQKBgQDjfNQinLAKQYBRyNJM
QW773mrDqsVjRCcuMGmTy/HDNJUFxE85L+VdYu8pQlpKUteP1k6ZewWQdVp7VSlw
ayCWUwaNDh3jj7jIA3VLOm4eDMCLM+oRfrM1BYElzsB1vkD1KQN7sWsC4+p/ic6T
BSPjHCZr4hFrSBQ5PQmRbXybfwKBgQDYCtEVhD2HotjUL01iFyBO+kBBs9rWVLF0
qeH4ym+sjaIc1714hvtKs8Lcyschhu9tSudk1OmGkzt4KO3DDQJz6OuYPMhDio4Q
m0JPVSyvqvzM+1m98G/aZW6/EO1tNg5s1QO39+RwZT8nz/Hdv2ivVh4596MxSTg/
HRhPklFs4QKBgQDAhr/efy95ro/UJ5rbkLFGFqnS6W9eoKpsK+ree8cjhxfsJoVK
B+AdVgLEr3RM3Km1ARHKUVSXOsqWALAuhWux7Zhovp7LHbKsDEkznsLdSbuW1Bvw
LIOshvkTL1SxEZBWLBzXjYLcklm/ELk0si/6ILPfsBc/7WO4QZEcdEX2LwKBgAca
m/N0LL3ICg84GvhNwF84dWJzso93q3oll+uhZHitE5aVNYLAFYVIUfEGrfOZR0g1
vVQgeClXsA3scp0GUX1UPGL+JKur464CHPUU3OpN2hA3d6T6QgNRcInR2azMqT7E
5mFnQli7y47YlKBxCdUyJL5NOU2GldXldAYxzoGhAoGBAI5HSd9SH8Tx6+D2vKjg
naJylFur9KIaP+utnaGoJYttzWOjzHAhAPJbOvbADXvuEufOWSYHybmmu840VAG0
Fh93Tn9cZXvxKSnael39KfedvMw3LE9WlrKynlbZclwJ3JMTHDYGZu+q2p58PFkP
PX55W7BBqQWpOe6XygsfjCL5
-----END PRIVATE KEY-----
```

### 3. GOOGLE_SPREADSHEET_ID
Você precisa fornecer o ID da sua planilha do Google Sheets.

Para obter o ID:
1. Abra sua planilha do Google Sheets
2. Olhe a URL: `https://docs.google.com/spreadsheets/d/SEU_ID_AQUI/edit`
3. Copie o `SEU_ID_AQUI`

## Como Configurar no Supabase

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Vá em: **Edge Functions** > **sync-registro-google-sheets**
4. Clique em: **Settings** > **Secrets**
5. Adicione cada uma das 3 variáveis acima
6. Salve as alterações

## Importante: Compartilhar Planilha

Não esqueça de compartilhar sua planilha do Google Sheets com o email:
```
applogisticareversa@applogisticareversa.iam.gserviceaccount.com
```

Dê permissão de **EDITOR** para essa conta.

## Estrutura da Planilha

A planilha deve ter uma aba chamada **"Registros"** com as seguintes colunas na primeira linha:

| id | data | cliente | promotor | fretista | rede | uf | vendedor | qtd_caixas | total | status_revisado | created_at | updated_at |

