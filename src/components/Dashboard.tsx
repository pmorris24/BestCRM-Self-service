import React, 'react';
import { Responsive, WidthProvider, type Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './Dashboard.css'; // You'll need to create this CSS file for styling

const ResponsiveGridLayout = WidthProvider(Responsive);

// A simple widget component for demonstration
const Widget = ({ item }: { item: { i: string; content: string } }) => {
  return (
    <div className="widget">
      <div className="widget-header">{`Widget ${item.i}`}</div>
      <div className="widget-content">{item.content}</div>
    </div>
  );
};

const Dashboard = () => {
  const [isEditable, setIsEditable] = React.useState(true);
  const [dashboardName, setDashboardName] = React.useState('My New Dashboard');
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [editingTitleValue, setEditingTitleValue] = React.useState(dashboardName);

  const [widgetInstances, setWidgetInstances] = React.useState([
    { i: 'a', x: 0, y: 0, w: 4, h: 2, content: 'Welcome to your new dashboard!' },
    { i: 'b', x: 4, y: 0, w: 4, h: 2, content: 'This is a sample widget.' },
    { i: 'c', x: 8, y: 0, w: 4, h: 2, content: 'You can drag and resize me.' },
  ]);

  const layouts = {
    lg: widgetInstances.map(({ i, x, y, w, h }) => ({ i, x, y, w, h })),
  };

  const onLayoutChange = (newLayout: Layout[]) => {
    // A simple way to update layout without a full map lookup
    setWidgetInstances((prev) =>
      prev.map((widget) => {
        const layoutItem = newLayout.find((item) => item.i === widget.i);
        return layoutItem ? { ...widget, ...layoutItem } : widget;
      })
    );
  };

  const addWidget = () => {
    const newWidget = {
      i: `widget-${Date.now()}`,
      x: (widgetInstances.length * 4) % 12,
      y: Infinity, // Automatically places it at the bottom
      w: 4,
      h: 2,
      content: 'A newly added widget.',
    };
    setWidgetInstances((prev) => [...prev, newWidget]);
  };

  const handleSaveTitle = () => {
    if (editingTitleValue.trim()) {
      setDashboardName(editingTitleValue.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="dashboard-container">
      {/* ================= TOOLBAR ================= */}
      <div className="dashboard-toolbar">
        <div className="toolbar-left">
          {isEditingTitle ? (
            <input
              type="text"
              value={editingTitleValue}
              onChange={(e) => setEditingTitleValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
              onBlur={handleSaveTitle}
              autoFocus
              className="dashboard-title-input"
            />
          ) : (
            <h1
              className="dashboard-title"
              onDoubleClick={() => {
                if (isEditable) setIsEditingTitle(true);
              }}
            >
              {dashboardName}
            </h1>
          )}
        </div>
        <div className="toolbar-right">
          <button className="action-button" onClick={addWidget}>
            + Add Widget
          </button>
          <button
            className={`action-button ${isEditable ? 'primary' : ''}`}
            onClick={() => setIsEditable((prev) => !prev)}
          >
            {isEditable ? 'Lock Layout' : 'Unlock Layout'}
          </button>
        </div>
      </div>

      {/* ================= GRID ================= */}
      <div className="layout-wrapper">
        <ResponsiveGridLayout
          className={`layout ${isEditable ? 'is-editable' : ''}`}
          layouts={layouts}
          onLayoutChange={onLayoutChange}
          isDraggable={isEditable}
          isResizable={isEditable}
          margin={[15, 15]}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          compactType="vertical"
        >
          {widgetInstances.map((item) => (
            <div key={item.i}>
              <Widget item={item} />
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
};

export default Dashboard;