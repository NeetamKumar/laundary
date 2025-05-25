import { useState, useEffect } from 'react';
import { mockStudents, mockLaundryEntries, mockPayments } from '../lib/mockData';
import type { Student, LaundryEntry, Payment } from '../types';

export function useStudentData(prn: string | null) {
  const [student, setStudent] = useState<Student | null>(null);
  const [laundryEntries, setLaundryEntries] = useState<LaundryEntry[]>([]);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!prn) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get data from mock data
      const studentData = mockStudents.find(s => s.prn === prn);
      const entriesData = mockLaundryEntries.filter(e => e.prn === prn);
      const paymentData = mockPayments.find(p => p.prn === prn);

      if (!studentData || !paymentData) {
        throw new Error('Student data not found');
      }

      setStudent(studentData);
      setLaundryEntries(entriesData);
      setPayment(paymentData);
    } catch (err) {
      console.error('Error fetching student data:', err);
      setError('Failed to fetch student data');
    } finally {
      setLoading(false);
    }
  }, [prn]);

  return {
    student,
    laundryEntries,
    payment,
    loading,
    error
  };
}