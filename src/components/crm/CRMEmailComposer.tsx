"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { sendAdminEmailAction } from "@/app/admin/actions"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Send, FileText, Bold, Italic, Underline, Link2, List } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function CRMEmailComposer({ selectedIds, onSent }: { selectedIds: Set<string>, onSent: () => void }) {
  const [manualEmails, setManualEmails] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const quickTemplates = {
    welcome: { sub: "Welcome to JointJourney!", body: "<p>Hi there,</p><br/><p>Welcome to JointJourney. We are thrilled to have you!</p>" },
    warning: { sub: "Account Notice", body: "<p>Hello,</p><br/><p>Please note that your account requires immediate attention.</p>" },
    followUp: { sub: "Following Up", body: "<p>Hi,</p><br/><p>Just checking in to see if you needed any help!</p>" }
  }

  const applyTemplate = (key: keyof typeof quickTemplates) => {
    setSubject(quickTemplates[key].sub)
    setMessage(quickTemplates[key].body)
    toast.success("Template applied")
  }

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertTag = (tag: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = message.substring(start, end)
    const isSelfClosing = tag === 'br' || tag === 'hr'

    let newText = ''
    let newCursorPos = 0

    if (isSelfClosing) {
      const insertion = `<${tag}/>`
      newText = message.substring(0, start) + insertion + message.substring(end)
      newCursorPos = start + insertion.length
    } else {
      const openingTag = `<${tag}>`
      const closingTag = `</${tag.split(' ')[0]}>`
      newText = message.substring(0, start) + openingTag + selectedText + closingTag + message.substring(end)
      // If there was selected text, put cursor after the closing tag. Otherwise, put it inside the tags.
      newCursorPos = selectedText.length > 0 
        ? start + openingTag.length + selectedText.length + closingTag.length
        : start + openingTag.length
    }

    setMessage(newText)
    
    // Ensure the textarea retains focus and the cursor moves to the right spot after state updates
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const customEmailList = manualEmails
      .split(',')
      .map(e => e.trim())
      .filter(e => e.length > 0 && e.includes('@'))

    if (selectedIds.size === 0 && customEmailList.length === 0) {
      setFeedback({ type: 'error', text: "Please select users or enter an email address." })
      return
    }
    if (!subject || !message || message.trim() === '') {
      setFeedback({ type: 'error', text: "Subject and message are required." })
      return
    }

    setSending(true)
    
    try {
      const formattedMessage = message.replace(/\n/g, '<br/>')
      const res = await sendAdminEmailAction(Array.from(selectedIds), subject, formattedMessage, customEmailList)
      toast.success(`Successfully sent email to ${res.count} recipients!`)
      setSubject("")
      setMessage("")
      setManualEmails("")
      onSent()
    } catch (err: any) {
      toast.error(err.message || "Failed to send email.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-3xl border border-white/60 dark:border-gray-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-3xl overflow-hidden flex-shrink-0">
      <CardHeader className="border-b border-white/40 dark:border-gray-700/50 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              Broadcast Email
            </CardTitle>
            <CardDescription className="dark:text-gray-400 mt-1">
              {selectedIds.size === 0 && !manualEmails.trim()
                ? "Select users or enter emails below." 
                : `Ready to email recipients.`}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-white/50 shadow-sm hover:bg-gray-100/80 hover:text-gray-900 h-9 rounded-xl px-4 dark:bg-gray-800/50 dark:text-gray-200 dark:border-gray-700/50 dark:hover:bg-gray-700">
              <FileText className="h-4 w-4" /> Templates
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl dark:border-gray-800">
              <DropdownMenuItem className="cursor-pointer dark:focus:bg-gray-800" onClick={() => applyTemplate('welcome')}>Welcome Email</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer dark:focus:bg-gray-800" onClick={() => applyTemplate('warning')}>Account Warning</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer dark:focus:bg-gray-800" onClick={() => applyTemplate('followUp')}>Follow-up</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <form onSubmit={handleSendEmail} className="p-6 space-y-6">
        <div className="space-y-2">
          <Label className="text-gray-700 dark:text-gray-300 font-semibold ml-1">From</Label>
          <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-800 rounded-xl h-12 flex items-center px-4 text-gray-500 dark:text-gray-400 cursor-not-allowed">
            JointJourney &lt;contact@jointjourney.app&gt;
          </div>
        </div>

        <div className="space-y-2 relative">
          <Label htmlFor="to" className="text-gray-700 dark:text-gray-300 font-semibold ml-1">To</Label>
          <Input 
            id="to" 
            placeholder="Additional email addresses (comma separated)" 
            value={manualEmails}
            onChange={e => setManualEmails(e.target.value)}
            className="bg-white/80 dark:bg-gray-900/80 border-gray-200/80 dark:border-gray-800 rounded-xl h-12 shadow-sm focus-visible:ring-blue-500/50 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          {selectedIds.size > 0 && (
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 ml-1 mt-1.5 absolute -bottom-5">
              + {selectedIds.size} user{selectedIds.size !== 1 ? 's' : ''} selected from directory
            </p>
          )}
        </div>

        <div className="space-y-2 pt-2">
          <Label htmlFor="subject" className="text-gray-700 dark:text-gray-300 font-semibold ml-1">Subject Line</Label>
          <Input 
            id="subject" 
            placeholder="e.g. Welcome to JointJourney Beta" 
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="bg-white/80 dark:bg-gray-900/80 border-gray-200/80 dark:border-gray-800 rounded-xl h-12 shadow-sm focus-visible:ring-blue-500/50 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="message" className="text-gray-700 dark:text-gray-300 font-semibold ml-1">Message Body</Label>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/80 dark:border-gray-800 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500/50 transition-all duration-200">
            {/* Faux Editor Toolbar */}
            <div className="flex items-center gap-1 border-b border-gray-100 dark:border-gray-800 p-2 bg-gray-50/50 dark:bg-gray-800/30">
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors" onClick={() => insertTag('b')} title="Bold"><Bold className="h-4 w-4" /></Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors" onClick={() => insertTag('i')} title="Italic"><Italic className="h-4 w-4" /></Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors" onClick={() => insertTag('u')} title="Underline"><Underline className="h-4 w-4" /></Button>
              <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors" onClick={() => insertTag('a href=""')} title="Link"><Link2 className="h-4 w-4" /></Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors" onClick={() => insertTag('ul')} title="List"><List className="h-4 w-4" /></Button>
            </div>
            
            <textarea
              id="message"
              ref={textareaRef}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full h-[240px] p-4 bg-transparent border-none focus:outline-none resize-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 leading-relaxed"
              placeholder="Write your message here. You can use the formatting toolbar or type simple HTML..."
            />
          </div>
          {feedback && (
            <p className={`text-sm mt-2 px-1 ${feedback.type === 'error' ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {feedback.text}
            </p>
          )}
        </div>

        <Button 
          type="submit" 
          className="h-12 w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg shadow-blue-600/20 dark:shadow-blue-900/40 transition-all duration-300 font-semibold group overflow-hidden relative"
          disabled={sending || (selectedIds.size === 0 && manualEmails.trim() === '')}
        >
          {sending ? (
            <div className="flex items-center justify-center relative z-10">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Sending Broadcast...
            </div>
          ) : (
            <div className="flex items-center justify-center relative z-10">
              <Send className="mr-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              Send Email
            </div>
          )}
        </Button>
      </form>
    </div>
  )
}
