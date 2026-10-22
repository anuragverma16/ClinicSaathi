import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-600">ClinicSaathi</h2>
          <nav className="mt-8 space-y-2">
            <a href="/dashboard" className="block px-4 py-2.5 rounded-lg bg-blue-50 text-blue-600 font-semibold">Dashboard</a>
            <a href="/appointments" className="block px-4 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100">Appointments</a>
            <a href="/patients" className="block px-4 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100">Patients</a>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}