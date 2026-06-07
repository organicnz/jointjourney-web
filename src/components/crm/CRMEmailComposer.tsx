"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { sendAdminEmailAction } from "@/app/admin/actions"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Send, FileText } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })

export function CRMEmailComposer({ selectedIds, onSent }: { selectedIds: Set<string>, onSent: () => void }) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const quickTemplates = {
    welcome: { sub: "Welcome to JointJourney!", body: "<p>Hi there,</p><p>Welcome to JointJourney. We are thrilled to have you!</p>" },
    warning: { sub: "Account Notice", body: "<p>Hello,</p><p>Please note that your account requires immediate attention.</p>" },
    followUp: { sub: "Following Up", body: "<p>Hi,</p><p>Just checking in to see if you needed any help!</p>" }
  }

  const applyTemplate = (key: keyof typeof quickTemplates) => {
    setSubject(quickTemplates[key].sub)
    setMessage(quickTemplates[key].body)
    toast.success("Template applied")
  }

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
    
    try {
      const res = await sendAdminEmailAction(Array.from(selectedIds), subject, message)
      toast.success(`Successfully sent email to ${res.count} users!`)
      setSubject("")
      setMessage("")
      onSent()
    } catch (err: any) {
      toast.error(err.message || "Failed to send email.")
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
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Broadcast Email
            </CardTitle>
            <CardDescription>
              {selectedIds.size === 0 
                ? "Select users from the table to send emails." 
                : `Ready to email ${selectedIds.size} users.`}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 rounded-xl px-3 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">
              <FileText className="h-4 w-4" /> Templates
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={() => applyTemplate('welcome')}>Welcome Email</DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyTemplate('warning')}>Account Warning</DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyTemplate('followUp')}>Follow-up</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
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
