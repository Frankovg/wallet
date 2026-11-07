export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Account {
  balance: number; // integer cents
}

export interface MeResponse {
  user: User;
  account: Account;
}

export interface Transfer {
  id: string;
  direction: 'sent' | 'received';
  amount: number; // integer cents
  counterpartName: string;
  counterpartEmail: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
}
