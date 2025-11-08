// src/App.tsx
import {
  SisenseContextProvider,
  ThemeProvider as SisenseThemeProvider,
} from '@sisense/sdk-ui';
import { AiContextProvider } from '@sisense/sdk-ui/ai'; // Import AiContextProvider
import {
  useTheme,
  ThemeProvider as CustomThemeProvider,
  type Theme,
} from './ThemeService';
import InteractiveCrmDashboard from './components/InteractiveCrmDashboard';
import { Folder, WidgetInstance } from './components/SidePanel';
import Header from './components/Header';
import { useState } from 'react';

const mockFolders: Folder[] = [
  { id: 'folder-1', name: 'My Saved CRM Views' },
  { id: 'folder-2', name: 'Team CRM Views' },
];

const handleSaveNewCrmDashboard = (
  folderId: string,
  name: string,
  widgets: WidgetInstance[],
  theme: Theme
) => {
  console.log({ folderId, name, theme, widgets });
  alert(`Dashboard view "${name}" was saved!`);
};

function AppContent() {
  const { theme } = useTheme();
  const [isEditable, setIsEditable] = useState(false);

  const toggleEditMode = () => {
    setIsEditable((prev) => !prev);
  };

  const sisenseTheme = {
    name: theme,
    chart: {
      textColor: theme === 'dark' ? '#E0E0E3' : '#111827',
      secondaryTextColor: theme === 'dark' ? '#9ca3af' : '#6b7280',
    },
    kpi: {
      title: {
        textColor: theme === 'dark' ? '#FFFFFF' : '#6b7280',
      },
    },
  };

  return (
    <SisenseThemeProvider theme={sisenseTheme}>
      <div className="app-root" data-theme={theme}>
        <Header
          isEditable={isEditable}
          toggleEditMode={toggleEditMode}
          onNewDashboard={() => alert('New Dashboard clicked')}
          onAddEmbed={() => alert('Add Embed clicked')}
          themeMode={theme}
          onProfileClick={() => alert('Profile clicked')}
        />
        <div className="app-body">
          <div className="content-wrapper">
            <InteractiveCrmDashboard
              isEditable={isEditable}
              folders={mockFolders}
              onSaveAs={handleSaveNewCrmDashboard}
            />
          </div>
        </div>
      </div>
    </SisenseThemeProvider>
  );
}

function App() {
  // Update to read the new environment variable names
  const sisenseUrl = import.meta.env.VITE_APP_SISENSE_URL;
  const sisenseToken = import.meta.env.VITE_APP_SISENSE_TOKEN;

  if (!sisenseUrl || !sisenseToken) {
    return (
      <div className="config-error">
        <h1>Configuration Error</h1>
        <p>
          Please set <code>VITE_APP_SISENSE_URL</code> and{' '}
          <code>VITE_APP_SISENSE_TOKEN</code> in your <code>.env.local</code>{' '}
          file.
        </p>
      </div>
    );
  }

  return (
    <SisenseContextProvider url={sisenseUrl} token={sisenseToken}>
      <CustomThemeProvider>
        {/* Add the AiContextProvider wrapper */}
        <AiContextProvider>
          <AppContent />
        </AiContextProvider>
      </CustomThemeProvider>
    </SisenseContextProvider>
  );
}

export default App;
