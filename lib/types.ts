// Invoice status enum (matches Prisma schema)
export const InvoiceStatus = {
  DRAFT: 'DRAFT',
  SENT: 'SENT', 
  PAID: 'PAID',
  OVERDUE: 'OVERDUE'
} as const;

export type InvoiceStatus = typeof InvoiceStatus[keyof typeof InvoiceStatus];

// Core database types based on Prisma schema
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  billing_address: string | null;
  notes: string | null;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Invoice {
  id: string;
  client_id: string;
  invoice_number: string;
  status: InvoiceStatus;
  total_amount: number;
  sent_date: Date | null;
  due_date: Date | null;
  paid_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  rate: number | null;
  total: number | null;
  agency_commission: number;
  business_area: BusinessArea;
  created_at: Date;
  updated_at: Date | null;
}



// Extended types with relations
export interface ClientWithInvoices extends Client {
  invoices: Invoice[];
}

export interface InvoiceWithDetails extends Invoice {
  client: Client;
  items: InvoiceItem[];
}

export interface InvoiceWithClient extends Invoice {
  client: Client;
}

// Unused enum - commented out to fix warnings
// export enum RecurrenceFrequency {
//   WEEKLY = 'weekly',
//   MONTHLY = 'monthly',
//   QUARTERLY = 'quarterly',
//   YEARLY = 'yearly'
// }

// Form types
export interface ClientFormData {
  name: string;
  email: string;
  phone?: string;
  billing_address?: string;
  notes?: string;
  image_url?: string;
}

export interface InvoiceFormData {
  client_id: string;
  due_date?: string;
  items: InvoiceItemFormData[];
}

export interface InvoiceItemFormData {
  description: string;
  quantity: number | '';
  rate: number | '';
  agency_commission: number | '';
  business_area: BusinessArea;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
  business_area: BusinessArea;
  receipt_url: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export type BusinessArea = 'CREATIVE' | 'DEVELOPMENT' | 'SUPPORT';

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Authentication types
export interface AuthSession {
  isAuthenticated: boolean;
  user?: {
    username: string;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Email types
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

// PDF generation types
export interface InvoicePDFData {
  invoice: Invoice & {
    client: Client;
    items: InvoiceItem[];
  };
  company: {
    name: string;
    email: string;
    address?: string;
    phone?: string;
  };
}

// Search and filter types
export interface ClientFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface InvoiceFilters {
  search?: string;
  status?: InvoiceStatus;
  client_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

// Utility types
export type CreateClientData = Omit<Client, 'id' | 'created_at' | 'updated_at'>;
export type UpdateClientData = Partial<CreateClientData>;
export type CreateInvoiceData = Omit<Invoice, 'id' | 'invoice_number' | 'created_at' | 'updated_at'>;
export type UpdateInvoiceData = Partial<CreateInvoiceData>; 