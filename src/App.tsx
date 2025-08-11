
import { useEffect, useState } from 'react'
import GoalCard from './components/GoalCard'
import TransactionForm from './components/TransactionForm'
import TransactionsTable from './components/TransactionsTable'
import StatsBoard from './components/StatsBoard'
import { supabase } from './lib/supabaseClient'

export default function App(){
  const [rate, setRate] = useState<number>(56)

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('settings').select('usd_to_php').eq('id',1).single()
      if(data?.usd_to_php) setRate(data.usd_to_php)
    })()
  }, [])

  return (
    <div className="container">
      <div className="header">
        <div>
          <div className="title">Finance Desk – Wagas Ukuleles</div>
          <div className="subtitle">Track sales, supplier payables, goals, and store performance with clean spacing on a white canvas.</div>
        </div>
      </div>

      <div className="grid">
        <div style={{display:'flex', flexDirection:'column', gap:16}}>
          <TransactionForm onAdded={()=>{ /* table auto-refresh is inside it */ }} />
          <GoalCard />
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:16}}>
          <StatsBoard rate={rate} />
          <TransactionsTable />
        </div>
      </div>
    </div>
  )
}
