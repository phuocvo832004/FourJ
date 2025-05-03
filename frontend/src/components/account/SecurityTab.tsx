import { memo } from 'react';

interface UserAuth {
  iss?: string;
  name?: string;
  email?: string;
  picture?: string;
}

interface SecurityTabProps {
  user: UserAuth | null | undefined;
}

const SecurityTab = memo(({ user }: SecurityTabProps) => {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Bảo mật tài khoản</h2>

      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium">Thay đổi mật khẩu</h3>
              <p className="text-gray-500 mt-1">Cập nhật mật khẩu định kỳ để bảo vệ tài khoản của bạn</p>
            </div>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              onClick={() => {
                if (user?.iss) {
                  window.location.href = `https://${user.iss.split('/')[2]}/account/password`;
                }
              }}
            >
              Thay đổi
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium">Xác thực hai yếu tố</h3>
              <p className="text-gray-500 mt-1">Tăng cường bảo mật bằng xác thực hai yếu tố</p>
            </div>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              onClick={() => {
                if (user?.iss) {
                  window.location.href = `https://${user.iss.split('/')[2]}/account/mfa`;
                }
              }}
            >
              Thiết lập
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium">Phiên đăng nhập hoạt động</h3>
              <p className="text-gray-500 mt-1">Xem và quản lý các phiên đăng nhập của bạn</p>
            </div>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium">
              Xem
            </button>
          </div>
        </div>
      </div>
    </>
  );
});

export default SecurityTab; 