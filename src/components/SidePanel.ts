import { Layout } from 'react-grid-layout';

export interface Folder {
  id: string;
  name: string;
  color?: string;
}

export interface WidgetInstance {
  instanceId: string;
  id: string;
  layout: Layout;
  title?: string;
}

export interface Dashboard {
  id: string;
  name: string;
  folder_id: string;
  widgetInstances: WidgetInstance[];
  theme: 'light' | 'dark';
}
