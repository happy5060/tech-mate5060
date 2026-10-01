import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface AppLayoutProps {
  children: React.ReactNode;
  onDataReset?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, onDataReset }) => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Ambient background decorative glow elements (Restrained & subtle) */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-200/25 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse duration-1000" />
      <div className="fixed bottom-1/4 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-1/3 w-80 h-80 bg-sky-200/15 rounded-full blur-3xl pointer-events-none -z-10" />

      <Header onDataReset={onDataReset} />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </main>

      <Footer />
    </div>
  );
};
