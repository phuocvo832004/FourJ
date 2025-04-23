import  { memo } from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

interface UserRoles {
  userId: string;
  roles: string[];
  permissions: string[];
}

interface RolesTabProps {
  userRoles: UserRoles | null | undefined;
}

const RolesTab = memo(({ userRoles }: RolesTabProps) => {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Vai trò và quyền hạn của bạn</h2>

      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Vai trò</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {userRoles?.roles && userRoles.roles.length > 0 ? (
            userRoles.roles.map((role, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
                <ShieldCheckIcon className="w-6 h-6 text-blue-600 mr-3" />
                <span className="font-medium capitalize">{role}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">Không có vai trò nào được gán</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Quyền hạn</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          {userRoles?.permissions && userRoles.permissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {userRoles.permissions.map((permission, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm">{permission}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Không có quyền hạn cụ thể</p>
          )}
        </div>
      </div>
    </>
  );
});

export default RolesTab; 