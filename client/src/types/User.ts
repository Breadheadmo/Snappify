export interface User {
  id?: string | number;
  _id?: string; // MongoDB _id field
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  isAdmin?: boolean;
  profilePicture?: string;
  phoneNumber?: string;
  defaultShippingAddress?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  wishlist?: string[];
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  emailVerificationToken?: string;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  settings?: {
    notifications?: boolean;
    language?: string;
    currency?: string;
  };
}
