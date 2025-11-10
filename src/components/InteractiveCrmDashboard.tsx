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
  WidgetById,
  WidgetProps,
  WidgetByIdProps,
  ChartType,
  ChartDataOptions,
} from '@sisense/sdk-ui';
import {
  measureFactory,
  Measure,
  Dimension,
  Attribute,
  DateDimension,
} from '@sisense/sdk-data';
import Highcharts from 'highcharts';
import { useTheme } from '../ThemeService';
import { getHighchartsThemeOptions } from '../theme';
import { ActionButton, addWidgetToLayout } from './add-widget-helpers';
import { AddWidgetPopover } from './add-widget-popover';
import ContextMenu from './ContextMenu';
import ThemeToggleButton from './ThemeToggleButton';
import './InteractiveCrmDashboard.css';
import { supabase } from '../supabaseClient';
import * as DM from '../../BestCRM3'; // Using the new BestCRM3 model
import SaveDropdown from './SaveDropdown';
// import Modal from './Modal'; // No longer needed
// import SaveDashboardForm from './SaveDashboardForm'; // No longer needed
// import { Folder, WidgetInstance } from './SidePanel'; // No longer needed for this component
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from '@mui/material/styles';
import SalesByCountryInsights from './SalesByCountryInsights.tsx';

const ResponsiveGridLayout = WidthProvider(Responsive);

