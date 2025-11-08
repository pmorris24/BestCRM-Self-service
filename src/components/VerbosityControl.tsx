import { Button, FormControl, Radio, RadioGroup } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import React from 'react';
import './VerbosityControl.css';

export type NlgControlOptions = {
  verbosity: 'Low' | 'High';
};

export type NlgControlProps = {
  options: NlgControlOptions;
  setOptions: React.Dispatch<React.SetStateAction<NlgControlOptions>>;
  refetch?: () => void;
  children: React.ReactNode;
};

const VerbosityControl = ({
  options,
  setOptions,
  refetch,
  children,
}: NlgControlProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOptions({ verbosity: event.target.value as 'Low' | 'High' });
    // Optional: Auto-refetch on change (uncomment if desired)
    // if (refetch) refetch();
  };

  return (
    <>
      <FormGroup
        row={true}
        sx={{ mb: 2 }}
        className="nlg-controls-wrapper"
      >
        <FormControl size="small">
          <FormControlLabel
            labelPlacement="start"
            label="Verbosity:"
            control={
              <RadioGroup
                row
                value={options.verbosity}
                sx={{ mx: 2 }}
                onChange={handleChange}
              >
                <FormControlLabel
                  value={'Low'}
                  control={<Radio color="primary" size="small" />}
                  label="Low"
                />
                <FormControlLabel
                  value={'High'}
                  control={<Radio color="primary" size="small" />}
                  label="High"
                />
              </RadioGroup>
            }
          />
        </FormControl>
        <Button variant="contained" onClick={refetch} size="small">
          Regenerate
        </Button>
      </FormGroup>
      <div className="nlg-insights-panel">{children}</div>
    </>
  );
};

export default VerbosityControl;