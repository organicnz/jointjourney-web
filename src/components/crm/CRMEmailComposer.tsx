"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { sendAdminEmailAction } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Send } from "lucide-react"

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })

export function CRMEmailComposer({ selectedIds, onSent }: { selectedIds: Set<string>, onSent: () => void }) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedIds.size === 0) {
      setFeedback({ type: 'error', text: "Please select at least one user." })
      return
    }
    if (!subject || !message || message === '<p><br></p>') {
      setFeedback({ type: 'error', text: "Subject and message are required." })
      return
    }

    setSending(true)
    setFeedback(null)
    
    try {
      const res = await sendAdminEmailAction(Array.from(selectedIds), subject, message)
      setFeedback({ type: 'success', text: `Successfully sent email to ${res.count} users!` })
      setSubject("")
      setMessage("")
      onSent()
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || "Failed to send email." })
    } finally {
      setSending(false)
    }
  }

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  }

  return (
    <div className="bg-white/70 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-xl shadow-blue-900/5 overflow-hidden h-fit sticky top-24">
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 via-white/50 to-transparent">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 rounded-lg"><Mail className="w-5 h-5 text-blue-600" /></div>
          Broadcast
        </h3>
        <p className="text-sm text-gray-500 mt-2 font-medium">
          Sending to <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{selectedIds.size}</span> selected users.
        </p>
      </div>
      
      <form onSubmit={handleSendEmail} className="p-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="subject" className="text-gray-700 font-semibold ml-1">Subject Line</Label>
          <Input 
            id="subject" 
            placeholder="e.g. Welcome to JointJourney Beta" 
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="bg-white/80 border-gray-200/80 rounded-xl h-12 shadow-sm focus-visible:ring-blue-500/30"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="message" className="text-gray-700 font-semibold ml-1">Message Body</Label>
          <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500/30 transition-shadow">
            <ReactQuill 
              theme="snow"
              value={message} 
              onChange={setMessage} 
              modules={quillModules}
              className="h-[280px] border-none"
            />
          </div>
        </div>

        {feedback && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl text-sm font-medium border shadow-sm ${feedback.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}
          >
            {feedback.text}
          </motion.div>
        )}

        <Button 
          type="submit" 
          className="h-12 w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all font-semibold group"
          disabled={sending || selectedIds.size === 0}
        >
          {sending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Sending Broadcast...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              Send Email
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
