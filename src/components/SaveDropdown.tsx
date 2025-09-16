// src/components/SaveDropdown.tsx
import React from 'react';
import './SaveDropdown.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faCopy } from '@fortawesome/free-solid-svg-icons';

interface SaveDropdownProps {
  onSave: () => void;
  onSaveAs: () => void;
  isSaveDisabled: boolean;
}

const SaveDropdown: React.FC<SaveDropdownProps> = ({
  onSave,
  onSaveAs,
  isSaveDisabled,
}) => {
  return (
    <div className="save-dropdown-menu">
      <button
        onClick={onSave}
        disabled={isSaveDisabled}
        title={
          isSaveDisabled
            ? 'Save a new dashboard first'
            : 'Save current dashboard'
        }
      >
        <FontAwesomeIcon icon={faSave} /> Save
      </button>
      <button onClick={onSaveAs}>
        <FontAwesomeIcon icon={faCopy} /> Save As...
      </button>
    </div>
  );
};

export default SaveDropdown;