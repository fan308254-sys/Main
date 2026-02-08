
import { Invoice, Client, User, ItemUnit } from './types';

export const COLORS = {
  primary: '#2563EB',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  background: '#F8FAFC',
};

export const UNIT_OPTIONS: { value: ItemUnit; label: string }[] = [
  { value: 'unit', label: 'Unit' },
  { value: 'kg', label: 'kg' },
  { value: 'liter', label: 'Liter' },
  { value: 'gram', label: 'Gram' },
  { value: 'box', label: 'Box' },
  { value: 'hour', label: 'Hour' },
  { value: 'day', label: 'Day' },
  { value: 'packet', label: 'Packet' },
];

export const INITIAL_USER: User = {
  id: 'u1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  phone: '9876543210',
  avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=2563EB&color=fff',
  companyName: 'TechFlow Solutions',
  companyAddress: '123 Business Park, Silicon Valley, CA 94025',
  taxRate: 18,
  currency: '₹',
  upiId: '',
  invoiceTextColor: '#0f172a',
};

export const INITIAL_CLIENTS: Client[] = [];

export const INITIAL_INVOICES: Invoice[] = [];
