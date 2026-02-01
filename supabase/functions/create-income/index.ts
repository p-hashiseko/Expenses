import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // JST 기준で今日の日付
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const today = now.getDate()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  /* ======================
     income_config → income
     ====================== */
  try {
    const { data: configs, error } = await supabase
      .from('income_config')
      .select('id, user_id, amount, income_config_day, memo')
      .eq('income_config_day', today)

    if (error) {
      console.error('income_config error', error)
    } else if (configs && configs.length > 0) {
      const inserts = configs.map((config) => ({
        user_id: config.user_id,
        amount: config.amount,
        income_day: config.income_config_day,
        memo: config.memo,
      }))

      const { error: insertError } = await supabase
        .from('income')
        .insert(inserts)

      if (insertError) {
        console.error('income insert error', insertError)
      }
    }
  } catch (e) {
    console.error('income unexpected error', e)
  }

  /* ==============================
     fixed_costs_config → expenses
     ============================== */
  try {
    const { data: fixedCosts, error } = await supabase
      .from('fixed_costs_config')
      .select('id, user_id, memo, category, amount, payment_date')
      .eq('payment_date', today)

    if (error) {
      console.error('fixed_costs_config error', error)
    } else if (fixedCosts && fixedCosts.length > 0) {
      const inserts = fixedCosts.map((fc) => {
        // 月末対応（30 / 31 / 2月）
        const lastDayOfMonth = new Date(year, month, 0).getDate()
        const actualDay = Math.min(fc.payment_date, lastDayOfMonth)

        const paymentDate = `${year}-${String(month).padStart(2, '0')}-${String(actualDay).padStart(2, '0')}`

        return {
          user_id: fc.user_id,
          payment_date: paymentDate,
          memo: fc.memo,
          category: fc.category,
          amount: fc.amount,
        }
      })

      const { error: insertError } = await supabase
        .from('expenses')
        .insert(inserts)

      if (insertError) {
        console.error('expenses insert error', insertError)
      }
    }
  } catch (e) {
    console.error('fixed_costs unexpected error', e)
  }

  return new Response('ok')
})
