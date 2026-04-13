'use client';

import React from 'react';
import { 
  BarChart3, 
  Users, 
  MousePointer2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminDashboard() {
  const stats = [
    { name: 'Total Visitors', value: '45,231', change: '+12.5%', trend: 'up', icon: Users },
    { name: 'Avg. Session', value: '4m 32s', change: '+2.1%', trend: 'up', icon: Clock },
    { name: 'Tool Usage', value: '12,842', change: '-3.4%', trend: 'down', icon: MousePointer2 },
    { name: 'Conversion Rate', value: '3.2%', change: '+0.8%', trend: 'up', icon: BarChart3 },
  ];

  const recentActivity = [
    { id: 1, user: 'Anonymous', action: 'Used JSON Formatter', time: '2 mins ago', status: 'Success' },
    { id: 2, user: 'User #482', action: 'Subscribed to Newsletter', time: '15 mins ago', status: 'Success' },
    { id: 3, user: 'Anonymous', action: 'Used Image Compressor', time: '45 mins ago', status: 'Success' },
    { id: 4, user: 'User #921', action: 'Contact Form Submission', time: '1 hour ago', status: 'Pending' },
    { id: 5, user: 'Anonymous', action: 'Used SQL Formatter', time: '2 hours ago', status: 'Success' },
  ];

  return (
    <div className="container-custom py-8 md:py-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 dark:text-white">Welcome back, Admin. Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:bg-gray-900">
            <Filter size={16} />
            Filters
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            <Plus size={16} />
            New Post
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.name}
            whileHover={{ y: -2 }}
            className="rounded-2xl border border-gray-100 bg-white dark:bg-gray-800 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                <stat.icon size={20} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
                {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 dark:text-white">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white">Recent Activity</h2>
            <button className="text-indigo-600 text-sm font-medium hover:underline">View all</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-white uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentActivity.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50 dark:bg-gray-900 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{activity.user}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-white">{activity.action}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-white">{activity.time}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        activity.status === 'Success' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-600 dark:text-white">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats / Chart Placeholder */}
        <div className="rounded-2xl border border-gray-100 bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 dark:text-white mb-6">Traffic Sources</h2>
          <div className="space-y-6">
            {[
              { source: 'Direct', percentage: 45, color: 'bg-indigo-600' },
              { source: 'Organic Search', percentage: 32, color: 'bg-blue-500' },
              { source: 'Social Media', percentage: 15, color: 'bg-pink-500' },
              { source: 'Referral', percentage: 8, color: 'bg-amber-500' },
            ].map((item) => (
              <div key={item.source}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-white">{item.source}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{item.percentage}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-white">Total Page Views</span>
              <span className="font-bold text-gray-900 dark:text-white">124,842</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
