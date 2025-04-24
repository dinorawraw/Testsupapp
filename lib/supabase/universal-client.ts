import { createClient } from "@supabase/supabase-js"

// Cliente Supabase universal que não depende de cookies ou headers
export const createUniversalClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// Funções universais para cálculos
export async function universalSaveCalculation(userId: string, calculationData: any) {
  const supabase = createUniversalClient()

  const { data, error } = await supabase
    .from("calculations")
    .insert([
      {
        user_id: userId,
        ...calculationData,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Erro ao salvar cálculo:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function universalSaveCalculationToNewTable(
  userId: string,
  platform: string,
  name: string,
  data: Record<string, any>,
  result: number,
) {
  const supabase = createUniversalClient()

  const { data: savedData, error } = await supabase
    .from("saved_calculations")
    .insert([
      {
        user_id: userId,
        platform,
        name,
        data,
        result,
      },
    ])
    .select()

  if (error) {
    console.error("Erro ao salvar cálculo na nova tabela:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data: savedData }
}
