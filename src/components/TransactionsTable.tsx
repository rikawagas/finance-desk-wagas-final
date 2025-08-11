
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Transaction } from '../types'
import { format } from 'date-fns'

function EditModal({ tx, onClose, onSaved }:{ tx: Transaction, onClose:()=>void, onSaved:(t:Transaction)=>void }){
  const [form, setForm] = useState({...tx})
  const save = async () => {
    const { data, error } = await supabase.from('transactions').update({
      date: form.date,
      store: form.store,
      amount: form.amount,
      currency: form.currency,
      factory_price: form.factory_price,
      notes: form.notes
    }).eq('id', tx.id).select('*').single()
    if(error){ alert(error.message); return }
    onSaved(data as Transaction)
  }
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="title" style={{fontSize:18, marginBottom:12}}>Edit Transaction</div>
        <div className="row-3">
          <div>
            <label>Date</label>
            <input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})}/>
          </div>
          <div>
            <label>Store</label>
            <select value={form.store} onChange={e=>setForm({...form, store:e.target.value as any})}>
              {['Shopee','Lazada','TikTok Shop','Etsy','Shopify Local','Shopify International'].map(s=> <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label>Currency</label>
            <select value={form.currency} onChange={e=>setForm({...form, currency:e.target.value as any})}>
              <option>PHP</option><option>USD</option>
            </select>
          </div>
        </div>
        <div className="row">
          <div>
            <label>Sale Amount</label>
            <input value={form.amount} onChange={e=>setForm({...form, amount:Number(e.target.value)})}/>
          </div>
          <div>
            <label>Factory Price</label>
            <input value={form.factory_price} onChange={e=>setForm({...form, factory_price:Number(e.target.value)})}/>
          </div>
        </div>
        <div>
          <label>Notes</label>
          <textarea value={form.notes ?? ''} onChange={e=>setForm({...form, notes:e.target.value})}/>
        </div>
        <div className="toolbar" style={{marginTop:12}}>
          <button onClick={save} className="good">Save changes</button>
          <button onClick={onClose} className="ghost">Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default function TransactionsTable(){
  const [rows, setRows] = useState<Transaction[]>([])
  const [q, setQ] = useState('')
  const [editTx, setEditTx] = useState<Transaction | null>(null)

  const fetchRows = async () => {
    const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false }).order('created_at', { ascending: false })
    if(error){ alert(error.message); return }
    setRows(data as Transaction[])
  }

  useEffect(() => { fetchRows() }, [])

  const filtered = useMemo(() => {
    if(!q) return rows
    const s = q.toLowerCase()
    return rows.filter(r =>
      r.store.toLowerCase().includes(s) ||
      r.currency.toLowerCase().includes(s) ||
      (r.notes||'').toLowerCase().includes(s)
    )
  }, [q, rows])

  const remove = async (id: string) => {
    if(!confirm('Delete this transaction?')) return
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if(error){ alert(error.message); return }
    setRows(rs => rs.filter(r => r.id !== id))
  }

  const updateRow = (t: Transaction) => {
    setRows(rs => rs.map(r => r.id === t.id ? t : r))
    setEditTx(null)
  }

  return (
    <div className="card">
      <div className="flex" style={{marginBottom:12}}>
        <div className="title" style={{fontSize:18}}>Transactions</div>
        <div className="right toolbar">
          <input placeholder="Search store/notes…" value={q} onChange={e=>setQ(e.target.value)} />
        </div>
      </div>
      <div style={{overflowX:'auto'}}>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th><th>Store</th><th>Sale</th><th>Factory</th><th>Currency</th><th>Notes</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                <td>{r.date ? format(new Date(r.date), 'yyyy-MM-dd') : ''}</td>
                <td>{r.store}</td>
                <td>{r.amount.toLocaleString()}</td>
                <td>{r.factory_price.toLocaleString()}</td>
                <td>{r.currency}</td>
                <td style={{maxWidth:260, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}} title={r.notes || ''}>{r.notes}</td>
                <td className="toolbar">
                  <button className="ghost" onClick={()=>setEditTx(r)}>Edit</button>
                  <button className="bad" onClick={()=>remove(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editTx && <EditModal tx={editTx} onClose={()=>setEditTx(null)} onSaved={updateRow}/>}
    </div>
  )
}
