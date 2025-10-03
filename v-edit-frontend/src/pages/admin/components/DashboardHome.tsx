import { ArrowUp, ArrowDown, Users, FileVideo, DollarSign, ShoppingCart, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { 
    name: 'Total Revenue', 
    value: '₹45,231.89', 
    change: '+20.1% from last month', 
    icon: DollarSign,
    trend: 'up',
    color: 'text-green-600 bg-green-100',
    link: '/admin/dashboard/earnings'
  },
  { 
    name: 'Active Users', 
    value: '2,453', 
    change: '+12.5% from last month', 
    icon: Users,
    trend: 'up',
    color: 'text-blue-600 bg-blue-100',
    link: '/admin/dashboard/users'
  },
  { 
    name: 'Templates', 
    value: '1,234', 
    change: '+8.2% from last month', 
    icon: FileVideo,
    trend: 'up',
    color: 'text-purple-600 bg-purple-100',
    link: '/admin/dashboard/templates'
  },
  { 
    name: 'New Orders', 
    value: '156', 
    change: '+5.7% from last month', 
    icon: ShoppingCart,
    trend: 'up',
    color: 'text-amber-600 bg-amber-100',
    link: '/admin/dashboard/orders'
  },
];

const recentActivity = [
  {
    id: 1,
    user: 'Alex Johnson',
    action: 'purchased',
    target: 'Wedding Template Pack',
    amount: '₹149.99',
    time: '2 minutes ago',
    avatar: 'AJ',
    type: 'purchase'
  },
  {
    id: 2,
    user: 'Sarah Williams',
    action: 'uploaded a new template',
    target: 'Travel Vlog Pack',
    time: '1 hour ago',
    avatar: 'SW',
    type: 'upload'
  },
  {
    id: 3,
    user: 'Michael Chen',
    action: 'subscribed to',
    target: 'Premium Plan',
    amount: '₹29.99/month',
    time: '3 hours ago',
    avatar: 'MC',
    type: 'subscription'
  },
  {
    id: 4,
    user: 'Emma Davis',
    action: 'left a 5-star review on',
    target: 'Minimal Intro Pack',
    time: '5 hours ago',
    avatar: 'ED',
    type: 'review'
  },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'purchase':
      return <ShoppingCart className="h-4 w-4 text-green-500" />;
    case 'upload':
      return <FileVideo className="h-4 w-4 text-blue-500" />;
    case 'subscription':
      return <DollarSign className="h-4 w-4 text-purple-500" />;
    case 'review':
      return <Activity className="h-4 w-4 text-amber-500" />;
    default:
      return null;
  }
};

const DashboardHome = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">Welcome back, Admin! 👋</h2>
              <p className="mt-1 text-indigo-100 max-w-2xl">
                Here's what's happening with your store today. You have 12 new orders and 5 new template uploads.
              </p>
              <div className="mt-4 flex space-x-3">
                <Link
                  to="/admin/dashboard/orders"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View Orders
                </Link>
                <Link
                  to="/admin/dashboard/templates"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-700 bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Manage Templates
                </Link>
              </div>
            </div>
            <div className="hidden md:block mt-6 md:mt-0 md:ml-8">
              <div className="h-32 w-32 rounded-full bg-white bg-opacity-10 flex items-center justify-center">
                <svg className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, statIdx) => (
          <Link
            key={statIdx}
            to={stat.link}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color} bg-opacity-20`}>
                  <stat.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className={`inline-flex items-center ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend === 'up' ? (
                    <ArrowUp className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDown className="h-4 w-4 mr-1" />
                  )}
                  {stat.change}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
          <p className="mt-1 text-sm text-gray-500">A summary of recent activities in your store.</p>
        </div>
        <div className="bg-white shadow overflow-hidden sm:rounded-b-lg">
          <ul className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <li key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-medium">{activity.avatar}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.user}{' '}
                        <span className="text-gray-500 font-normal">
                          {activity.action}{' '}
                          <span className="text-indigo-600">{activity.target}</span>
                        </span>
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                    <div className="mt-1 flex justify-between">
                      <p className="text-sm text-gray-500">{activity.time}</p>
                      {activity.amount && (
                        <p className="text-sm font-medium text-gray-900">{activity.amount}</p>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">1</span> to <span className="font-medium">4</span> of{' '}
              <span className="font-medium">24</span> results
            </div>
            <div className="flex-1 flex justify-end">
              <Link
                to="/admin/dashboard/activity"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                View all activity
                <span aria-hidden="true"> &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
