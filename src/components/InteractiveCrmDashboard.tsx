import React, {
  useState,
  useCallback,
  useEffect,
  FC,
  useRef,
  useMemo,
} from 'react';
import { Responsive, WidthProvider, type Layout } from 'react-grid-layout';
import {
  Widget,
  DashboardWidget,
  WidgetProps,
  DashboardWidgetProps,
  DataOptions,
  ChartType,
  Measure,
  Dimension,
  Attribute,
  DateDimension,
  DashboardWidgetStyleOptions,
} from '@sisense/sdk-ui';
import { measureFactory } from '@sisense/sdk-data';
import Highcharts from 'highcharts';
import { useTheme } from '../ThemeService';
import { getHighchartsThemeOptions } from '../theme';
import { ActionButton, addWidgetToLayout } from './add-widget-helpers';
import { AddWidgetPopover } from './add-widget-popover';
import ContextMenu from './ContextMenu';
import ThemeToggleButton from './ThemeToggleButton';
import './InteractiveCrmDashboard.css';
import { supabase } from '../supabaseClient';
import * as DM from '../../BestCRM';
import SaveDropdown from './SaveDropdown';
import Modal from './Modal';
import SaveDashboardForm from './SaveDashboardForm';
import { Folder, WidgetInstance } from './SidePanel';
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from '@mui/material/styles';

const ResponsiveGridLayout = WidthProvider(Responsive);

const getStyleOptions = (
  themeMode: 'light' | 'dark'
): DashboardWidgetStyleOptions => {
  const isDarkMode = themeMode === 'dark';
  return {
    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
    border: false,
    shadow: 'None',
    header: {
      backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
      titleTextColor: isDarkMode ? '#FFFFFF' : '#111827',
      dividerLine: true,
      dividerLineColor: isDarkMode ? 'transparent' : '#E5E7EB',
    },
  };
};

// A union type to represent both kinds of widgets our dashboard can render
type CrmWidgetType =
  | (WidgetProps & { id: string })
  | (DashboardWidgetProps & { id: string });

// --- HELPER FUNCTIONS for Saving/Loading ---

// Sanitizes JAQL-based widgets for clean JSON storage
const sanitizeJaqlWidgetForSerialization = (
  dataOptions: DataOptions | undefined
): any => {
  if (!dataOptions) return null;

  const sanitized: any = {};

  const parseExpression = (
    expression: string | undefined
  ): { table: string; column: string } | null => {
    if (!expression) return null;
    const match = expression.match(/\[(.*)\.(.*)\]/);
    if (match && match[1] && match[2]) {
      return { table: match[1], column: match[2] };
    }
    return null;
  };

  if (dataOptions.category) {
    sanitized.category = (dataOptions.category as Dimension[])
      .map((dim) => {
        const parsed = parseExpression(dim.expression);
        if (parsed) {
          return { jaql: { table: parsed.table, column: parsed.column } };
        }
        return null;
      })
      .filter(Boolean);
  }

  if (dataOptions.value) {
    sanitized.value = (dataOptions.value as Measure[])
      .map((measure) => {
        const sourceAttribute = (measure as any).attribute;
        const aggregationType = (measure as any).aggregation || measure.agg;

        if (measure && sourceAttribute && sourceAttribute.expression) {
          const parsed = parseExpression(sourceAttribute.expression);
          if (parsed) {
            return {
              agg: aggregationType,
              jaql: { table: parsed.table, column: parsed.column },
            };
          }
        }
        return null;
      })
      .filter(Boolean);
  }

  Object.keys(dataOptions).forEach((key) => {
    if (key !== 'category' && key !== 'value') {
      sanitized[key] = dataOptions[key as keyof DataOptions];
    }
  });

  return sanitized;
};

// A list of all exported dimensions from the data model to search through
const allDimensions = [
  DM.AccountExecutives,
  DM.Accounts,
  DM.Countries,
  DM.Industries,
  DM.Managers,
  DM.Opportunities,
  DM.Outreaches,
  DM.Status,
];

