"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { updateProfileDetailsAction } from "./actions"
import { toast } from "sonner"
import { Mail, User, Shield, Briefcase, Calendar, Save } from "lucide-react"

interface ProfileFormProps {
  userId: string
  initialUsername: string
  role: string
  status: string
  specialSkills: string
  email: string
  joinedAt: string
}

export default function ProfileForm({
  userId, initialUsername, role, status, specialSkills, email, joinedAt
}: ProfileFormProps) {
  const [username, setUsername] = useState(initialUsername)
  const [loading, setLoading] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData()
    formData.append("username", username)
    
    const res = await updateProfileDetailsAction(userId, formData)
    
    setLoading(false)
    if (res.error) {
      toast.error("Failed to update profile", { description: res.error })
    } else {
      toast.success("Profile updated successfully!")
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Editable Fields */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-2 bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-800/50 p-8 rounded-3xl shadow-xl shadow-blue-900/5"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><User className="text-blue-500" /> Personal Information</h2>
        <form onSubmit={handleSave} className="space-y-6">
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-600 dark:text-gray-400">Email Address (Read-Only)</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input 
                id="email" 
                value={email} 
                disabled 
                className="pl-10 bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-500 cursor-not-allowed h-11" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-900 dark:text-gray-100 font-semibold">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input 
                id="username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Enter your username"
                className="pl-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus-visible:ring-blue-500 transition-all shadow-sm h-11" 
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full sm:w-auto h-11 px-8 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md hover:shadow-lg transition-all text-white flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </motion.div>

      {/* Read-Only Stats/Admin Fields */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-800/50 p-8 rounded-3xl shadow-xl shadow-blue-900/5 flex flex-col gap-6"
      >
        <h2 className="text-xl font-bold mb-2">Account Status</h2>
        
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-1">
            <Shield className={`h-5 w-5 ${role === 'admin' ? 'text-purple-500' : 'text-blue-500'}`} />
            <p className="font-semibold text-gray-900 dark:text-gray-100 capitalize">{role}</p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-8">System Role</p>
        </div>

        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-1">
            <div className={`h-3 w-3 rounded-full ${status === 'Active' ? 'bg-green-500' : status === 'Lead' ? 'bg-blue-500' : status === 'VIP' ? 'bg-yellow-500' : 'bg-gray-500'}`}></div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{status || 'Unknown'}</p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-6">Current Status</p>
        </div>

        {specialSkills && (
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="h-5 w-5 text-gray-500" />
              <p className="font-semibold text-gray-900 dark:text-gray-100">Assigned Skills</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {specialSkills.split(',').map(s => s.trim()).filter(s => s).map(skill => (
                <span key={skill} className="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 mt-auto">
          <div className="flex items-center gap-3 mb-1">
            <Calendar className="h-5 w-5 text-gray-400" />
            <p className="font-medium text-gray-900 dark:text-gray-100">Joined {new Date(joinedAt).toLocaleDateString()}</p>
          </div>
        </div>

      </motion.div>
    </div>
  )
}
