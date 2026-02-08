
export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue' | 'Draft';

export type ItemUnit = 'unit' | 'kg' | 'liter' | 'gram' | 'box' | 'hour' | 'day' | 'packet';

export interface InvoiceItem {
  id: string;
  itemNumber: number;
  name: string;
  quantity: number;
  unit: ItemUnit;
  price: number;
  tax: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientAddress?: string;
  clientPhone?: string;
  dueDate: string;
  issueDate: string;
  items: InvoiceItem[];
  status: InvoiceStatus;
  subTotal: number;
  taxTotal: number;
  totalAmount: number;
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  companyName: string;
  companyAddress?: string;
  taxRate: number;
  currency: string;
  invoiceBackground?: string;
  companyLogo?: string;
  upiId?: string;
  invoiceTextColor?: string;
}

export interface DashboardStats {
  totalInvoices: number;
  pendingCount: number;
  pendingAmount: number;
  paidCount: number;
  paidAmount: number;
  overdueCount: number;
  overdueAmount: number;
}
