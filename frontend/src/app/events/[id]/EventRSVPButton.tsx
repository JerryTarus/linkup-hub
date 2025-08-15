
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreditCard, Check, Clock } from 'lucide-react'
import { toast } from 'sonner'
import axios, { isAxiosError } from 'axios'

interface Event {
  id: string
  title: string
  is_paid: boolean
  price: number
  max_attendees?: number
}

interface User {
  id: string
  email: string
}

interface EventRSVPButtonProps {
  event: Event
  user: User | null
  hasRSVPd: boolean
}

export default function EventRSVPButton({ event, user, hasRSVPd }: EventRSVPButtonProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const handleRSVP = async () => {
    if (!user) {
      toast.error('Please login to RSVP')
      router.push('/auth/login')
      return
    }

    if (event.is_paid) {
      setShowPaymentModal(true)
      return
    }

    // Handle free event RSVP
    try {
      setIsProcessing(true)
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/events/${event.id}/rsvp`,
        {},
        { withCredentials: true }
      )
      
      toast.success('Successfully RSVP\'d to event!')
      router.refresh()
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to RSVP')
      } else {
        toast.error('An unexpected error occurred')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePayment = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number')
      return
    }

    // Validate Kenyan phone number format
    const phoneRegex = /^(?:254|\+254|0)?([17]\d{8})$/
    if (!phoneRegex.test(phoneNumber)) {
      toast.error('Please enter a valid Kenyan phone number')
      return
    }

    try {
      setIsProcessing(true)
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/initiate`,
        {
          event_id: event.id,
          phone_number: phoneNumber,
          amount: event.price
        },
        { withCredentials: true }
      )

      toast.success('Payment request sent to your phone. Please complete the payment.')
      setShowPaymentModal(false)
      
      // You might want to poll for payment status or redirect to a status page
      // For now, we'll just refresh the page after a delay
      setTimeout(() => {
        router.refresh()
      }, 3000)
      
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Payment initiation failed')
      } else {
        toast.error('An unexpected error occurred')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  if (hasRSVPd) {
    return (
      <Button disabled className="w-full md:w-auto bg-green-600 hover:bg-green-600">
        <Check className="h-4 w-4 mr-2" />
        Attending
      </Button>
    )
  }

  const isPastEvent = new Date(event.event_date) < new Date()
  if (isPastEvent) {
    return (
      <Button disabled className="w-full md:w-auto">
        Event Ended
      </Button>
    )
  }

  return (
    <>
      <Button 
        onClick={handleRSVP}
        disabled={isProcessing}
        className="w-full md:w-auto bg-brand-accent hover:bg-brand-accent/90"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Clock className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : event.is_paid ? (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Buy Ticket - KES {event.price}
          </>
        ) : (
          'RSVP for Free'
        )}
      </Button>

      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Purchase</DialogTitle>
            <DialogDescription>
              Enter your M-PESA number to buy a ticket for {event.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">M-PESA Phone Number</Label>
              <Input
                id="phone"
                placeholder="254712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                type="tel"
              />
              <p className="text-sm text-gray-500">
                Enter your phone number in format: 254712345678
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount:</span>
                <span className="text-lg font-bold text-brand-accent">
                  KES {event.price}
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="flex-1 bg-brand-accent hover:bg-brand-accent/90"
              >
                {isProcessing ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Pay with M-PESA'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
