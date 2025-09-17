// src/components/MemoizedDashboardWidget.tsx
import React from 'react';
import { DashboardWidget, DashboardWidgetProps } from '@sisense/sdk-ui';

export const MemoizedDashboardWidget = React.memo(
  (props: DashboardWidgetProps) => {
    return <DashboardWidget {...props} />;
  }
);
