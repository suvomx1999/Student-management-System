import { useEffect, useState } from 'react'
import { getStudentFees, payFee, createPaymentIntent, type Fee } from './api'
import Layout from './components/Layout'
import { CreditCard, CheckCircle2, Clock, Receipt, AlertCircle } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

// Replace with your actual publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx')

function CheckoutForm({ fee, onSuccess, onCancel }: { fee: Fee, onSuccess: () => void, onCancel: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)
    setError(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message || 'An error occurred')
      setProcessing(false)
      return
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href, // Not used for redirect-less flow if we handle it right, but required
      },
      redirect: 'if_required',
    })

    if (confirmError) {
      setError(confirmError.message || 'Payment failed')
      setProcessing(false)
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        await payFee(fee.id)
        onSuccess()
      } catch (e) {
        setError('Payment succeeded but failed to update record. Please contact support.')
      } finally {
        setProcessing(false)
      }
    } else {
       setError('Unexpected payment status')
       setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="bg-indigo-50 p-4 rounded-xl flex justify-between items-center">
        <div>
          <p className="text-sm text-indigo-600 font-medium">Total Amount</p>
          <p className="text-2xl font-bold text-indigo-900">₹{fee.amount.toLocaleString()}</p>
        </div>
        <Receipt className="w-8 h-8 text-indigo-300" />
      </div>

      <PaymentElement />

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {processing ? 'Processing...' : `Pay ₹${fee.amount.toLocaleString()}`}
        </button>
      </div>
      
      <p className="text-xs text-center text-slate-400 flex items-center justify-center gap-1">
        <CheckCircle2 className="w-3 h-3" />
        Payments are secure and encrypted via Stripe
      </p>
    </form>
  )
}

function StudentFees() {
  const [fees, setFees] = useState<Fee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPayModal, setShowPayModal] = useState(false)
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [initializingPayment, setInitializingPayment] = useState(false)

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    loadFees()
  }, [])

  async function loadFees() {
    if (!user.id) return
    setLoading(true)
    try {
      const data = await getStudentFees(user.id)
      setFees(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function initiatePayment(fee: Fee) {
    setSelectedFee(fee)
    setInitializingPayment(true)
    try {
      const { clientSecret } = await createPaymentIntent(fee.amount, fee.id)
      setClientSecret(clientSecret)
      setShowPayModal(true)
    } catch (e) {
      alert('Failed to initialize payment: ' + (e as Error).message)
    } finally {
      setInitializingPayment(false)
    }
  }

  const handlePaymentSuccess = () => {
    setShowPayModal(false)
    setClientSecret(null)
    setSelectedFee(null)
    loadFees()
    alert('Payment Successful! Receipt generated.')
  }

  return (
    <Layout title="My Fees & Payments">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Due</p>
                <h3 className="text-2xl font-bold text-slate-900">
                  ₹{fees.filter(f => f.status === 'PENDING').reduce((acc, f) => acc + f.amount, 0).toLocaleString()}
                </h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Paid Amount</p>
                <h3 className="text-2xl font-bold text-slate-900">
                   ₹{fees.filter(f => f.status === 'PAID').reduce((acc, f) => acc + f.amount, 0).toLocaleString()}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Fees List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Fee Invoices</h2>
          </div>
          
          {loading ? (
             <div className="p-8 text-center text-slate-500">Loading fees...</div>
          ) : fees.length === 0 ? (
             <div className="p-8 text-center text-slate-500">No fee records found.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {fees.map((fee) => (
                <div key={fee.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${fee.status === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                      {fee.status === 'PAID' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{fee.description}</h4>
                      <p className="text-sm text-slate-500">Due: {fee.dueDate || 'N/A'}</p>
                      {fee.status === 'PAID' && (
                        <p className="text-xs text-green-600 mt-1">Paid on {fee.paymentDate} • Txn: {fee.transactionId}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-900">₹{fee.amount.toLocaleString()}</div>
                    {fee.status === 'PENDING' ? (
                      <button
                        onClick={() => initiatePayment(fee)}
                        disabled={initializingPayment && selectedFee?.id === fee.id}
                        className="mt-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                      >
                        <CreditCard className="w-4 h-4" />
                        {initializingPayment && selectedFee?.id === fee.id ? 'Loading...' : 'Pay Now'}
                      </button>
                    ) : (
                      <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Paid
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPayModal && selectedFee && clientSecret && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900">Secure Payment</h3>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm 
                fee={selectedFee} 
                onSuccess={handlePaymentSuccess} 
                onCancel={() => setShowPayModal(false)}
              />
            </Elements>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default StudentFees
