import { WidgetProps } from '@sisense/sdk-ui';
import { measureFactory, attributeFactory } from '@sisense/sdk-data';
import * as DM from 'BestCRM'; // Import your Data Model definitions

// Type for the data as it's stored in and retrieved from Supabase
export type SerializedWidget = Omit<WidgetProps, 'dataOptions'> & {
  dataOptions: string; // Stored as a JSON string
};

// A map to easily find any dimension or measure in your data model
const allDataModelObjects = new Map<string, any>();

// This block populates the map by looping through everything you exported
// from BestCRM.ts and storing it for quick lookup by its name.
// This is the magic that connects the plain text from the database
// back to the actual Sisense objects.
Object.values(DM).forEach((model: any) => {
  if (model && typeof model === 'object') {
    Object.values(model).forEach((item: any) => {
      // We check for 'jaql' because it's a unique property of Sisense data model objects
      if (item && item.jaql) {
        const key = item.jaql.title || item.jaql.dim;
        if (key) {
          allDataModelObjects.set(key, item);
        }
      }
    });
  }
});

// This function rebuilds a single piece of a widget's data configuration
const rehydrateItem = (item: any) => {
  if (!item || !item.jaql) return null; // Safety check

  const key = item.jaql.title || item.jaql.dim;
  const foundItem = allDataModelObjects.get(key);

  // Case 1: The item is a simple dimension/attribute from your data model
  if (foundItem && !item.jaql.agg) {
    return foundItem;
  }

  // Case 2: The item is a measure with an aggregation (like SUM, AVG)
  if (item.jaql.agg) {
    // We still need the base item to know what we are aggregating
    const baseItemKey = item.jaql.dim;
    const baseItem = allDataModelObjects.get(baseItemKey);
    if (!baseItem) return null; // Couldn't find what to aggregate

    // Use the measureFactory to rebuild the exact same aggregation
    switch (item.jaql.agg) {
      case 'sum':
        return measureFactory.sum(baseItem, item.title);
      case 'avg':
        return measureFactory.average(baseItem, item.title);
      case 'count':
        return measureFactory.count(baseItem, item.title);
      // Add other aggregations here if you use them in the popover
      default:
        return null;
    }
  }

  // Fallback for anything else (shouldn't be common)
  return attributeFactory(item.jaql);
};

// This is the main function you'll call from your dashboard component.
// It takes the entire serialized widget from Supabase and returns a fully functional one.
export const rehydrateWidget = (
  serializedWidget: SerializedWidget
): WidgetProps => {
  // 1. Parse the JSON string from Supabase back into a plain object
  const parsedDataOptions = JSON.parse(serializedWidget.dataOptions);

  // 2. Rebuild the category, value, and breakBy arrays by calling rehydrateItem on each element
  const rehydratedDataOptions = {
    category: (parsedDataOptions.category || [])
      .map(rehydrateItem)
      .filter(Boolean),
    value: (parsedDataOptions.value || []).map(rehydrateItem).filter(Boolean),
    breakBy: (parsedDataOptions.breakBy || [])
      .map(rehydrateItem)
      .filter(Boolean),
  };

  // 3. Return the complete, live widget object
  return {
    ...serializedWidget,
    dataOptions: rehydratedDataOptions,
  };
};
