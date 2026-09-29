const unavailable = async (): Promise<never> => { throw new Error('A assinatura biométrica está disponível no aplicativo Android/iOS. No navegador, use a assinatura manuscrita.'); };
export const deviceSigning = { available: () => false, register: unavailable, sign: async (_payload: string) => unavailable(), remove: async (_id: string) => {} };
