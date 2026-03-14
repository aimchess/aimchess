'use client'

import { useEffect, useState } from 'react'
import CRMShellLayout from "@/components/crm/crm-shell"
import { Trophy, Medal, User, Loader2, Search } from 'lucide-react'
import { motion } from 'framer-motion'

interface Student {
  id: string
  name: string
  photoUrl: string | null
  stage: string
  solvedCount: number
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/leaderboard', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setLeaderboard(data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [])

  const filteredLeaderboard = leaderboard.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <CRMShellLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        </div>
      </CRMShellLayout>
    )
  }

  return (
    <CRMShellLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-[#0b1d3a] via-[#1a3a6a] to-[#0b1d3a] rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-yellow-400/20 rounded-lg">
                    <Trophy className="text-yellow-400" size={24} />
                 </div>
                 <span className="text-yellow-400 font-bold tracking-widest text-xs uppercase">Hall of Fame</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">Chess Grandmasters <br/><span className="text-sky-400">Leaderboard</span></h1>
              <p className="text-sky-200/80 text-sm max-w-md">Recognizing our top chess players based on puzzles solved. Keep training, keep winning!</p>
            </div>
            <div className="flex flex-col items-center justify-center bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <span className="text-sky-300 text-xs font-bold uppercase mb-1">Total Players</span>
                <span className="text-4xl font-black">{leaderboard.length}</span>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-sky-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-20%] left-[-5%] w-48 h-48 bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search by student name..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 bg-sky-50 text-sky-600 rounded-lg text-xs font-bold border border-sky-100">
                    All Levels
                </div>
            </div>
        </div>

        {/* Leaderboard Grid/List */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[550px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Rank</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Student</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Stage</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Puzzles Solved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLeaderboard.map((student, index) => {
                   const isTop3 = index < 3;
                   const medalColor = index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-orange-500';
                   
                   return (
                    <motion.tr 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={student.id} 
                        className="hover:bg-sky-50/30 transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                           <span className={`text-base font-black ${isTop3 ? 'text-gray-900' : 'text-gray-400'}`}>
                               #{index + 1}
                           </span>
                           {isTop3 && (
                             <div className={`p-1 rounded-lg bg-opacity-10 ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'}`}>
                                 <Medal className={medalColor} size={16} />
                             </div>
                           )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm group-hover:shadow-md transition-shadow">
                            {student.photoUrl ? (
                              <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="text-gray-400" size={20} />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 leading-tight">{student.name}</p>
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mt-0.5 hidden sm:block">Player ID: #{student.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                          student.stage === 'ADVANCED' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                          student.stage === 'INTERMEDIATE' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          'bg-green-50 text-green-600 border-green-100'
                        }`}>
                          {student.stage}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex flex-col items-end">
                            <span className="text-xl font-black text-gray-900">{student.solvedCount}</span>
                            <span className="text-[10px] font-bold text-sky-500 uppercase">Points Earned</span>
                        </div>
                      </td>
                    </motion.tr>
                   )
                })}
              </tbody>
            </table>
          </div>
          {filteredLeaderboard.length === 0 && (
            <div className="py-20 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                    <Search className="text-gray-300" size={32} />
                </div>
                <h3 className="text-gray-900 font-bold">No students found</h3>
                <p className="text-gray-500 text-sm">Try searching with a different name</p>
            </div>
          )}
        </div>
      </div>
    </CRMShellLayout>
  )
}


