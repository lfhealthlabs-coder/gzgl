import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: verificar se as variáveis estão carregadas
console.log('🔧 [supabase.ts] Verificando variáveis de ambiente...');
console.log('🔧 [supabase.ts] VITE_SUPABASE_URL:', supabaseUrl ? '✅ Definida' : '❌ Não definida');
console.log('🔧 [supabase.ts] VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Definida' : '❌ Não definida');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ [supabase.ts] ERRO: Variáveis de ambiente não encontradas!');
  console.error('❌ [supabase.ts] Verifique se o arquivo .env existe na raiz do projeto');
  console.error('❌ [supabase.ts] E se contém: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
  throw new Error('Faltam as variáveis de ambiente do Supabase. Verifique o arquivo .env');
}

console.log('✅ [supabase.ts] Cliente Supabase criado com sucesso!');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

