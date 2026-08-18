'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi';

const Navbar = () => {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setIsOpen(false);
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="font-bold text-2xl">
            BOS-TA
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/" className="hover:text-blue-200 transition">
              Home
            </Link>
            <Link href="/mentors" className="hover:text-blue-200 transition">
              Browse Mentors
            </Link>

            {!loading && (
              <>
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard" className="hover:text-blue-200 transition">
                      Dashboard
                    </Link>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm">{user?.firstName}</span>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
                      >
                        <FiLogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-50 transition"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="bg-blue-700 px-4 py-2 rounded hover:bg-blue-800 transition"
                    >
                      Register
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/" className="block py-2 hover:text-blue-200">
              Home
            </Link>
            <Link href="/mentors" className="block py-2 hover:text-blue-200">
              Browse Mentors
            </Link>
            {!loading && (
              <>
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard" className="block py-2 hover:text-blue-200">
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left py-2 text-red-300 hover:text-red-200"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block py-2 hover:text-blue-200">
                      Login
                    </Link>
                    <Link href="/register" className="block py-2 hover:text-blue-200">
                      Register
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
