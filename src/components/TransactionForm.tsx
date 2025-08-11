
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Currency, Store, Transaction } from '../types'

const stores: Store[] = ['Shopee','Lazada','TikTok Shop','Etsy','Shopify Local','Shopify International']

export default function TransactionForm({ onAdded }:{ onAdded: (t: Transaction)=>void }){
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10))
  const [store, setStore] = useState<Store>('Shopee')
  const [amount, setAmount] = useState<string>('')
  const [currency, setCurrency] = useState<Currency>('PHP')
  const [factory, setFactory] = useState<string>('')
  const [notes, setNotes] = useState<string>('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      date,
      store,
      amount: Number(amount || 0),
      currency,
      factory_price: Number(factory || 0),
      notes: notes || null
    }
    const { data, error } = await supabase.from('transactions').insert(payload).select('*').single()
    if(error){ alert(error.message); return }
    onAdded(data as Transaction)
    setAmount(''); setFactory(''); setNotes('')
  }

  return (
    <form className="card" onSubmit={submit} style={{display:'flex', flexDirection:'column', gap:12}}>
      <div>
        <div className="title" style={{fontSize:18}}>Add Transaction</div>
        <div className="small">Include factory price to track supplier payables.</div>
      </div>
      <div className="row-3">
        <div>
          <label>Date</label>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} required/>
        </div>
        <div>
          <label>Store</label>
          <select value={store} onChange={e=>setStore(e.target.value as Store)}>
            {stores.map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label>Currency</label>
          <select value={currency} onChange={e=>setCurrency(e.target.value as Currency)}>
            <option>PHP</option><option>USD</option>
          </select>
        </div>
      </div>
      <div className="row">
        <div>
          <label>Sale Amount</label>
          <input inputMode="decimal" placeholder="e.g. 2490" value={amount} onChange={e=>setAmount(e.target.value)} required/>
        </div>
        <div>
          <label>Factory Price (Supplier)</label>
          <input inputMode="decimal" placeholder="e.g. 1200" value={factory} onChange={e=>setFactory(e.target.value)} required/>
        </div>
      </div>
      <div>
        <label>Notes</label>
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional details…"/>
      </div>
      <div className="toolbar">
        <button type="submit">Add</button>
        <button type="button" className="ghost" onClick={()=>{ setAmount(''); setFactory(''); setNotes('') }}>Clear</button>
      </div>
    </form>
  )
}
