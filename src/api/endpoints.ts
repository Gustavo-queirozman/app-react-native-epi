/** All API paths are centralized here so screens never embed URLs or fetch calls. */
export const endpoints = {
  auth: { login: '/auth/login', register: '/auth/register', forgotPassword: '/auth/forgot-password', profile: '/perfil' },
  epis: '/epis',
  functions: '/funcoes',
  workers: '/trabalhadores',
  suppliers: '/fornecedores',
  purchases: '/compras',
  stock: '/estoque/movimentacoes',
  deliveries: '/entregas',
  alerts: '/alertas',
  dashboard: '/dashboard',
} as const;
