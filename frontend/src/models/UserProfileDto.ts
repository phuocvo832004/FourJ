export interface UserProfileDto {
    id: string; // Hoặc kiểu dữ liệu phù hợp với ID trong DB
    auth0Id: string;
    email: string | null;
    fullName: string | null;
    avatarUrl: string | null;
    address: string | null;
    phoneNumber: string | null;
    createdAt: string; // Hoặc Date
    updatedAt: string; // Hoặc Date
    permissions?: string[];
    roles?: string[]; 
  }