// A robust helper to find the correct data model attribute object
const findAttributeByJaql = (
  tableName: string,
  columnName: string
): Attribute | DateDimension | null => {
  const dimension = allDimensions.find((d) => d.name === tableName);
  if (!dimension) {
    console.warn(`Could not find dimension for table: ${tableName}`);
    return null;
  }

  for (const key in dimension) {
    const attribute = (dimension as any)[key];
    if (
      attribute &&
      typeof attribute === 'object' &&
      attribute.name === columnName
    ) {
      return attribute;
    }
  }

  console.warn(
    `Could not find attribute "${columnName}" in table "${tableName}"`
  );
  return null;
};

// Rehydrates a JAQL-based widget from the clean JSON stored in Supabase
const rehydrateJaqlWidgetFromData = (record: any): WidgetProps => {
  const dataSource = DM.DataSource;
  const rehydratedOptions: DataOptions = {};

  if (record.jaql && record.jaql.category) {
    rehydratedOptions.category = record.jaql.category
      .map((item: any) => {
        const { table, column } = item.jaql;
        return findAttributeByJaql(table, column);
      })
      .filter((attr): attr is Dimension => attr !== null);
  }

  if (record.jaql && record.jaql.value) {
    rehydratedOptions.value = record.jaql.value
      .map((item: any) => {
        const { table, column } = item.jaql;
        const attribute = findAttributeByJaql(table, column);

        if (attribute) {
          const aggFunction =
            measureFactory[item.agg as keyof typeof measureFactory];
          if (aggFunction) {
            return aggFunction(attribute);
          }
        }
        return null;
      })
      .filter((measure): measure is Measure => measure !== null);
  }

  if (record.jaql) {
    Object.keys(record.jaql).forEach((key) => {
      if (key !== 'category' && key !== 'value') {
        rehydratedOptions[key as keyof DataOptions] = record.jaql[key];
      }
    });
  }

  return {
    id: record.widget_id,
    title: record.title,
    widgetType: 'chart',
    chartType: record.chartType as ChartType,
    dataSource: dataSource,
    dataOptions: rehydratedOptions,
  };
};

interface InteractiveCrmDashboardProps {
  isEditable: boolean;
  folders: Folder[];
  onSaveAs: (
    folderId: string,
    name: string,
    widgets: WidgetInstance[],
    theme: 'light' | 'dark'
  ) => void;
}

