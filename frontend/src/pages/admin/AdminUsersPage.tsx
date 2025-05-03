import React, { useState } from 'react';

// Interface cho người dùng
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'seller' | 'user';
  status: 'active' | 'inactive' | 'banned';
  joinDate: string;
  lastLogin: string;
  orders: number;
}

const AdminUsersPage: React.FC = () => {
  // Mock data cho danh sách người dùng
  const [users, setUsers] = useState<User[]>([
    {
      id: 'USR-001',
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      avatar: 'https://via.placeholder.com/40',
      role: 'admin',
      status: 'active',
      joinDate: '01/01/2023',
      lastLogin: '10/04/2023',
      orders: 12,
    },
    {
      id: 'USR-002',
      name: 'Trần Thị B',
      email: 'tranthib@example.com',
      avatar: 'https://via.placeholder.com/40',
      role: 'seller',
      status: 'active',
      joinDate: '05/02/2023',
      lastLogin: '09/04/2023',
      orders: 8,
    },
    {
      id: 'USR-003',
      name: 'Lê Văn C',
      email: 'levanc@example.com',
      avatar: 'https://via.placeholder.com/40',
      role: 'user',
      status: 'active',
      joinDate: '15/02/2023',
      lastLogin: '08/04/2023',
      orders: 5,
    },
    {
      id: 'USR-004',
      name: 'Phạm Thị D',
      email: 'phamthid@example.com',
      avatar: 'https://via.placeholder.com/40',
      role: 'user',
      status: 'inactive',
      joinDate: '20/02/2023',
      lastLogin: '01/03/2023',
      orders: 2,
    },
    {
      id: 'USR-005',
      name: 'Hoàng Văn E',
      email: 'hoangvane@example.com',
      avatar: 'https://via.placeholder.com/40',
      role: 'user',
      status: 'banned',
      joinDate: '01/03/2023',
      lastLogin: '15/03/2023',
      orders: 0,
    },
    {
      id: 'USR-006',
      name: 'Vũ Thị F',
      email: 'vuthif@example.com',
      avatar: 'https://via.placeholder.com/40',
      role: 'seller',
      status: 'active',
      joinDate: '10/03/2023',
      lastLogin: '10/04/2023',
      orders: 0,
    },
    {
      id: 'USR-007',
      name: 'Đặng Văn G',
      email: 'dangvang@example.com',
      avatar: 'https://via.placeholder.com/40',
      role: 'user',
      status: 'active',
      joinDate: '15/03/2023',
      lastLogin: '05/04/2023',
      orders: 3,
    },
    {
      id: 'USR-008',
      name: 'Ngô Thị H',
      email: 'ngothih@example.com',
      avatar: 'https://via.placeholder.com/40',
      role: 'user',
      status: 'active',
      joinDate: '20/03/2023',
      lastLogin: '07/04/2023',
      orders: 2,
    },
  ]);

  // State cho bộ lọc
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    dateRange: '',
    orderCount: '',
  });

  // State cho tìm kiếm nâng cao
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  // State cho việc chỉnh sửa người dùng
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Lọc người dùng
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(filters.search.toLowerCase()) || 
                         user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
                         user.id.toLowerCase().includes(filters.search.toLowerCase());
    const matchesRole = filters.role === '' || user.role === filters.role;
    const matchesStatus = filters.status === '' || user.status === filters.status;
    
    // Lọc theo số lượng đơn hàng
    let matchesOrderCount = true;
    if (filters.orderCount !== '') {
      if (filters.orderCount === 'none') {
        matchesOrderCount = user.orders === 0;
      } else if (filters.orderCount === 'low') {
        matchesOrderCount = user.orders >= 1 && user.orders <= 5;
      } else if (filters.orderCount === 'medium') {
        matchesOrderCount = user.orders >= 6 && user.orders <= 15;
      } else if (filters.orderCount === 'high') {
        matchesOrderCount = user.orders > 15;
      }
    }
    
    // Lọc theo khoảng thời gian tham gia
    let matchesDateRange = true;
    if (filters.dateRange !== '') {
      const userJoinDate = new Date(user.joinDate.split('/').reverse().join('-'));
      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(today.getMonth() - 1);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(today.getMonth() - 3);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(today.getMonth() - 6);
      
      if (filters.dateRange === 'last_month') {
        matchesDateRange = userJoinDate >= oneMonthAgo;
      } else if (filters.dateRange === 'last_3_months') {
        matchesDateRange = userJoinDate >= threeMonthsAgo;
      } else if (filters.dateRange === 'last_6_months') {
        matchesDateRange = userJoinDate >= sixMonthsAgo;
      }
    }
    
    return matchesSearch && matchesRole && matchesStatus && matchesOrderCount && matchesDateRange;
  });

  // Xuất dữ liệu người dùng ra CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Tên', 'Email', 'Vai trò', 'Trạng thái', 'Ngày tham gia', 'Đăng nhập gần đây', 'Số đơn hàng'];
    
    const csvData = [
      headers.join(','),
      ...filteredUsers.map(user => [
        user.id,
        `"${user.name}"`,
        user.email,
        user.role,
        user.status,
        user.joinDate,
        user.lastLogin,
        user.orders
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Xử lý mở modal chỉnh sửa người dùng
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Xử lý cập nhật vai trò người dùng
  const handleUpdateUserRole = (id: string, newRole: User['role']) => {
    setUsers(users.map(user => {
      if (user.id === id) {
        return { ...user, role: newRole };
      }
      return user;
    }));
  };

  // Xử lý cập nhật trạng thái người dùng
  const handleUpdateUserStatus = (id: string, newStatus: User['status']) => {
    setUsers(users.map(user => {
      if (user.id === id) {
        return { ...user, status: newStatus };
      }
      return user;
    }));
  };

  // Hiển thị vai trò người dùng
  const renderRole = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">Admin</span>;
      case 'seller':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Người bán</span>;
      case 'user':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Khách hàng</span>;
      default:
        return null;
    }
  };

  // Hiển thị trạng thái người dùng
  const renderStatus = (status: User['status']) => {
    switch (status) {
      case 'active':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Hoạt động</span>;
      case 'inactive':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Không hoạt động</span>;
      case 'banned':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Đã khóa</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Quản lý người dùng</h1>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Xuất CSV
          </button>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Thêm người dùng mới
          </button>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              name="search"
              id="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Tên, email hoặc ID người dùng"
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Vai trò
            </label>
            <select
              id="role"
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            >
              <option value="">Tất cả vai trò</option>
              <option value="admin">Admin</option>
              <option value="seller">Người bán</option>
              <option value="user">Khách hàng</option>
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="banned">Đã khóa</option>
            </select>
          </div>
        </div>

        <div className="mt-3">
          <button
            type="button"
            className="text-sm text-indigo-600 hover:text-indigo-900 font-medium flex items-center"
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
          >
            {showAdvancedSearch ? (
              <>
                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Ẩn tìm kiếm nâng cao
              </>
            ) : (
              <>
                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Hiện tìm kiếm nâng cao
              </>
            )}
          </button>
        </div>

        {showAdvancedSearch && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
                Thời gian tham gia
              </label>
              <select
                id="dateRange"
                name="dateRange"
                value={filters.dateRange}
                onChange={handleFilterChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="">Tất cả thời gian</option>
                <option value="last_month">Tháng vừa qua</option>
                <option value="last_3_months">3 tháng vừa qua</option>
                <option value="last_6_months">6 tháng vừa qua</option>
              </select>
            </div>
            <div>
              <label htmlFor="orderCount" className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng đơn hàng
              </label>
              <select
                id="orderCount"
                name="orderCount"
                value={filters.orderCount}
                onChange={handleFilterChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="">Tất cả</option>
                <option value="none">Chưa có đơn hàng</option>
                <option value="low">Ít (1-5)</option>
                <option value="medium">Trung bình (6-15)</option>
                <option value="high">Nhiều ({'>'}15)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Danh sách người dùng */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tham gia
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đơn hàng
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img 
                          className="h-10 w-10 rounded-full object-cover" 
                          src={user.avatar} 
                          alt={user.name} 
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderRole(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStatus(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.joinDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.orders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Chi tiết
                    </button>
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateUserRole(user.id, e.target.value as User['role'])}
                      className="text-sm border-gray-300 rounded-md mr-2"
                    >
                      <option value="admin">Admin</option>
                      <option value="seller">Người bán</option>
                      <option value="user">Khách hàng</option>
                    </select>
                    <select
                      value={user.status}
                      onChange={(e) => handleUpdateUserStatus(user.id, e.target.value as User['status'])}
                      className="text-sm border-gray-300 rounded-md"
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Không hoạt động</option>
                      <option value="banned">Khóa</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Phân trang */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">{filteredUsers.length}</span> của <span className="font-medium">{filteredUsers.length}</span> người dùng
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <a
                  href="#"
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-current="page"
                  className="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  1
                </a>
                <a
                  href="#"
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Modal chi tiết người dùng */}
      {isModalOpen && selectedUser && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Chi tiết người dùng
                    </h3>
                    <div className="flex items-center mb-6">
                      <img 
                        src={selectedUser.avatar} 
                        alt={selectedUser.name} 
                        className="h-16 w-16 rounded-full object-cover mr-4"
                      />
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{selectedUser.name}</h4>
                        <p className="text-sm text-gray-500">{selectedUser.email}</p>
                        <div className="mt-1">{renderRole(selectedUser.role)}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">ID</p>
                        <p className="text-sm text-gray-900">{selectedUser.id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Trạng thái</p>
                        <div className="mt-1">{renderStatus(selectedUser.status)}</div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Ngày tham gia</p>
                        <p className="text-sm text-gray-900">{selectedUser.joinDate}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Đăng nhập gần đây</p>
                        <p className="text-sm text-gray-900">{selectedUser.lastLogin}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Số đơn hàng</p>
                        <p className="text-sm text-gray-900">{selectedUser.orders}</p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Vai trò người dùng</h4>
                      <select
                        value={selectedUser.role}
                        onChange={(e) => handleUpdateUserRole(selectedUser.id, e.target.value as User['role'])}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="admin">Admin</option>
                        <option value="seller">Người bán</option>
                        <option value="user">Khách hàng</option>
                      </select>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Trạng thái tài khoản</h4>
                      <select
                        value={selectedUser.status}
                        onChange={(e) => handleUpdateUserStatus(selectedUser.id, e.target.value as User['status'])}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Không hoạt động</option>
                        <option value="banned">Khóa</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Lưu thay đổi
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage; 