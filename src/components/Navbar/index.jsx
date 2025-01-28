import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { NavContainer, NavLinks, WalletSection } from './styles';

const Navbar = () => {
  const location = useLocation();
  const { connected } = useWallet();

  return (
    <NavContainer>
      <Link to="/">
        <img src="/logo.svg" alt="Neurolov" />
      </Link>
      
      <NavLinks>
        <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
          Dashboard
        </Link>
        <Link to="/tasks" className={location.pathname === '/tasks' ? 'active' : ''}>
          Tasks
        </Link>
      </NavLinks>

      <WalletSection>
        <WalletMultiButton />
        {connected && (
          <span className="earnings">
            0 NEURO
          </span>
        )}
      </WalletSection>
    </NavContainer>
  );
};

export default Navbar;
