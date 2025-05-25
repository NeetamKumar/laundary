import React, { useState } from 'react';
import { Shirt, X, Camera } from 'lucide-react';
import { registerUser } from '../lib/auth';
import { ImageUpload } from './ImageUpload';
import { ProfilePicture } from './ProfilePicture';
import type { RegistrationForm } from '../types';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  error?: string;
}

const initialRegistrationForm: RegistrationForm = {
  prn: '',
  fullName: '',
  email: '',
  contact: '',
  room: '',
  packageType: '40pcs',
  password: '',
  confirmPassword: '',
  batch: 'junior',
  guardianName: '',
  guardianContact: '',
  profilePicture: ''
};

export function LoginPage({ onLogin, error }: LoginPageProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationForm, setRegistrationForm] = useState<RegistrationForm>(initialRegistrationForm);
  const [registrationError, setRegistrationError] = useState<string>();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier?.trim() || !password?.trim()) {
      return;
    }
    try {
      setIsLoggingIn(true);
      await onLogin(identifier.trim(), password.trim());
    } catch (err) {
      console.error('Login error:', err);
      if (err instanceof Error) {
        setRegistrationError(err.message);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationError(undefined);
    setIsRegistering(true);

    try {
      // Validate form
      if (registrationForm.password !== registrationForm.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (registrationForm.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      if (!registrationForm.prn.match(/^\d{11}$/)) {
        throw new Error('PRN must be 11 digits');
      }

      if (!registrationForm.email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      if (!registrationForm.contact.match(/^\+91 \d{10}$/)) {
        throw new Error('Contact must be in format: +91 1234567890');
      }

      if (!registrationForm.guardianContact.match(/^\+91 \d{10}$/)) {
        throw new Error('Guardian contact must be in format: +91 1234567890');
      }

      await registerUser(registrationForm);

      // Success
      alert('Registration successful! Please check your email to verify your account before logging in.');
      setShowRegistration(false);
      setRegistrationForm(initialRegistrationForm);

    } catch (err) {
      console.error('Registration error:', err);
      setRegistrationError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleRegistrationChange = (field: keyof RegistrationForm, value: any) => {
    setRegistrationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageSelect = (base64Image: string) => {
    handleRegistrationChange('profilePicture', base64Image);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-blue-600 p-3 rounded-lg">
            <Shirt className="h-12 w-12 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Laundry Manager
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {showRegistration ? 'Create your account' : 'Sign in with your PRN or Email'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {showRegistration ? (
            <form className="space-y-6" onSubmit={handleRegistrationSubmit}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">New Registration</h3>
                <button
                  type="button"
                  onClick={() => setShowRegistration(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col items-center gap-4">
                <ProfilePicture
                  src={registrationForm.profilePicture}
                  size="lg"
                  className="border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => setShowImageUpload(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Camera className="h-4 w-4" />
                  {registrationForm.profilePicture ? 'Change Photo' : 'Add Photo'}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch
                </label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="senior"
                      checked={registrationForm.batch === 'senior'}
                      onChange={(e) => handleRegistrationChange('batch', e.target.value)}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">Senior Batch</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="junior"
                      checked={registrationForm.batch === 'junior'}
                      onChange={(e) => handleRegistrationChange('batch', e.target.value)}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">Junior Batch</span>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="prn" className="block text-sm font-medium text-gray-700">
                  PRN
                </label>
                <input
                  type="text"
                  id="prn"
                  value={registrationForm.prn}
                  onChange={(e) => handleRegistrationChange('prn', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={registrationForm.fullName}
                  onChange={(e) => handleRegistrationChange('fullName', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={registrationForm.email}
                  onChange={(e) => handleRegistrationChange('email', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
                  Contact (+91 format)
                </label>
                <input
                  type="text"
                  id="contact"
                  value={registrationForm.contact}
                  onChange={(e) => handleRegistrationChange('contact', e.target.value)}
                  placeholder="+91 1234567890"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="guardianName" className="block text-sm font-medium text-gray-700">
                  Guardian Name
                </label>
                <input
                  type="text"
                  id="guardianName"
                  value={registrationForm.guardianName}
                  onChange={(e) => handleRegistrationChange('guardianName', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="guardianContact" className="block text-sm font-medium text-gray-700">
                  Guardian Contact (+91 format)
                </label>
                <input
                  type="text"
                  id="guardianContact"
                  value={registrationForm.guardianContact}
                  onChange={(e) => handleRegistrationChange('guardianContact', e.target.value)}
                  placeholder="+91 1234567890"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="room" className="block text-sm font-medium text-gray-700">
                  Room Number
                </label>
                <input
                  type="text"
                  id="room"
                  value={registrationForm.room}
                  onChange={(e) => handleRegistrationChange('room', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="packageType" className="block text-sm font-medium text-gray-700">
                  Package Type
                </label>
                <select
                  id="packageType"
                  value={registrationForm.packageType}
                  onChange={(e) => handleRegistrationChange('packageType', e.target.value as '40pcs' | '60pcs' | '75pcs')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="40pcs">40 Pieces Package</option>
                  <option value="60pcs">60 Pieces Package</option>
                  <option value="75pcs">75 Pieces Package</option>
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={registrationForm.password}
                  onChange={(e) => handleRegistrationChange('password', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={registrationForm.confirmPassword}
                  onChange={(e) => handleRegistrationChange('confirmPassword', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {registrationError && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {registrationError}
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRegistering ? 'Registering...' : 'Register'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowRegistration(false)}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                  Email / PRN
                </label>
                <div className="mt-1">
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {error}
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingIn ? 'Signing in...' : 'Sign in'}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowRegistration(true)}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  New student? Register here
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {showImageUpload && (
        <ImageUpload
          onImageSelect={handleImageSelect}
          onClose={() => setShowImageUpload(false)}
        />
      )}
    </div>
  );
}