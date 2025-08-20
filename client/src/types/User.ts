export interface User {
  id: string | number;
  username: string;
  email: string;
  profilePicture?: string;
  createdAt?: string;
  settings?: {
    notifications?: boolean;
    language?: string;
    currency?: string;
  };
}
