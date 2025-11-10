import { useGetNlgInsights } from '@sisense/sdk-ui/ai';
import * as DM from '../../BestCRM';
import { measureFactory } from '@sisense/sdk-data';
import { LoadingIndicator } from '@sisense/sdk-ui';
import { useState, useEffect } from 'react';
import StyledTextPanel from './StyledTextPanel';  // Default import
import VerbosityControl, {
  NlgControlOptions,
} from './VerbosityControl';  // Default + type import
import './SalesByCountryInsights.css';

const SalesByCountryInsights = () => {
  const [options, setOptions] = useState<NlgControlOptions>({
    verbosity: 'Low',
  });

  const { data, isLoading, refetch } = useGetNlgInsights({
    dataSource: DM.DataSource,
    dimensions: [
      DM.Countries.Country, // Changed to get insights by Country
    ],
    measures: [
      measureFactory.sum(
        DM.Opportunities.Value, // Changed to measure Sales (Value)
        'Total Sales', // Added a title for clarity
        undefined // Added to satisfy new function signature
      ),
    ],
    verbosity: options.verbosity,
  });

  // Optional: Auto-refetch on verbosity change
  useEffect(() => {
    refetch();
  }, [options.verbosity, refetch]);

  return (
    <>
      <div className="nlg-widget-header">Sales by Country</div>
      <div className="nlg-widget-content">
        <VerbosityControl
          options={options}
          setOptions={setOptions}
          refetch={refetch}
        >
          {isLoading && <LoadingIndicator />}
          {data && <StyledTextPanel data={data} />}
        </VerbosityControl>
      </div>
    </>
  );
};

export default SalesByCountryInsights;