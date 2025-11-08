// src/components/Header.tsx
import React, { useState, useRef, useEffect } from 'react';
import './Header.css';
import UserMenu from './UserMenu';

interface HeaderProps {
  isEditable: boolean;
  toggleEditMode: () => void;
  onNewDashboard: () => void;
  onAddEmbed: () => void;
  themeMode: 'light' | 'dark';
  onProfileClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isEditable,
  toggleEditMode,
  onNewDashboard,
  onAddEmbed,
  themeMode,
  onProfileClick,
}) => {
  const [isUserMenuVisible, setUserMenuVisible] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const toggleUserMenu = () => setUserMenuVisible((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="app-header">
      <div className="header-left">
        <img
          src={
            themeMode === 'dark'
              ? '/sisense-logo-white.png'
              : '/sisense-logo-black.png'
          }
          alt="Sisense Logo"
          className="sisense-logo"
        />
      </div>
      <div className="header-right">
        <div className="header-icons">
          <i className="fas fa-search" title="Search"></i>
          <i className="fas fa-bell" title="Notifications"></i>
          <i
            className="fas fa-th"
            onClick={onNewDashboard}
            title="New Dashboard"
          ></i>
          <i
            className="fas fa-plus"
            onClick={onAddEmbed}
            title="Add Content"
          ></i>
          <i
            className={`fas fa-pencil-alt ${isEditable ? 'active' : ''}`}
            onClick={toggleEditMode}
            title={isEditable ? 'Done Editing' : 'Edit Dashboard'}
          ></i>
          <div ref={userMenuRef} style={{ position: 'relative' }}>
            <i
              className="fas fa-user"
              onClick={toggleUserMenu}
              title="User Menu"
            ></i>
            {isUserMenuVisible && (
              <UserMenu
                onProfileClick={() => {
                  onProfileClick();
                  setUserMenuVisible(false);
                }}
                onSignOutClick={() => alert('Sign Out')}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
