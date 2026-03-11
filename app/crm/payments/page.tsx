"use client";

import { useEffect, useState } from "react";
import CRMShellLayout from "@/components/crm/crm-shell";
import { CreditCard, Plus, Edit, Trash2, X, Loader2, TrendingUp, Calendar } from "lucide-react";

export default function PaymentsPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<any>(null);
    const [formData, setFormData] = useState({
        amount: "", date: new Date().toISOString().split("T")[0],
        status: "COMPLETED", method: "Cash", remarks: "", studentId: "",
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [payRes, userRes] = await Promise.all([fetch("/api/payments"), fetch("/api/admin/users")]);
            if (payRes.ok) setPayments(await payRes.json());
            if (userRes.ok) {
                const users = await userRes.json();
                setStudents(users.filter((u: any) => u.role === "STUDENT"));
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingPayment ? "PUT" : "POST";
        const payload = editingPayment ? { ...formData, id: editingPayment.id } : formData;
        try {
            const res = await fetch("/api/payments", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if (res.ok) { setIsModalOpen(false); fetchData(); }
            else { const err = await res.json(); alert(err.error || "Failed"); }
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this payment?")) return;
        try { const res = await fetch(`/api/payments?id=${id}`, { method: "DELETE" }); if (res.ok) fetchData(); } catch (e) { console.error(e); }
    };

    const totalCollected = payments.filter(p => p.status === "COMPLETED").reduce((s, p) => s + (p.amount || 0), 0);
    const pendingAmount = payments.filter(p => p.status === "PENDING").reduce((s, p) => s + (p.amount || 0), 0);

    return (
        <CRMShellLayout>
            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl p-5 border border-gray-100">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Collected</span>
                            <div className="p-2 bg-emerald-50 rounded-lg"><TrendingUp className="text-emerald-600" size={16} /></div>
                        </div>
                        <div className="text-2xl font-black text-gray-900">₹{totalCollected.toLocaleString()}</div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending</span>
                            <div className="p-2 bg-yellow-50 rounded-lg"><CreditCard className="text-yellow-600" size={16} /></div>
                        </div>
                        <div className="text-2xl font-black text-gray-900">₹{pendingAmount.toLocaleString()}</div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center justify-center">
                        <button onClick={() => { setEditingPayment(null); setFormData({ amount: "", date: new Date().toISOString().split("T")[0], status: "COMPLETED", method: "Cash", remarks: "", studentId: "" }); setIsModalOpen(true); }}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all">
                            <Plus size={18} /> Record Payment
                        </button>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2"><CreditCard size={16} className="text-emerald-500" /> Transaction History</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[700px]">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Student</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Method</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Status</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {payments.map(p => (
                                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-semibold text-gray-900 text-sm">{p.student?.name}</div>
                                                <div className="text-[10px] text-gray-500">{p.student?.email}</div>
                                            </td>
                                            <td className="p-4 font-bold text-gray-900">₹{p.amount?.toLocaleString()}</td>
                                            <td className="p-4 text-sm text-gray-600 flex items-center gap-1"><Calendar size={14} className="text-gray-400" />{new Date(p.date).toLocaleDateString()}</td>
                                            <td className="p-4"><span className="px-2.5 py-1 bg-gray-100 rounded-lg text-[10px] font-bold uppercase text-gray-600">{p.method}</span></td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${p.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" : p.status === "PENDING" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}`}>{p.status}</span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button onClick={() => { setEditingPayment(p); setFormData({ amount: p.amount.toString(), date: new Date(p.date).toISOString().split("T")[0], status: p.status, method: p.method, remarks: p.remarks || "", studentId: p.studentId }); setIsModalOpen(true); }} className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"><Edit size={16} /></button>
                                                    <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {payments.length === 0 && <tr><td colSpan={6} className="p-20 text-center text-gray-400 text-sm">No transactions recorded yet.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">{editingPayment ? "Edit Payment" : "Record Payment"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            {!editingPayment && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Student</label>
                                    <select value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value })} required className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-white">
                                        <option value="">Select student...</option>
                                        {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
                                    </select>
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Amount (₹)</label>
                                    <input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required className="w-full p-2.5 border border-gray-200 rounded-xl text-sm outline-none" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Date</label>
                                    <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required className="w-full p-2.5 border border-gray-200 rounded-xl text-sm outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Method</label>
                                    <select value={formData.method} onChange={e => setFormData({ ...formData, method: e.target.value })} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-white">
                                        {["Cash", "UPI", "Bank Transfer", "Card", "Cheque"].map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Status</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-white">
                                        {["COMPLETED", "PENDING", "FAILED", "REFUNDED"].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Remarks</label>
                                <textarea value={formData.remarks} onChange={e => setFormData({ ...formData, remarks: e.target.value })} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm outline-none h-20 resize-none" placeholder="Optional notes..." />
                            </div>
                            <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all mt-2">
                                {editingPayment ? "Update Payment" : "Record Payment"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </CRMShellLayout>
    );
}
