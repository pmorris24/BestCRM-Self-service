// src/components/SaveDropdown.tsx
import React from 'react';
import './SaveDropdown.css';

interface SaveDropdownProps {
  onSave: () => void;
  onSaveAs?: () => void; // Made this prop optional
  isSaveDisabled: boolean;
}

const SaveDropdown: React.FC<SaveDropdownProps> = ({
  onSave,
  onSaveAs, // This can now be undefined
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
        <i className="fas fa-save"></i> Save
      </button>

      {/* Only render the "Save As" button if the onSaveAs prop is provided */}
      {onSaveAs && (
        <button onClick={onSaveAs}>
          <i className="fas fa-copy"></i> Save As...
        </button>
      )}
    </div>
  );
};

export default SaveDropdown;