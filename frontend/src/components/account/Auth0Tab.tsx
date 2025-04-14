import React, { memo } from 'react';

interface Auth0User {
  sub?: string;
  email_verified?: boolean;
  updated_at?: string;
  iss?: string;
  name?: string;
  email?: string;
  picture?: string;
}

interface Auth0TabProps {
  user: Auth0User | null | undefined;
}

const Auth0Tab = memo(({ user }: Auth0TabProps) => {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Thông tin Auth0</h2>

      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">ID người dùng (Auth0)</p>
            <p className="font-mono bg-gray-100 p-2 rounded mt-1 text-sm break-all">{user?.sub}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Email đã xác minh</p>
            <p className="mt-1 flex items-center">
              {user?.email_verified ? (
                <span className="text-green-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Đã xác minh
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Chưa xác minh
                </span>
              )}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Người cung cấp</p>
            <p className="font-medium mt-1 capitalize">{(user?.sub || '').split('|')[0]}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Đăng nhập lần cuối</p>
            <p className="font-medium mt-1">{user?.updated_at ? new Date(user.updated_at).toLocaleString('vi-VN') : ''}</p>
          </div>
        </div>

        <div className="mt-8">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={() => {
              if (user?.iss) {
                window.location.href = `https://${user.iss.split('/')[2]}/account`;
              }
            }}
          >
            Truy cập trang quản lý Auth0
          </button>
        </div>
      </div>
    </>
  );
});

export default Auth0Tab; 