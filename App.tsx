
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Dashboard from './components/Dashboard';
import InvoiceForm from './components/InvoiceForm';
import LoginForm from './components/LoginForm';
import Settings from './components/Settings';
import { Invoice, Client, User, DashboardStats, InvoiceStatus } from './types';
import { db } from './services/db';
import { CheckCircle, AlertCircle, X, Search, ChevronDown, Loader2 } from 'lucide-react';

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
  <div className={`fixed top-24 right-4 z-[200] flex items-center space-x-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-300 ${
    type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
  }`}>
    {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
    <span className="font-bold">{message}</span>
    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors"><X size={18} /></button>
  </div>
);

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0, pendingCount: 0, pendingAmount: 0, paidCount: 0, paidAmount: 0, overdueCount: 0, overdueAmount: 0
  });
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [invoiceSearch, setInvoiceSearch] = useState('');

  // Initial Auth Check
  useEffect(() => {
    const checkSession = async () => {
      const uid = db.getSessionUid();
      if (uid) {
        const userData = await db.getCurrentUserData(uid);
        if (userData) {
          setCurrentUser(userData);
          await loadUserData(uid);
          setIsAuthenticated(true);
        }
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const loadUserData = async (uid: string) => {
    try {
      const [fetchedInvoices, fetchedClients] = await Promise.all([
        db.getInvoices(uid),
        db.getClients(uid)
      ]);
      setInvoices(fetchedInvoices);
      setClients(fetchedClients);
      setStats(db.calculateStats(fetchedInvoices));
    } catch (error) {
      console.error("Failed to load user data:", error);
      showToast("Error loading local data", "error");
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogin = async (user: User) => {
    db.setSessionUid(user.id);
    setCurrentUser(user);
    setIsAuthenticated(true);
    await loadUserData(user.id);
    showToast(`Welcome, ${user.name}!`);
  };

  const handleLogout = async () => {
    db.setSessionUid(null);
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab('dashboard');
    setIsCreatingInvoice(false);
    showToast('Logged out successfully');
  };

  const handleUpdateProfile = async (updatedUser: User) => {
    if (!currentUser) return;
    try {
      await db.updateUser(currentUser.id, updatedUser);
      setCurrentUser(updatedUser);
      showToast('Profile updated');
    } catch (error) {
      showToast('Failed to update profile', 'error');
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>, invoiceId: string) => {
    e.stopPropagation();
    if (!currentUser) return;
    const newStatus = e.target.value as InvoiceStatus;
    
    try {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (invoice) {
        const updatedInvoice = { ...invoice, status: newStatus };
        await db.saveInvoice(currentUser.id, updatedInvoice);
        const newInvoices = invoices.map(inv => inv.id === invoiceId ? updatedInvoice : inv);
        setInvoices(newInvoices);
        setStats(db.calculateStats(newInvoices));
        showToast(`Status: ${newStatus}`);
      }
    } catch (error) {
      showToast('Update failed', 'error');
    }
  };

  const handleSaveInvoice = async (invoice: Invoice) => {
    if (!currentUser) return;
    try {
      const savedInvoice = await db.saveInvoice(currentUser.id, invoice);
      const isNew = !invoices.find(inv => inv.id === invoice.id);
      let updatedInvoices;
      
      if (!isNew) {
        updatedInvoices = invoices.map(inv => inv.id === savedInvoice.id ? savedInvoice : inv);
      } else {
        updatedInvoices = [...invoices, savedInvoice];
      }
      
      setInvoices(updatedInvoices);
      setStats(db.calculateStats(updatedInvoices));
      setIsCreatingInvoice(false);
      setEditingInvoice(null);
      setActiveTab('invoices');
      showToast(isNew ? 'Invoice created!' : 'Invoice updated!');
    } catch (error) {
      showToast('Failed to save invoice', 'error');
    }
  };

  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setIsCreatingInvoice(true);
  };

  const handleEditInvoice = (id: string) => {
    const inv = invoices.find(i => i.id === id);
    if (inv) {
      setEditingInvoice(inv);
      setIsCreatingInvoice(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200 animate-bounce">
          <span className="text-2xl font-black">I+</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-500 font-medium">
          <Loader2 size={18} className="animate-spin" />
          <span>Starting Application...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const renderContent = () => {
    if (isCreatingInvoice) {
      return (
        <InvoiceForm 
          initialData={editingInvoice}
          clients={clients}
          currentUser={currentUser}
          onSave={handleSaveInvoice}
          onCancel={() => {
            setIsCreatingInvoice(false);
            setEditingInvoice(null);
          }}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            stats={stats} 
            invoices={invoices} 
            user={currentUser}
            onViewAllInvoices={() => setActiveTab('invoices')}
            onCreateInvoice={handleCreateInvoice}
            onViewInvoice={handleEditInvoice}
            onStatusChange={handleStatusChange}
          />
        );
      case 'invoices':
        const filteredInvoices = invoices.filter(inv => 
          inv.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
          inv.clientName.toLowerCase().includes(invoiceSearch.toLowerCase())
        );

        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900">Invoices</h1>
                <p className="text-sm text-slate-500">Manage and track your billing history.</p>
              </div>
              <div className="flex items-center space-x-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64 group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Search size={18} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search invoice or client..." 
                    value={invoiceSearch}
                    onChange={(e) => setInvoiceSearch(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all font-medium"
                  />
                  {invoiceSearch && (
                    <button 
                      onClick={() => setInvoiceSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full text-slate-400"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <button 
                  onClick={handleCreateInvoice}
                  className="hidden md:block px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  Create Invoice
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                {invoices.length === 0 ? (
                  <div className="p-12 text-center">
                    <h3 className="text-lg font-bold text-slate-900">No invoices yet</h3>
                    <p className="text-slate-500 mt-2">Start by creating your first digital invoice.</p>
                  </div>
                ) : filteredInvoices.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">No matching results found.</div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 md:px-6 py-4">Number</th>
                        <th className="px-4 md:px-6 py-4">Client</th>
                        <th className="hidden md:table-cell px-6 py-4">Issued</th>
                        <th className="px-4 md:px-6 py-4">Amount</th>
                        <th className="px-4 md:px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredInvoices.map(inv => (
                        <tr 
                          key={inv.id} 
                          className="hover:bg-slate-50 transition-all cursor-pointer active:bg-slate-100"
                          onClick={() => handleEditInvoice(inv.id)}
                        >
                          <td className="px-4 md:px-6 py-4 font-bold text-slate-900 text-sm">{inv.invoiceNumber}</td>
                          <td className="px-4 md:px-6 py-4 text-slate-600 text-sm">{inv.clientName}</td>
                          <td className="hidden md:table-cell px-6 py-4 text-slate-500 text-sm">{inv.issueDate}</td>
                          <td className="px-4 md:px-6 py-4 font-bold text-slate-900 text-sm">{currentUser.currency}{inv.totalAmount.toLocaleString()}</td>
                          <td className="px-4 md:px-6 py-4" onClick={(e) => e.stopPropagation()}>
                            <div className="relative group/status">
                              <select 
                                value={inv.status}
                                onChange={(e) => handleStatusChange(e, inv.id)}
                                className={`appearance-none px-3 pr-8 py-1.5 rounded-full text-[10px] md:text-xs font-bold cursor-pointer outline-none border-none transition-all shadow-sm ${
                                  inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 
                                  inv.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 
                                  inv.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                <option value="Draft">Draft</option>
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                                <option value="Overdue">Overdue</option>
                              </select>
                              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        );
      case 'clients':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900">Clients</h1>
                <p className="text-sm text-slate-500">Manage your business contacts.</p>
              </div>
              <button 
                onClick={async () => {
                   const name = prompt("Client Name?");
                   if(name && currentUser) {
                      await db.saveClient(currentUser.id, { id: '', name, email: '', phone: '', address: '' });
                      setClients(await db.getClients(currentUser.id));
                   }
                }}
                className="hidden md:block px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
              >
                Add Client
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map(client => (
                <div key={client.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900">{client.name}</h3>
                  <p className="text-sm text-slate-500">{client.email || 'No email'}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'settings':
        return <Settings user={currentUser} onUpdateUser={handleUpdateProfile} />;
      default:
        return <div>Section Under Construction</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar user={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex flex-1 pt-20">
        <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setIsCreatingInvoice(false); setActiveTab(tab); }} onNewInvoice={handleCreateInvoice} onLogout={handleLogout} />
        <main className="flex-1 w-full md:ml-64 p-4 md:p-8 mobile-bottom-nav-spacing transition-all">
          {renderContent()}
        </main>
      </div>
      {!isCreatingInvoice && <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} onNewInvoice={handleCreateInvoice} />}
    </div>
  );
};

export default App;
