'use client';

import React, { useState } from 'react';

export const AppointmentForm = () => {
  const [patientName, setPatientName] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Booking appointment:', { patientName, date });
    // Yahan API call triggered hogi
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 max-w-md">
      <h3 className="text-xl font-bold text-slate-800">Book New Appointment</h3>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Patient Name</label>
        <input
          type="text"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter patient name"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition">
        Confirm Booking
      </button>
    </form>
  );
};