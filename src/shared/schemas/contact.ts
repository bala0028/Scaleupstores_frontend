export interface ContactInput {
  name: string;
  email: string;
  phone: string;
  message: string;
  [key: string]: unknown;
}
