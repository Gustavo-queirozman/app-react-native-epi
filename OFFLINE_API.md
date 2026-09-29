# Integração com o backend Laravel

Configure a URL base completa, incluindo `/api`:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.43:8000/api
```

Os caminhos em `src/api/endpoints.ts` são relativos a essa base. Não acrescente outro `/api` às rotas. Reinicie o Expo depois de alterar `.env`. No celular, use o IPv4 do servidor na mesma rede; `localhost` aponta para o celular.

**Compatibilidade do backend local:** o código encontrado em `../backend-gestao-epi/bootstrap/app.php` ainda declara `apiPrefix: ''`, enquanto `routes/assinaturas.php` acrescenta seu próprio `api`. A configuração solicitada acima pressupõe que o servidor exponha todas as rotas de negócio sob `/api`, uma única vez. Para esse backend local, é necessário alinhar as rotas no servidor (prefixo global e remoção do prefixo interno de assinaturas) ou o proxy. O frontend não tenta caminhos alternativos para mascarar 404. O backend não foi alterado nesta tarefa.

## Cobertura das telas

| Tela | Operações |
| --- | --- |
| Login e cadastro | POST auth/login, auth/register |
| Recuperação | POST auth/forgot-password, auth/reset-password |
| Perfil | GET/PATCH perfil; PATCH perfil/senha (encerra sessão pois o servidor revoga os tokens) |
| Funções | GET/POST funcoes; PATCH/DELETE funcoes/{id}; associação e edição de periodicidades pesquisam `GET epis?nr_registro_ca={CA}` (não carrega todos os EPIs) |
| Trabalhadores | GET/POST trabalhadores; PATCH/DELETE trabalhadores/{id} |
| Fornecedores | GET/POST fornecedores; PATCH/DELETE fornecedores/{id} |
| Compras | GET notas-fiscais; POST notas-fiscais/importar com JSON `{ chave }`; GET notas-fiscais/{id} |
| Documentos | GET/POST documentos; GET documentos/{id}; GET/POST versões e signatários; DELETE signatário |
| Assinatura | POST sessão, consentimento, manuscrita e biométrica; GET verificação pública |
| Dispositivos | GET dispositivos; POST dispositivos/registrar; DELETE dispositivos/{id} |
| Downloads | POST url-temporaria; GET da URL assinada de baixar, com Bearer |

Os contratos foram consultados nos Requests, Resources e Controllers do backend local. As listas carregam todas as páginas Laravel, inclusive o envelope duplo de dispositivos. Mutações exibem erros de validação e só atualizam a tela após confirmação do servidor.

As rotas `/`, `/up`, `/sanctum/csrf-cookie` e `storage/{path}` são de infraestrutura. Não são ações de negócio: o app usa Bearer em vez de autenticação por cookie, e os arquivos privados são obtidos pelo download assinado. Estoque, entregas, ficha e alertas não possuem endpoints na lista fornecida; seus fluxos anteriores continuam locais, sem persistência no servidor.

## Assinaturas e segurança

Documentos e assinaturas exigem conexão. O PDF é selecionado com expo-document-picker; versões, signatários e consentimento são enviados separadamente. A assinatura manuscrita envia os traços no formato do backend. O consentimento apresenta o texto e a versão retornados pela sessão, exige aceite explícito e verifica a expiração antes do envio.

No Android/iOS, o cadastro gera uma chave ECDSA P-256 com aleatoriedade do expo-crypto. A chave privada é armazenada com `requireAuthentication` no expo-secure-store e separada por servidor/usuário. A assinatura só é produzida após a leitura autenticada da chave. A chave é carregada temporariamente em memória JavaScript para assinar com @noble/curves: não se trata de uma chave de assinatura não exportável de Secure Enclave/Keystore. A chave pública é SPKI PEM e a assinatura é DER em base64, compatíveis com openssl_verify/SHA-256 do backend.

A biometria exige aparelho físico e development build com permissões configuradas; não há fallback para assinatura falsa ou armazenamento da chave privada no navegador. Na web, use assinatura manuscrita. Alteração das biometrias cadastradas pode invalidar a chave; revogue o dispositivo e registre novamente. Os arquivos baixados no aplicativo são temporários e removidos após compartilhamento.

## Offline

Os novos fluxos usam `useRemoteList` e não gravam nem enfileiram dados privados. Sem conexão, mostram erro e permitem tentar novamente. A infraestrutura antiga de SQLite/fila permanece no projeto, mas não é usada por estas telas. Upload, importação fiscal, senha, consentimento e assinatura nunca são enfileirados automaticamente.

## Validação

Execute `npm run typecheck` e `npm test`. Os testes usam respostas HTTP simuladas para autenticação, URLs, paginação e erros, e verificam assinaturas com o OpenSSL do Node. Para testar ponta a ponta, alinhe o prefixo no servidor e use uma conta de teste, documento PDF e aparelho físico com biometria.
