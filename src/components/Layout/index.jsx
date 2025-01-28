import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import { LayoutContainer, MainContent } from './styles';

const Layout = () => {
  return (
    <LayoutContainer>
      <Navbar />
      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;
