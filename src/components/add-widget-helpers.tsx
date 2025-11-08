import {
  DataOptions,
  DataSource,
  WidgetProps,
  ChartType,
} from '@sisense/sdk-ui';
import { Layout } from 'react-grid-layout';
import { v4 as uuidv4 } from 'uuid';

// NEW: The missing buildWidget function.
/**
 * Creates a new widget configuration object.
 * @param dataSource The data source for the widget.
 * @param dataOptions The data options for the widget.
 * @param chartType The type of chart to display.
 * @param title The title of the widget.
 * @returns A WidgetProps object.
 */
export const buildWidget = (
  dataSource: DataSource,
  dataOptions: DataOptions,
  chartType: ChartType,
  title: string
): WidgetProps => {
  return {
    id: uuidv4(),
    widgetType: 'chart',
    chartType: chartType,
    title: title,
    dataSource: dataSource,
    dataOptions: dataOptions,
  };
};

// --- Keep the existing functions below ---

export const ActionButton: React.FC<{
  caption: string;
  handleClick: React.MouseEventHandler<HTMLButtonElement>;
}> = ({ caption, handleClick }) => {
  return (
    <button className="action-button" onClick={handleClick}>
      {caption}
    </button>
  );
};

export const addWidgetToLayout = (
  newWidget: WidgetProps,
  layoutOptions?: { layout?: Layout[] }
): { layout: Layout[] } => {
  const newLayoutItem: Layout = {
    i: newWidget.id,
    x: 0,
    y: Infinity, // This will cause the new widget to be placed at the bottom
    w: 6,
    h: 8,
  };

  const existingLayout = layoutOptions?.layout || [];

  return {
    layout: [...existingLayout, newLayoutItem],
  };
};
