import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CustomCursor } from '../ui/CustomCursor';
import { ScrollToTopButton } from '../ui/ScrollToTopButton';
import { Outlet } from 'react-router-dom';

export const MainLayout = () => {
  return (
    <>
      <div className="fixed inset-0 bg-noise z-50 pointer-events-none" />
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <CustomCursor />
      <Navbar />
      <Outlet />
      <Footer />
      <ScrollToTopButton />
    </>
  );
};
