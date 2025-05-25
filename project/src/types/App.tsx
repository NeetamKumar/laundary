import React, { useState } from 'react';
import { SearchStudent } from './components/SearchStudent';
import { StudentDetails } from './components/StudentDetails';
import { NewEntryForm } from './components/NewEntryForm';
import { WashingChecklist } from './components/WashingChecklist';
import { PaymentRecords } from './components/PaymentRecords';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { LoginPage } from './components/LoginPage';
import { useAuth } from './hooks/useAuth';
import { mockStudents, mockPayments, predefinedItems } from './lib/mockData';
import { Shirt, LayoutDashboard, Search, ClipboardList, IndianRupee, Menu, X } from 'lucide-react';
import { useLaundryStore } from './store/laundryStore';
import type { Student, View } from './types';

function App() {
  const { user, loading, login, logout } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loginError, setLoginError] = useState<string>();

  const { entries, addEntry, updateEntryStatus, updatePaymentStatus } = useLaundryStore();

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoginError(undefined);
      await login(email, password);
    } catch (err) {
      setLoginError('Invalid credentials');
    }
  };

  const handleSearch = (prn: string) => {
    const student = mockStudents.find((s) => s.prn === prn);
    setSelectedStudent(student || null);
    setIsSidebarOpen(false);
  };

  const handleNewEntry = (items: { itemId: string; quantity: number; price: number; pieces: number }[]) => {
    if (!selectedStudent) return;

    // Calculate total pieces and amount
    const totalPieces = items.reduce((sum, item) => sum + item.pieces, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

    // Create new entry
    const newEntry = {
      id: (entries.length + 1).toString(),
      prn: selectedStudent.prn,
      date: new Date().toISOString().split('T')[0],
      totalAmount,
      totalPieces,
      isPaid: false,
      items: items.map(item => ({
        ...item,
        status: 'Pending' as const
      }))
    };

    // Update student's package usage
    if (selectedStudent.package) {
      selectedStudent.package.used += totalPieces;
      
      // Update the selected student state to reflect changes
      setSelectedStudent({
        ...selectedStudent,
        package: {
          ...selectedStudent.package,
          used: selectedStudent.package.used
        }
      });

      // Update the student in mockStudents array
      const studentIndex = mockStudents.findIndex(s => s.prn === selectedStudent.prn);
      if (studentIndex !== -1) {
        mockStudents[studentIndex] = {
          ...mockStudents[studentIndex],
          package: {
            ...mockStudents[studentIndex].package!,
            used: selectedStudent.package.used
          }
        };
      }
    }

    // Update payments
    const paymentIndex = mockPayments.findIndex(p => p.prn === selectedStudent.prn);
    if (paymentIndex !== -1) {
      mockPayments[paymentIndex] = {
        ...mockPayments[paymentIndex],
        totalAmount: mockPayments[paymentIndex].totalAmount + totalAmount,
        pendingAmount: mockPayments[paymentIndex].pendingAmount + totalAmount
      };
    }

    // Add new entry
    addEntry(newEntry);
    
    setShowNewEntry(false);
  };

  const handleApprovePayment = (prn: string) => {
    const paymentIndex = mockPayments.findIndex(p => p.prn === prn);
    if (paymentIndex === -1) return;

    mockPayments[paymentIndex] = {
      ...mockPayments[paymentIndex],
      pendingAmount: 0,
      lastPaymentDate: new Date().toISOString().split('T')[0]
    };

    updatePaymentStatus(prn, true);
  };

  const handleUpdateProfile = async (profilePicture: string) => {
    if (!selectedStudent) return;

    const updatedStudent = {
      ...selectedStudent,
      profilePicture
    };

    // Update in mockStudents array
    const studentIndex = mockStudents.findIndex(s => s.prn === selectedStudent.prn);
    if (studentIndex !== -1) {
      mockStudents[studentIndex] = updatedStudent;
    }

    setSelectedStudent(updatedStudent);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url("https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=2000")'
        }}
      >
        <div className="w-full bg-blue-600 text-white py-4 px-6 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold">SIMS Laundry Management</h1>
            <p className="text-sm opacity-90">Symbiosis Institute of Management Studies</p>
          </div>
        </div>
        <LoginPage onLogin={handleLogin} error={loginError} />
      </div>
    );
  }

  if (user.role === 'student') {
    const student = mockStudents.find(s => s.prn === user.prn);
    if (student) {
      return (
        <div className="min-h-screen flex flex-col">
          <div className="w-full bg-blue-600 text-white py-4 px-6 shadow-lg">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold">SIMS Laundry Management</h1>
              <p className="text-sm opacity-90">Symbiosis Institute of Management Studies</p>
            </div>
          </div>
          <div className="flex-1 bg-fixed bg-cover bg-center" style={{
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url("https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=2000")'
          }}>
            <StudentDashboard
              student={student}
              laundryEntries={entries.filter(e => e.prn === student.prn)}
              payment={mockPayments.find(p => p.prn === student.prn)!}
              onLogout={logout}
              onUpdateProfile={handleUpdateProfile}
            />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Header */}
      <div className="w-full bg-blue-600 text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">SIMS Laundry Management</h1>
          <p className="text-sm opacity-90">Symbiosis Institute of Management Studies</p>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div
          className={`fixed lg:relative inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition-transform duration-200 ease-in-out h-[calc(100vh-4rem)] overflow-y-auto flex-shrink-0`}
        >
          <div className="p-4 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-8">
              <Shirt className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">
                Laundry Manager
              </h1>
            </div>

            <nav className="space-y-2 flex-1">
              <NavButton
                view="dashboard"
                icon={<LayoutDashboard className="h-5 w-5" />}
                label="Dashboard"
                currentView={currentView}
                onClick={() => {
                  setCurrentView('dashboard');
                  setSelectedStudent(null);
                  setIsSidebarOpen(false);
                }}
              />
              <NavButton
                view="search"
                icon={<Search className="h-5 w-5" />}
                label="Search Student"
                currentView={currentView}
                onClick={() => {
                  setCurrentView('search');
                  setIsSidebarOpen(false);
                }}
              />
              <NavButton
                view="washing"
                icon={<ClipboardList className="h-5 w-5" />}
                label="Washing Checklist"
                currentView={currentView}
                onClick={() => {
                  setCurrentView('washing');
                  setSelectedStudent(null);
                  setIsSidebarOpen(false);
                }}
              />
              <NavButton
                view="payments"
                icon={<IndianRupee className="h-5 w-5" />}
                label="Payment Records"
                currentView={currentView}
                onClick={() => {
                  setCurrentView('payments');
                  setSelectedStudent(null);
                  setIsSidebarOpen(false);
                }}
              />
            </nav>

            <div className="mt-auto pt-4">
              <button
                onClick={logout}
                className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 bg-fixed bg-cover bg-center" style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url("https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=2000")'
        }}>
          <main className="p-4 lg:p-8 h-[calc(100vh-4rem)] overflow-y-auto">
            {currentView === 'dashboard' && (
              <AdminDashboard
                students={mockStudents}
                payments={mockPayments}
                laundryEntries={entries}
                onViewStudent={(prn) => {
                  handleSearch(prn);
                  setCurrentView('search');
                }}
                onApprovePayment={handleApprovePayment}
              />
            )}

            {currentView === 'search' && (
              <div className="space-y-6">
                <SearchStudent onSearch={handleSearch} />
                {selectedStudent && (
                  <>
                    <StudentDetails
                      student={selectedStudent}
                      laundryHistory={entries.filter((e) => e.prn === selectedStudent.prn)}
                      payment={mockPayments.find((p) => p.prn === selectedStudent.prn)!}
                      onNewEntry={() => setShowNewEntry(true)}
                      onUpdatePayment={() => handleApprovePayment(selectedStudent.prn)}
                    />
                    {showNewEntry && (
                      <NewEntryForm
                        items={predefinedItems}
                        student={selectedStudent}
                        onSubmit={handleNewEntry}
                        onClose={() => setShowNewEntry(false)}
                      />
                    )}
                  </>
                )}
              </div>
            )}
            
            {currentView === 'washing' && (
              <WashingChecklist
                entries={entries}
                students={mockStudents}
                onUpdateStatus={updateEntryStatus}
                onViewStudent={(prn) => {
                  handleSearch(prn);
                  setCurrentView('search');
                }}
              />
            )}

            {currentView === 'payments' && (
              <PaymentRecords
                payments={mockPayments}
                onApprovePayment={handleApprovePayment}
                onViewStudent={(prn) => {
                  handleSearch(prn);
                  setCurrentView('search');
                }}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

interface NavButtonProps {
  view: View;
  icon: React.ReactNode;
  label: string;
  currentView: View;
  onClick: () => void;
}

const NavButton = ({ view, icon, label, currentView, onClick }: NavButtonProps) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 w-full px-4 py-3 text-left ${
      currentView === view
        ? 'bg-blue-600 text-white'
        : 'text-gray-600 hover:bg-gray-100'
    } transition-colors rounded-lg`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

export default App;