// src/components/MemoizedDashboardWidget.tsx
import React from 'react';
import { WidgetById, WidgetByIdProps } from '@sisense/sdk-ui';

export const MemoizedDashboardWidget = React.memo(
  (props: WidgetByIdProps) => {
    return <WidgetById {...props} />;
  }
);