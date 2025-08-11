
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Settings } from '../types'

export default function GoalCard(){
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)

  const [fields, setFields] = useState({ monthly_goal_amount: '', monthly_goal_currency: 'PHP', usd_to_php: '' })

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('settings').select('*').eq('id', 1).single()
      if(data){
        setSettings(data as Settings)
        setFields({
          monthly_goal_amount: String(data.monthly_goal_amount ?? ''),
          monthly_goal_currency: data.monthly_goal_currency ?? 'PHP',
          usd_to_php: String(data.usd_to_php ?? '56')
        })
      }
      setLoading(false)
    })()
  }, [])

  const [totals, setTotals] = useState({ php: 0, usd: 0 })

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('transactions')
        .select('amount,currency,date')
        .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0,10))
      let php = 0, usd = 0
      const rate = settings?.usd_to_php ?? Number(fields.usd_to_php || 56)
      ;(data||[]).forEach(r => {
        if(r.currency === 'PHP'){
          php += r.amount
          usd += r.amount / rate
        } else {
          usd += r.amount
          php += r.amount * rate
        }
      })
      setTotals({ php, usd })
    })()
  }, [settings, fields.usd_to_php])

  const goalInPHP = useMemo(() => {
    if(!settings) return 0
    const rate = settings.usd_to_php || 56
    return settings.monthly_goal_currency === 'PHP'
      ? settings.monthly_goal_amount
      : settings.monthly_goal_amount * rate
  }, [settings])

  const progress = useMemo(() => {
    if(!settings) return 0
    const achieved = settings.monthly_goal_currency === 'PHP' ? totals.php : totals.usd
    const pct = Math.min(100, (achieved / (settings.monthly_goal_amount || 1)) * 100)
    return isFinite(pct) ? pct : 0
  }, [settings, totals])

  const save = async () => {
    const payload = {
      id: 1,
      monthly_goal_amount: Number(fields.monthly_goal_amount || 0),
      monthly_goal_currency: fields.monthly_goal_currency as 'PHP'|'USD',
      usd_to_php: Number(fields.usd_to_php || 56)
    }
    const { error } = await supabase.from('settings').upsert(payload, { onConflict: 'id' })
    if(error){ alert(error.message); return }
    const { data } = await supabase.from('settings').select('*').eq('id',1).single()
    setSettings(data as Settings)
  }

  if(loading) return <div className="card">Loading goal…</div>

  return (
    <div className="card" style={{display:'flex', flexDirection:'column', gap:12}}>
      <div className="flex">
        <div>
          <div className="title" style={{fontSize:18}}>Monthly Goal</div>
          <div className="small">Tracks sales recorded this month.</div>
        </div>
      </div>
      <div className="kpi">
        <span className="v">
          {settings?.monthly_goal_currency} {settings?.monthly_goal_currency === 'PHP'
            ? totals.php.toLocaleString()
            : totals.usd.toLocaleString(undefined,{maximumFractionDigits:2})}
        </span>
        <span className="k">Achieved this month</span>
      </div>
      <div className="progress"><span style={{width:`${progress}%`}}/></div>
      <div className="small">Goal: {settings?.monthly_goal_currency} {settings?.monthly_goal_amount?.toLocaleString()}</div>

      <div className="row">
        <div>
          <label>Goal Amount</label>
          <input value={fields.monthly_goal_amount} onChange={e=>setFields({...fields, monthly_goal_amount:e.target.value})} placeholder="e.g. 300000"/>
        </div>
        <div>
          <label>Goal Currency</label>
          <select value={fields.monthly_goal_currency} onChange={e=>setFields({...fields, monthly_goal_currency:e.target.value})}>
            <option>PHP</option><option>USD</option>
          </select>
        </div>
      </div>
      <div className="row">
        <div>
          <label>USD→PHP Conversion Rate</label>
          <input value={fields.usd_to_php} onChange={e=>setFields({...fields, usd_to_php:e.target.value})} placeholder="e.g. 57.00"/>
        </div>
        <div className="kpi">
          <span className="v">Totals</span>
          <span className="k">PHP {totals.php.toLocaleString()} • USD {totals.usd.toLocaleString(undefined,{maximumFractionDigits:2})}</span>
        </div>
      </div>
      <div className="toolbar">
        <button onClick={save}>Save Goal & Rate</button>
      </div>
      <div className="small">Goal in PHP reference: ₱ {goalInPHP.toLocaleString(undefined,{maximumFractionDigits:2})}</div>
    </div>
  )
}
