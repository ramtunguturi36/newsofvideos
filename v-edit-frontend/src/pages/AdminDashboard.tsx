import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getAdminStats } from '@/lib/backend'
import type { User, AdminStats } from '@/lib/backend'

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAdminStats()
      setStats(data)
    } catch (err: any) {
      console.error('Error fetching admin stats:', err)
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="mb-4">Loading dashboard...</div>
          <Button variant="outline" onClick={fetchStats}>Retry</Button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="mb-4 text-red-400">Error: {error}</div>
          <Button onClick={fetchStats}>Retry</Button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div>No data available</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white/80 mb-2">Total Users</h3>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white/80 mb-2">Total Sales</h3>
              <p className="text-3xl font-bold">₹{stats.totalSales.toFixed(2)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white/80 mb-2">Total Purchases</h3>
              <p className="text-3xl font-bold">{stats.totalPurchases}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Users List */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Registered Users</h2>
              <span className="text-white/60">{stats.users.length} users</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Registration Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.users.map((user: User) => (
                    <tr key={user._id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4">{user.name}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {stats.users.length === 0 && (
              <div className="text-center py-8 text-white/60">
                No users registered yet
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Navigation to Explorer */}
        <div className="flex justify-center gap-3">
          <Button 
            onClick={() => window.location.hash = '/admin/explorer'}
            className="w-full md:w-auto"
          >
            Go to Content Management
          </Button>
        </div>
      </div>
    </div>
  )
}