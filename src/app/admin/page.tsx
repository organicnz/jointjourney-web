"use client"

import { useEffect, useState } from "react"
import { getUsersAction, sendAdminEmailAction } from "./actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Send } from "lucide-react"

type UserData = { id: string, email?: string, created_at: string, last_sign_in_at?: string }

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserData[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    getUsersAction()
      .then(data => {
        setUsers(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setFeedback({ type: 'error', text: "Failed to load users" })
        setLoading(false)
      })
  }, [])

  const toggleAll = () => {
    if (selectedIds.size === users.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(users.map(u => u.id)))
    }
  }

  const toggleUser = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedIds.size === 0) {
      setFeedback({ type: 'error', text: "Please select at least one user." })
      return
    }
    if (!subject || !message) {
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
      setSelectedIds(new Set())
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || "Failed to send email." })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Users Table */}
      <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">User Directory</h3>
            <p className="text-sm text-gray-500 mt-1">Select users to send bulk or targeted emails.</p>
          </div>
          <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
            {users.length} Total
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 text-center">
                  <Checkbox 
                    checked={users.length > 0 && selectedIds.size === users.length}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Sign In</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center text-gray-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center text-gray-500">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map(user => (
                  <TableRow key={user.id} className="cursor-pointer" onClick={() => toggleUser(user.id)}>
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={selectedIds.has(user.id)}
                        onCheckedChange={() => toggleUser(user.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{user.email || 'No email'}</TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Email Composer */}
      <div className="bg-white/60 backdrop-blur-xl border rounded-2xl shadow-sm overflow-hidden h-fit sticky top-24">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-transparent">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Compose Email
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Sending to <span className="font-bold text-gray-900">{selectedIds.size}</span> selected users.
          </p>
        </div>
        
        <form onSubmit={handleSendEmail} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject Line</Label>
            <Input 
              id="subject" 
              placeholder="e.g. Welcome to JointJourney Beta" 
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="bg-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message Body</Label>
            <Textarea 
              id="message" 
              placeholder="Type your message here... (HTML tags will be escaped, line breaks are preserved)"
              className="min-h-[200px] bg-white resize-none"
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>

          {feedback && (
            <div className={`p-3 rounded-lg text-sm font-medium ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {feedback.text}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md shadow-blue-500/20"
            disabled={sending || selectedIds.size === 0}
          >
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Email
              </>
            )}
          </Button>
        </form>
      </div>

    </div>
  )
}
