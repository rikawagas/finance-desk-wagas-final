
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Row = { amount:number, currency:'PHP'|'USD', store:string, factory_price:number }
type Totals = { php:number, usd:number, supplier_php:number, supplier_usd:number, byStore: Record<string, { php:number, usd:number }> }

export default function StatsBoard({ rate }:{ rate:number }){
  const [rows, setRows] = useState<Row[]>([])
  const [month, setMonth] = useState<string>(new Date().toISOString().slice(0,7)) // YYYY-MM

  useEffect(() => {
    (async () => {
      const start = `${month}-01`
      const end = new Date(new Date(start).getFullYear(), new Date(start).getMonth()+1, 0).toISOString().slice(0,10)
      const { data, error } = await supabase
        .from('transactions')
        .select('amount,currency,store,factory_price,date')
        .gte('date', start).lte('date', end)
      if(error){ alert(error.message); return }
      setRows((data||[]) as Row[])
    })()
  }, [month])

  const totals = useMemo<Totals>(() => {
    let php=0, usd=0, supplier_php=0, supplier_usd=0
    const byStore: Totals['byStore'] = {}

    const add = (obj: Record<string,{php:number,usd:number}>, store:string, amtPHP:number, amtUSD:number) => {
      obj[store] = obj[store] || { php:0, usd:0 }
      obj[store].php += amtPHP
      obj[store].usd += amtUSD
    }

    rows.forEach(r => {
      if(r.currency==='PHP'){
        php += r.amount
        usd += r.amount / rate
        supplier_php += r.factory_price
        supplier_usd += r.factory_price / rate
        add(byStore, r.store, r.amount, r.amount/rate)
      } else {
        usd += r.amount
        php += r.amount * rate
        supplier_usd += r.factory_price
        supplier_php += r.factory_price * rate
        add(byStore, r.store, r.amount*rate, r.amount)
      }
    })
    return { php, usd, supplier_php, supplier_usd, byStore }
  }, [rows, rate])

  return (
    <div className="card" style={{display:'flex', flexDirection:'column', gap:12}}>
      <div className="flex">
        <div>
          <div className="title" style={{fontSize:18}}>This Month Overview</div>
          <div className="small">Filtered by month</div>
        </div>
        <div className="right">
          <input type="month" value={month} onChange={e=>setMonth(e.target.value)} />
        </div>
      </div>
      <div className="flex">
        <div className="kpi"><span className="v">₱ {totals.php.toLocaleString()}</span><span className="k">Sales (PHP)</span></div>
        <div className="kpi"><span className="v">$ {totals.usd.toLocaleString(undefined,{maximumFractionDigits:2})}</span><span className="k">Sales (USD)</span></div>
        <div className="kpi"><span className="v">₱ {totals.supplier_php.toLocaleString()}</span><span className="k">Supplier Owed (PHP)</span></div>
        <div className="kpi"><span className="v">$ {totals.supplier_usd.toLocaleString(undefined,{maximumFractionDigits:2})}</span><span className="k">Supplier Owed (USD)</span></div>
      </div>
      <div className="title" style={{fontSize:16, marginTop:8}}>Per-Store Breakdown</div>
      <div className="flex">
        {Object.entries(totals.byStore).map(([store, t]) => (
          <div key={store} className="badge">{store}: ₱ {t.php.toLocaleString()} • $ {t.usd.toLocaleString(undefined,{maximumFractionDigits:2})}</div>
        ))}
        {!Object.keys(totals.byStore).length && <div className="small">No data for selected month.</div>}
      </div>
    </div>
  )
}
