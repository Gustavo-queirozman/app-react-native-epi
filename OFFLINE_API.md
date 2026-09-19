# Integração API e modo offline

Defina a URL do backend antes de executar o aplicativo:

```env
EXPO_PUBLIC_API_URL=https://api.exemplo.com
```

As telas não devem chamar `fetch` diretamente. Use `apiFetch` para chamadas pontuais e `useApiCollection` para listas CRUD. Os caminhos oficiais estão em `src/api/endpoints.ts`.

## Contrato base esperado

| Recurso | Lista/novo | Item |
| --- | --- | --- |
| EPIs | `GET`, `POST /epis` | `PUT`, `PATCH`, `DELETE /epis/:id` |
| Funções | `GET`, `POST /funcoes` | `PUT`, `PATCH`, `DELETE /funcoes/:id` |
| Trabalhadores | `GET`, `POST /trabalhadores` | `PUT`, `PATCH`, `DELETE /trabalhadores/:id` |
| Fornecedores | `GET`, `POST /fornecedores` | `PUT`, `PATCH`, `DELETE /fornecedores/:id` |
| Estoque | `GET`, `POST /estoque/movimentacoes` | — |
| Entregas | `GET`, `POST /entregas` | — |
| Compras | `GET /compras` | `POST /compras/importar-xml` (multipart `xml`) |
| Painel e alertas | `GET /dashboard`, `GET /alertas` | — |

Listas podem ser retornadas diretamente, em `data`, ou em `items`. As respostas autenticadas recebem automaticamente `Authorization: Bearer <token>`.

## Comportamento offline

`expo-sqlite` mantém o cache de coleções e a fila de mutações no dispositivo. Leitura sem conexão usa o último cache. `POST`, `PUT`, `PATCH` e `DELETE` que falham por ausência de rede entram na fila e são transmitidos em ordem assim que o `NetInfo` detectar conexão. O token nunca fica no banco: é armazenado no `expo-secure-store`.

Importações de XML não entram na fila porque o arquivo selecionado pode não existir mais quando a sincronização ocorrer; a tela pede conexão para essa operação.
