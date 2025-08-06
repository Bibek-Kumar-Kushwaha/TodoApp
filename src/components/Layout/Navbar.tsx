"use client"
import React, { useState, useEffect } from 'react'
import { MenuIcon, MoonIcon, SunIcon, UserCircleIcon, XIcon, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'

const Navbar = () => {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await axios.post('/api/auth/logout', {}, {
        withCredentials: true
      })
      
      // Clear any local storage or session data if needed
      localStorage.clear()
      sessionStorage.clear()
      
      // Redirect to login page
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Even if API fails, redirect to login
      router.push('/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <nav className="border-b bg-background/95 dark:bg-gray-900 dark:text-white px-4 py-3 shadow-sm w-full static top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link 
        href="/"
        className="flex items-center space-x-2 font-bold text-xl"
        >
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground text-sm font-bold">T</span>
        </div>
        <span className="hidden sm:inline-block">TodoApp</span>
        </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center space-x-6">
        <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        <Link href="/todos" className="hover:underline">Todos</Link>

        {/* Theme Toggle */}
        <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
        {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <UserCircleIcon className="h-6 w-6" />
        </button>
        {isProfileOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded py-2 z-10">
          <Link 
            href="/profile" 
            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsProfileOpen(false)}
          >
            Profile
          </Link>
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center space-x-2 w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
          >
            <LogOut className="h-4 w-4" />
            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
          </div>
        )}
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center">
        <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="p-2"
        >
        {isMobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
      <div className="md:hidden mt-2 space-y-2 px-2">
        <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Dashboard</Link>
        <Link href="/todos" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Todos</Link>
    
        <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded w-full"
        >
        {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <div className="border-t pt-2">
        <Link 
          href="/profile" 
          className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Profile
        </Link>
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center space-x-2 w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-left"
        >
          <LogOut className="h-4 w-4" />
          <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
        </div>
      </div>
      )}
    </nav>
  )
}

export default Navbar
