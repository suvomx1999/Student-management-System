import { useEffect, useState, useMemo } from 'react'
import Layout from './components/Layout'
import { getAllFees, type Fee } from './api'
import { Receipt, CheckCircle2, Clock, Search, Filter, AlertCircle } from 'lucide-react'

export default function AdminFees() {
  const [fees, setFees] = useState<Fee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL')

  useEffect(() => {
    loadFees()
  }, [])

  async function loadFees() {
    setLoading(true)
    try {
      const data = await getAllFees()
      setFees(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const filteredFees = useMemo(() => {
    return fees.filter(fee => {
      const matchesSearch = 
        fee.studentName?.toLowerCase().includes(search.toLowerCase()) ||
        fee.description.toLowerCase().includes(search.toLowerCase()) ||
        fee.transactionId?.toLowerCase().includes(search.toLowerCase())
      
      const matchesStatus = statusFilter === 'ALL' || fee.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [fees, search, statusFilter])

  const stats = useMemo(() => {
    const total = fees.reduce((acc, f) => acc + f.amount, 0)
    const collected = fees.filter(f => f.status === 'PAID').reduce((acc, f) => acc + f.amount, 0)
    const pending = fees.filter(f => f.status === 'PENDING').reduce((acc, f) => acc + f.amount, 0)
    return { total, collected, pending }
  }, [fees])

  return (
    <Layout title="Fee Management">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                <h3 className="text-2xl font-bold text-slate-900">₹{stats.total.toLocaleString()}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Collected</p>
                <h3 className="text-2xl font-bold text-slate-900">₹{stats.collected.toLocaleString()}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Pending</p>
                <h3 className="text-2xl font-bold text-slate-900">₹{stats.pending.toLocaleString()}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student, description, or transaction ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white"
            >
              <option value="ALL">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>

        {/* Fees List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-4 font-semibold text-slate-600">Student</th>
                  <th className="p-4 font-semibold text-slate-600">Description</th>
                  <th className="p-4 font-semibold text-slate-600">Amount</th>
                  <th className="p-4 font-semibold text-slate-600">Status</th>
                  <th className="p-4 font-semibold text-slate-600">Date</th>
                  <th className="p-4 font-semibold text-slate-600">Transaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">Loading fees...</td>
                  </tr>
                ) : filteredFees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">No fees found matching criteria.</td>
                  </tr>
                ) : (
                  filteredFees.map((fee) => (
                    <tr key={fee.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium text-slate-900">{fee.studentName || 'Unknown Student'}</td>
                      <td className="p-4 text-slate-600">{fee.description}</td>
                      <td className="p-4 font-bold text-slate-900">₹{fee.amount.toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          fee.status === 'PAID' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {fee.status === 'PAID' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {fee.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 text-sm">
                        {fee.status === 'PAID' ? fee.paymentDate : `Due: ${fee.dueDate}`}
                      </td>
                      <td className="p-4 text-slate-500 text-xs font-mono">
                        {fee.transactionId || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