const getStyleOptions = (themeMode: 'light' | 'dark'): any => {
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
  | (WidgetByIdProps & { id: string });

// --- HELPER FUNCTIONS for Saving/Loading ---

const sanitizeJaqlWidgetForSerialization = (
  dataOptions: ChartDataOptions | undefined
): any => {
  if (!dataOptions) return null;

  const sanitized: any = {};

  const parseExpression = (
    expression: string | undefined
  ): { table: string; column: string } | null => {
    if (!expression) return null;
    const match = expression.match(/\[([^.]+)\.([^\]]+)\]/); // Correct regex
    if (match && match[1] && match[2]) {
      return { table: match[1], column: match[2] };
    }
    return null;
  };

  if ('category' in dataOptions && dataOptions.category) {
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

  // ----- FIX 1: ADDED THIS BLOCK TO HANDLE 'breakBy' -----
  if ('breakBy' in dataOptions && dataOptions.breakBy) {
    sanitized.breakBy = (dataOptions.breakBy as Dimension[])
      .map((dim) => {
        const parsed = parseExpression(dim.expression);
        if (parsed) {
          return { jaql: { table: parsed.table, column: parsed.column } };
        }
        return null;
      })
      .filter(Boolean);
  }
  // ----- END OF FIX 1 -----

  if ('value' in dataOptions && dataOptions.value) {
    sanitized.value = (dataOptions.value as Measure[])
      .map((measure) => {
        const sourceAttribute = (measure as any).attribute;
        const aggregationType = (measure as any).aggregation;

        if (measure && sourceAttribute && sourceAttribute.expression) {
          const parsed = parseExpression(sourceAttribute.expression);
          if (parsed) {
            return {
              agg: aggregationType,
              jaql: { table: parsed.table, column: parsed.column },
              title: (measure as any).title,
            };
          }
        }
        return null;
      })
      .filter(Boolean);
  }

  Object.keys(dataOptions).forEach((key) => {
    // ----- FIX 2: ADDED 'breakBy' TO THE LIST OF KEYS TO IGNORE -----
    if (key !== 'category' && key !== 'value' && key !== 'breakBy') {
      sanitized[key] = (dataOptions as any)[key];
    }
  });

  return sanitized;
};

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

const rehydrateJaqlWidgetFromData = (
  record: any
): WidgetProps & { id: string } => {
  const dataSource = DM.DataSource;
  const rehydratedOptions: any = {};

  if (record.jaql && record.jaql.category) {
    rehydratedOptions.category = record.jaql.category
      .map((item: any) => {
        if (!item || !item.jaql) return null; // Safety check
        const { table, column } = item.jaql;
        return findAttributeByJaql(table, column);
      })
      .filter(
        (attr: Attribute | DateDimension | null): attr is Dimension =>
          attr !== null
      );
  }

  // ----- FIX 3: ADDED THIS BLOCK TO REHYDRATE 'breakBy' -----
  if (record.jaql && record.jaql.breakBy) {
    rehydratedOptions.breakBy = record.jaql.breakBy
      .map((item: any) => {
        if (!item || !item.jaql) return null; // Safety check
        const { table, column } = item.jaql;
        return findAttributeByJaql(table, column);
      })
      .filter(
        (attr: Attribute | DateDimension | null): attr is Dimension =>
          attr !== null
      );
  }
  // ----- END OF FIX 3 -----

  if (record.jaql && record.jaql.value) {
    rehydratedOptions.value = record.jaql.value
      .map((item: any) => {
        if (!item || !item.jaql) return null; // Safety check
        const { table, column } = item.jaql;
        const attribute = findAttributeByJaql(table, column);

        if (attribute) {
          switch (item.agg) {
            case 'sum':
              return measureFactory.sum(attribute, item.title, undefined);
            case 'avg':
              return measureFactory.average(attribute, item.title, undefined);
            case 'count':
              return measureFactory.count(attribute, item.title, undefined);
            default:
              return null;
          }
        }
        return null;
      })
      .filter(
        (measure: Measure | null): measure is Measure => measure !== null
      );
  }

  if (record.jaql) {
    Object.keys(record.jaql).forEach((key) => {
      // ----- FIX 4: ADDED 'breakBy' TO THE LIST OF KEYS TO IGNORE -----
      if (key !== 'category' && key !== 'value' && key !== 'breakBy') {
        rehydratedOptions[key as keyof ChartDataOptions] = record.jaql[key];
      }
    });
  }

  return {
    id: record.widget_id,
    title: record.title,
    widgetType: 'chart',
    chartType: record.chartType as ChartType,
    dataSource: dataSource,
    dataOptions: rehydratedOptions as ChartDataOptions,
  };
};

interface InteractiveCrmDashboardProps {
  isEditable: boolean;
  // 'folders' and 'onSaveAs' props removed
}

const STATIC_WIDGET_ID = 'sales-by-country-insights-static';

const DEFAULT_STATIC_LAYOUT: Layout = {
  i: STATIC_WIDGET_ID,
  x: 0,
  y: 0,
  w: 4,
  h: 5,
};

const InteractiveCrmDashboard: FC<InteractiveCrmDashboardProps> = ({
  isEditable,
  // 'folders' and 'onSaveAs' removed from destructuring
}) => {
  const { theme, toggleTheme } = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [widgets, setWidgets] = useState<CrmWidgetType[]>([]);
  // Use a single layout state for all widgets
  const [layout, setLayout] = useState<Layout[]>([]);
  const [isLoadedFromDB, setIsLoadedFromDB] = useState(false);
  const [isSaveDropdownOpen, setIsSaveDropdownOpen] = useState(false);
  // 'isSaveModalOpen' state removed
  const saveDropdownRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    widgetId: string | null;
  }>({ visible: false, x: 0, y: 0, widgetId: null });
  const resizeTimeout = useRef<number | null>(null);
  const widgetIdRef = useRef(0);

  // Create a state for just the static AI widget's visibility
  const [showStaticWidget, setShowStaticWidget] = useState(true);

  // The layout for the grid is now just the 'layout' state
  const combinedLayouts = useMemo(
    () => ({
      lg: layout,
    }),
    [layout]
  );

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
          MuiPaper: {
            styleOverrides: {
              root: {
                ...(theme === 'dark' && {
                  backgroundImage: 'none',
                }),
              },
            },
          },
          MuiMenu: {
            styleOverrides: {
              paper: {
                ...(theme === 'dark' && {
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                }),
              },
            },
          },
          MuiMenuItem: {
            styleOverrides: {
              root: {
                ...(theme === 'dark' && {
                  color: '#F9FAFB',
                  '&:hover': {
                    backgroundColor: '#0d1117',
                  },
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
      // 1. Get records for all DYNAMIC widgets
      const widgetRecords = widgets.map((widget) => {
        const currentLayout = layout.find((l) => l.i === widget.id);

        let record: any = {
          widget_id: widget.id,
          layout: currentLayout,
          title: (widget as any).title,
        };

        if ('widgetOid' in widget) {
          record = {
            ...record,
            widgetOid: widget.widgetOid,
            dashboardOid: widget.dashboardOid,
          };
        } else if ('widgetType' in widget && widget.widgetType === 'chart') {
          record = {
            ...record,
            jaql: sanitizeJaqlWidgetForSerialization(
              widget.dataOptions as ChartDataOptions
            ),
            dataSourceTitle:
              typeof widget.dataSource === 'object'
                ? widget.dataSource.title
                : widget.dataSource,
            chartType: widget.chartType,
          };
        }
        return record;
      });

      // 2. Create a record for our STATIC AI widget (if it's visible)
      const aiWidgetLayout = layout.find((l) => l.i === STATIC_WIDGET_ID);
      let aiWidgetRecord = null;
      if (showStaticWidget && aiWidgetLayout) {
        aiWidgetRecord = {
          widget_id: STATIC_WIDGET_ID,
          layout: aiWidgetLayout,
          title: 'Sales by Country',
        };
      }

      // 3. Combine all records
      const allRecords = [...widgetRecords];
      if (aiWidgetRecord) {
        allRecords.push(aiWidgetRecord);
      }

      // 4. Clear old records and insert all current ones
      await supabase.from('crm_widgets').delete().not('widget_id', 'is', null);
      const { error } = await supabase.from('crm_widgets').insert(allRecords);

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

  // 'handleSaveAs' function removed
  // 'handleSaveAsFormSubmit' function removed

  useEffect(() => {
    const loadDashboardState = async () => {
      const { data, error } = await supabase.from('crm_widgets').select('*');

      if (error) {
        console.error('Supabase load from crm_widgets failed:', error);
        setIsLoadedFromDB(true);
        return;
      }

      if (data && data.length > 0) {
        const loadedDynamicWidgets: CrmWidgetType[] = [];
        const loadedLayout: Layout[] = [];
        let foundStatic = false;

        data.forEach((record: any) => {
          try {
            // Identify the AI widget by its widget_id
            if (record.widget_id === STATIC_WIDGET_ID) {
              if (record.layout) {
                loadedLayout.push(record.layout);
                foundStatic = true;
              }
            } else if (record.widgetOid && record.dashboardOid) {
              loadedDynamicWidgets.push({
                id: record.widget_id,
                title: record.title,
                widgetOid: record.widgetOid,
                dashboardOid: record.dashboardOid,
              });
              if (record.layout) {
                loadedLayout.push(record.layout);
              }
            } else if (record.jaql) {
              loadedDynamicWidgets.push(
                rehydrateJaqlWidgetFromData(record) as CrmWidgetType
              );
              if (record.layout) {
                loadedLayout.push(record.layout);
              }
            }
          } catch (e) {
            console.error('Failed to load widget record:', record, e);
          }
        });

        setWidgets(loadedDynamicWidgets);

        // If the static widget wasn't found in the DB (e.g., first load),
        // add it now with its default layout so it appears.
        if (!foundStatic) {
          setShowStaticWidget(true);
          loadedLayout.push(DEFAULT_STATIC_LAYOUT);
        } else {
          setShowStaticWidget(true);
        }

        setLayout(loadedLayout);
      } else {
        // No data in DB. Show default.
        setWidgets([]);
        setLayout([DEFAULT_STATIC_LAYOUT]);
        setShowStaticWidget(true);
      }
      setIsLoadedFromDB(true);
    };

    if (!isLoadedFromDB) {
      loadDashboardState();
    }
  }, [isLoadedFromDB]);

  const onBeforeRender = useCallback(
    (options: any) => {
      const themeOptions = getHighchartsThemeOptions(theme);
      let finalOptions = Highcharts.merge(options, themeOptions);

      const title = options.title?.text || '';
      if (title.includes('Sales Revenue over Time')) {
        if (Array.isArray(finalOptions.series)) {
          finalOptions.series.forEach((series: any) => {
            if (series.name && series.name.toLowerCase().includes('$trend_')) {
              series.color = '#FF8A8A'; // A nice red color
              if (series.marker) {
                series.marker.lineColor = '#FF8A8A';
              }
            }
          });
        }
      }

      return finalOptions;
    },
    [theme]
  );

  // onLayoutChange now just updates the single layout state
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
    const newId = `widget-${widgetIdRef.current++}`;
    const widgetWithTitleAndId = {
      ...newWidget,
      id: newId,
      title: (newWidget as any).title ?? 'Untitled Widget',
    } as CrmWidgetType;

    setWidgets((prev) => [...prev, widgetWithTitleAndId]);
    setLayout(
      (prev) =>
        addWidgetToLayout(widgetWithTitleAndId as any, { layout: prev }).layout || prev
    );
  };

  const removeWidget = (widgetId: string) => {
    // Check if it's the static widget
    if (widgetId === STATIC_WIDGET_ID) {
      setShowStaticWidget(false);
    } else {
      // It's a dynamic widget
      setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
    }
    // In both cases, update the single layout state
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
                  onSaveAs={undefined} // 'onSaveAs' prop removed
                  isSaveDisabled={false}
                />
              )}
            </div>
            <ActionButton
              caption={'Create New Widget'}
              handleClick={(event: React.MouseEvent<HTMLElement>) =>
                setAnchorEl(event.currentTarget)
              }
            />
            <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
          </div>
        </div>
        <div className="layout-wrapper" key={theme}>
          <ResponsiveGridLayout
            className={`layout ${isEditable ? 'is-editable' : ''}`}
            layouts={combinedLayouts} // Use combined layouts
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
            {/*
              Render the static AI widget only if it should be visible.
            */}
            {showStaticWidget && (
              <div
                key={STATIC_WIDGET_ID}
                className="widget-container"
                onContextMenu={(e) => handleContextMenu(e, STATIC_WIDGET_ID)}
              >
                <SalesByCountryInsights />
              </div>
            )}

            {/* This is your existing loop for dynamic widgets from Supabase */}
            {widgets.map((widget) => {
              const isChartWidget = 'widgetType' in widget && widget.widgetType === 'chart';
              return (
                <div
                  key={widget.id}
                  className={`widget-container ${
                    isEditable ? 'is-editable' : ''
                  }`}
                  onContextMenu={(e) => handleContextMenu(e, widget.id)}
                >
                  {'widgetOid' in widget ? (
                    <WidgetById
                      {...(widget as WidgetByIdProps)}
                      styleOptions={getStyleOptions(theme)}
                      {...(isChartWidget && { onBeforeRender })}
                    />
                  ) : (
                    <Widget
                      {...(widget as WidgetProps)}
                      styleOptions={getStyleOptions(theme)}
                      {...(isChartWidget && { onBeforeRender })}
                    />
                  )}
                </div>
              );
            })}
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
        {/* 'Save As' Modal and SaveDashboardForm removed */}
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
              if (!contextMenu.widgetId) {
                closeContextMenu();
                return;
              }

              // Call the unified removeWidget function
              removeWidget(contextMenu.widgetId);
              closeContextMenu();
            }}
          />
        )}
      </div>
    </MuiThemeProvider>
  );
};

// Wrap the export in React.memo to prevent laggy theme changes
export default React.memo(InteractiveCrmDashboard);