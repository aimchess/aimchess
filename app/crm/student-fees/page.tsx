'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import CRMShellLayout from "@/components/crm/crm-shell"
import { Wallet } from 'lucide-react'

export default function StudentFeesPage() {
  const { data: session } = useSession()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPayments = useCallback(async () => {
    if (!session?.user) return
    try {
      const res = await fetch('/api/payments')
      if (res.ok) setPayments(await res.json())
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }, [session])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  if (loading) return <CRMShellLayout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-sky-500"></div></div></CRMShellLayout>

  return (
    <CRMShellLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-4 md:p-8 border border-sky-100 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-green-50 rounded-2xl"><Wallet className="text-green-600" size={32} /></div>
            <div>
              <h2 className="text-2xl font-bold text-[#0b1d3a]">Fee Payment History</h2>
              <p className="text-slate-500 font-medium text-sm">View your transaction records and payment status.</p>
            </div>
          </div>
          <div className="overflow-x-auto border border-sky-100 rounded-2xl">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead className="bg-sky-50/50 border-b border-sky-100">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Method</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-50">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-sky-50/30 transition-colors">
                    <td className="p-4 text-sm font-bold text-slate-700">{new Date(p.date).toLocaleDateString()}</td>
                    <td className="p-4 font-bold text-[#0b1d3a]">₹{p.amount.toLocaleString()}</td>
                    <td className="p-4"><span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded uppercase">{p.method}</span></td>
                    <td className="p-4 text-right">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${p.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border-green-200' :
                          p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                            'bg-red-100 text-red-700 border-red-200'
                        }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan={4} className="p-16 text-center text-slate-400 italic font-medium">No payment records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CRMShellLayout>
  )
}
