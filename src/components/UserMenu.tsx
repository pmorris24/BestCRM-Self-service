import React from 'react';

interface UserMenuProps {
  onProfileClick: () => void;
  onSignOutClick: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onProfileClick, onSignOutClick }) => {
  return (
    <ul className="user-menu">
      <li onClick={onProfileClick}>Profile</li>
      <li onClick={onSignOutClick}>Sign Out</li>
    </ul>
  );
};

export default UserMenu;