const InteractiveCrmDashboard: FC<InteractiveCrmDashboardProps> = ({
  isEditable,
  folders,
  onSaveAs,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [widgets, setWidgets] = useState<CrmWidgetType[]>([]);
  const [layout, setLayout] = useState<Layout[]>([]);
  const [isLoadedFromDB, setIsLoadedFromDB] = useState(false);
  const [isSaveDropdownOpen, setIsSaveDropdownOpen] = useState(false);
  const [isSaveModalOpen, setSaveModalOpen] = useState(false);
  const saveDropdownRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    widgetId: string | null;
  }>({ visible: false, x: 0, y: 0, widgetId: null });
  const resizeTimeout = useRef<number | null>(null);

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: theme,
          ...(theme === 'dark' && {
            background: {
              paper: '#2d3748',
              default: '#1a202c',
            },
            text: {
              primary: '#f9fafb',
              secondary: '#a0aec0',
            },
            action: {
              active: '#63b3ed',
              hover: 'rgba(99, 179, 237, 0.08)',
              selected: 'rgba(99, 179, 237, 0.16)',
            },
            divider: '#4a5568',
          }),
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                ...(theme === 'dark' && {
                  '&.MuiButton-outlined': {
                    color: '#a0aec0',
                    borderColor: '#4a5568',
                    backgroundColor: 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(99, 179, 237, 0.08)',
                      borderColor: '#63b3ed',
                    },
                  },
                }),
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                ...(theme === 'dark' && {
                  backgroundImage: 'none',
                }),
              },
            },
          },
        },
      }),
    [theme]
  );

  const performSave = async () => {
    try {
      const widgetRecords = widgets.map((widget) => {
        const currentLayout = layout.find((l) => l.i === widget.id);

        let record: any = {
          widget_id: widget.id,
          title: widget.title,
          layout: currentLayout,
        };

        if ('widgetOid' in widget) {
          record = {
            ...record,
            widgetOid: widget.widgetOid,
            dashboardOid: widget.dashboardOid,
          };
        } else {
          record = {
            ...record,
            jaql: sanitizeJaqlWidgetForSerialization(widget.dataOptions),
            dataSourceTitle: widget.dataSource?.title,
            chartType: widget.chartType,
          };
        }
        return record;
      });

      await supabase.from('crm_widgets').delete().not('widget_id', 'is', null);
      const { error } = await supabase
        .from('crm_widgets')
        .insert(widgetRecords);

      if (error) {
        console.error('Supabase save to crm_widgets failed:', error);
      } else {
        console.log('CRM Dashboard saved successfully.');
      }
    } catch (e) {
      console.error('Error during dashboard serialization:', e);
    }
  };

  const handleSave = () => {
    performSave();
    setIsSaveDropdownOpen(false);
  };

  const handleSaveAs = () => {
    setSaveModalOpen(true);
    setIsSaveDropdownOpen(false);
  };

  const handleSaveAsFormSubmit = (folderId: string, name: string) => {
    if (!widgets) return;

    const crmWidgetInstances: WidgetInstance[] = widgets.map((widget) => {
      const currentLayout = layout.find((l) => l.i === widget.id);
      return {
        instanceId: widget.id,
        id: 'crm-special-widget',
        layout: currentLayout || { i: widget.id, x: 0, y: 0, w: 6, h: 8 },
        title: widget.title,
        crmWidgetProps: widget,
      } as any;
    });

    onSaveAs(folderId, name, crmWidgetInstances, theme);
    setSaveModalOpen(false);
  };

  useEffect(() => {
    const loadDashboardState = async () => {
      const { data, error } = await supabase.from('crm_widgets').select('*');

      if (error) {
        console.error('Supabase load from crm_widgets failed:', error);
        setIsLoadedFromDB(true);
        return;
      }

      if (data && data.length > 0) {
        const loadedWidgets: CrmWidgetType[] = data
          .map((record: any) => {
            if (record.widgetOid && record.dashboardOid) {
              return {
                id: record.widget_id,
                title: record.title,
                widgetOid: record.widgetOid,
                dashboardOid: record.dashboardOid,
              };
            } else if (record.jaql) {
              return rehydrateJaqlWidgetFromData(record);
            }
            return null;
          })
          .filter((w): w is CrmWidgetType => w !== null);

        const loadedLayout = data
          .map((record: any) => record.layout)
          .filter(Boolean);
        setWidgets(loadedWidgets);
        setLayout(loadedLayout);
      }
      setIsLoadedFromDB(true);
    };

    if (!isLoadedFromDB) {
      loadDashboardState();
    }
  }, [isLoadedFromDB]);

  const onBeforeRender = useCallback(
    (options: Highcharts.Options) => {
      const themeOptions = getHighchartsThemeOptions(theme);
      return Highcharts.merge(options, themeOptions);
    },
    [theme]
  );

  const onLayoutChange = (newLayout: Layout[]) => {
    setLayout(newLayout);
  };

  const onResize = useCallback(() => {
    if (resizeTimeout.current) {
      cancelAnimationFrame(resizeTimeout.current);
    }
    resizeTimeout.current = requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
    });
  }, []);

  useEffect(() => {
    return () => {
      if (resizeTimeout.current) {
        cancelAnimationFrame(resizeTimeout.current);
      }
    };
  }, []);

  const addWidget = (newWidget: WidgetProps) => {
    setWidgets((prev) => [...prev, newWidget]);
    setLayout(
      (prev) => addWidgetToLayout(newWidget, { layout: prev }).layout || prev
    );
  };

  const removeWidget = (widgetId: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
    setLayout((prev) => prev.filter((l) => l.i !== widgetId));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        saveDropdownRef.current &&
        !saveDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSaveDropdownOpen(false);
      }
    };
    if (isSaveDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSaveDropdownOpen]);

  const handleContextMenu = (event: React.MouseEvent, widgetId: string) => {
    event.preventDefault();
    if (!isEditable) return;
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      widgetId,
    });
  };

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    if (contextMenu.visible) {
      window.addEventListener('click', closeContextMenu);
      return () => window.removeEventListener('click', closeContextMenu);
    }
  }, [contextMenu.visible, closeContextMenu]);

  if (!isLoadedFromDB) {
    return <div className="loading-indicator">Loading CRM Dashboard...</div>;
  }

  return (
    <MuiThemeProvider theme={muiTheme}>
      <div className="dashboard-content">
        <div className="dashboard-toolbar">
          <div className="toolbar-left">
            <h1 className="dashboard-title">Best CRM: Self Service</h1>
          </div>
          <div className="toolbar-right">
            <div
              className="save-button-container"
              ref={saveDropdownRef}
              style={{ position: 'relative' }}
            >
              <button
                className="action-button"
                onClick={() => setIsSaveDropdownOpen((prev) => !prev)}
              >
                Save View
              </button>
              {isSaveDropdownOpen && (
                <SaveDropdown
                  onSave={handleSave}
                  onSaveAs={handleSaveAs}
                  isSaveDisabled={false}
                />
              )}
            </div>
            <ActionButton
              caption={'Create New Widget'}
              handleClick={(event) => setAnchorEl(event.currentTarget)}
            />
            <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
          </div>
        </div>
        <div className="layout-wrapper" key={theme}>
          <ResponsiveGridLayout
            className={`layout ${isEditable ? 'is-editable' : ''}`}
            layouts={{ lg: layout }}
            onLayoutChange={onLayoutChange}
            onResize={onResize}
            isDraggable={isEditable}
            isResizable={isEditable}
            margin={[10, 10]}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 2 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={30}
            compactType="vertical"
          >
            {widgets.map((widget) => (
              <div
                key={widget.id}
                className={`widget-container ${
                  isEditable ? 'is-editable' : ''
                }`}
                onContextMenu={(e) => handleContextMenu(e, widget.id)}
              >
                {'widgetOid' in widget ? (
                  <DashboardWidget
                    {...(widget as DashboardWidgetProps)}
                    styleOptions={getStyleOptions(theme)}
                    onBeforeRender={onBeforeRender}
                  />
                ) : (
                  <Widget
                    {...(widget as WidgetProps)}
                    styleOptions={getStyleOptions(theme)}
                    onBeforeRender={onBeforeRender}
                  />
                )}
              </div>
            ))}
          </ResponsiveGridLayout>
        </div>
        <AddWidgetPopover
          sourceEl={anchorEl}
          title={'Add Widget'}
          onAddChart={addWidget}
          isOpen={!!anchorEl}
          onClose={() => setAnchorEl(null)}
          onBeforeRender={onBeforeRender}
        />
        {isSaveModalOpen && (
          <Modal
            onClose={() => setSaveModalOpen(false)}
            title="Save Dashboard As"
          >
            <SaveDashboardForm
              folders={folders}
              onSave={handleSaveAsFormSubmit}
            />
          </Modal>
        )}
        {contextMenu.visible && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            widgetId={contextMenu.widgetId}
            isChart={false}
            onEdit={() => {
              closeContextMenu();
            }}
            onEditColors={() => {
              closeContextMenu();
            }}
            onRemove={() => {
              if (contextMenu.widgetId) {
                removeWidget(contextMenu.widgetId);
              }
              closeContextMenu();
            }}
          />
        )}
      </div>
    </MuiThemeProvider>
  );
};

export default InteractiveCrmDashboard;
