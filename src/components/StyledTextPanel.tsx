export const StyledTextPanel = ({ data }: { data: string }) => {
  return (
    <div
      style={{
        // --- Removed theme-breaking styles ---
        backgroundColor: 'transparent',

        // --- Use theme-agnostic styles ---
        color: 'var(--text-primary)', // Use theme text color
        whiteSpace: 'pre-wrap',
        padding: '16px', // Keep padding

        // --- User Requested Changes ---
        fontSize: '1rem', // Increased text size
        lineHeight: '1.6', // Added line spacing

        // --- Keep layout styles ---
        height: '100%',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      {data}
    </div>
  );
};

export default StyledTextPanel;