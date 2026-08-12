export interface ManagedUser {
  id: string;
  email: string;
  displayName: string | null;
  role: "admin" | "user";
  createdAt: string;
}

export interface AdminUserInput {
  email: string;
  displayName: string | null;
  administratorPassword: string;
  password?: string | undefined;
}
