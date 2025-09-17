import { useState, useEffect } from 'react';
import Popover from '@mui/material/Popover';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import {
  Chart,
  ChartDataOptions,
  ChartType,
  WidgetProps,
} from '@sisense/sdk-ui';
import { measureFactory, Attribute } from '@sisense/sdk-data';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import * as DM from '../../BestCRM';

type PopoverProps = {
  sourceEl: HTMLElement | null;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onAddChart: (widget: WidgetProps) => void;
  onBeforeRender?: (options: any) => any;
};

const getAttributeByName = (name: string): Attribute => {
  const attributeMap: { [key: string]: Attribute } = {
    Industry: DM.Industries.Industry,
    Country: DM.Countries.Country,
    AccountExecutive: DM.AccountExecutives.AccountExecutive,
    Status: DM.Status.Status,
  };
  return attributeMap[name];
};

export const AddWidgetPopover = ({
  sourceEl,
  title = '',
  isOpen,
  onClose,
  onAddChart,
  onBeforeRender,
}: PopoverProps) => {
  const CHART_TYPES = ['pie', 'line', 'area', 'bar', 'column'] as ChartType[];
  const [selectedChartType, setSelectedChartType] = useState<ChartType>('bar');
  const [category, setCategory] = useState('Industry');
  const [breakBy, setBreakBy] = useState('None');
  const [value, setValue] = useState('Revenue');
  const [aggregation, setAggregation] = useState('sum');
  const [widgetTitle, setWidgetTitle] = useState('');

  const allDimensions = [
    { value: 'Industry', label: 'Industry' },
    { value: 'Country', label: 'Country' },
    { value: 'AccountExecutive', label: 'Account Executive' },
    { value: 'Status', label: 'Status' },
    { value: 'CloseDate', label: 'Close Date' },
  ];

  const lowCardinalityDimensions = [
    { value: 'Industry', label: 'Industry' },
    { value: 'Country', label: 'Country' },
    { value: 'Status', label: 'Status' },
  ];

  useEffect(() => {
    if (category === 'CloseDate') {
      setSelectedChartType('line');
      setBreakBy('None');
    } else {
      setSelectedChartType('bar');
    }
  }, [category]);

  useEffect(() => {
    const measureText =
      value === 'Opportunities' ? '# of Opportunities' : 'Revenue';
    const aggText = value === 'Revenue' ? `${aggregation} of ` : '';

    const categoryDetails = allDimensions.find((d) => d.value === category);
    const breakByDetails = allDimensions.find((d) => d.value === breakBy);

    let titleParts = [`${aggText}${measureText}`];
    if (categoryDetails) {
      titleParts.push(`by ${categoryDetails.label}`);
    }
    if (breakByDetails && breakBy !== 'None') {
      titleParts.push(`and broken down by ${breakByDetails.label}`);
    }

    setWidgetTitle(titleParts.join(' '));
  }, [category, breakBy, value, aggregation]);

  useEffect(() => {
    if (isOpen) {
      setCategory('Industry');
      setBreakBy('None');
      setValue('Revenue');
      setAggregation('sum');
    }
  }, [isOpen]);

  const close = () => onClose();
  const handleAddChartClick = () => {
    onAddChart(getWidget());
    close();
  };

  const getDataOptions: () => ChartDataOptions = () => {
    const measure =
      value === 'Revenue'
        ? aggregation === 'average'
          ? measureFactory.average(DM.Opportunities.Value, 'Avg Revenue')
          : measureFactory.sum(DM.Opportunities.Value, 'Total Revenue')
        : measureFactory.count(
            DM.Opportunities.OpportunityId,
            '# of Opportunities'
          );

    const primaryDimension =
      category === 'CloseDate'
        ? DM.Opportunities.CloseDate.Months
        : getAttributeByName(category);
    const secondaryDimension =
      breakBy === 'None' || selectedChartType === 'pie'
        ? []
        : [getAttributeByName(breakBy)];

    return {
      category: [primaryDimension],
      value: [measure],
      breakBy: secondaryDimension,
    };
  };

  const getWidget = () => ({
    id: crypto.randomUUID(),
    widgetType: 'chart' as const,
    chartType: selectedChartType,
    title: widgetTitle,
    dataSource: DM.DataSource,
    dataOptions: getDataOptions(),
  });

  return (
    <Popover
      id={'chart-popover'}
      open={isOpen}
      anchorEl={sourceEl}
      onClose={close}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      disableScrollLock
    >
      <Card sx={{ border: '1px solid #ddd', width: 450 }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: '#1DE4EB', color: '#121A23' }}>#</Avatar>
          }
          title={title}
          sx={{ py: 1 }}
        />
        <CardContent
          sx={{
            p: 0,
            m: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <ButtonGroup
            variant="outlined"
            size="small"
            fullWidth
            color="primary"
            sx={{ py: 1, px: 3 }}
          >
            {CHART_TYPES.map((chartType) => (
              <Button
                key={chartType}
                size={'small'}
                sx={{
                  color:
                    chartType === selectedChartType ? 'primary' : 'inherit',
                }}
                variant={
                  chartType === selectedChartType ? 'contained' : 'outlined'
                }
                onClick={() => setSelectedChartType(chartType)}
              >
                {chartType}
              </Button>
            ))}
          </ButtonGroup>
          <div
            style={{
              padding: '0 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <TextField
              label="Widget Title"
              variant="standard"
              value={widgetTitle}
              onChange={(e) => setWidgetTitle(e.target.value)}
              fullWidth
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <FormControl variant="standard" fullWidth>
                <InputLabel>Show me...</InputLabel>
                <Select
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                >
                  <MenuItem value={'Revenue'}>Revenue</MenuItem>
                  <MenuItem value={'Opportunities'}>
                    # of Opportunities
                  </MenuItem>
                </Select>
              </FormControl>
              <FormControl
                variant="standard"
                fullWidth
                disabled={value === 'Opportunities'}
              >
                <InputLabel>Calculated as...</InputLabel>
                <Select
                  value={aggregation}
                  onChange={(e) => setAggregation(e.target.value)}
                >
                  <MenuItem value={'sum'}>Sum</MenuItem>
                  <MenuItem value={'average'}>Average</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <FormControl variant="standard" fullWidth>
                <InputLabel>By...</InputLabel>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {allDimensions.map((dim) => (
                    <MenuItem
                      key={dim.value}
                      value={dim.value}
                      disabled={dim.value === breakBy}
                    >
                      {dim.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl variant="standard" fullWidth>
                <InputLabel>And break it down by...</InputLabel>
                <Select
                  value={breakBy}
                  onChange={(e) => setBreakBy(e.target.value)}
                  disabled={selectedChartType === 'pie'}
                >
                  <MenuItem value={'None'}>None</MenuItem>
                  {lowCardinalityDimensions.map((dim) => (
                    <MenuItem
                      key={dim.value}
                      value={dim.value}
                      disabled={dim.value === category}
                    >
                      {dim.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
          <div
            style={{
              minWidth: 300,
              minHeight: 280,
              margin: 'auto',
              marginTop: '16px',
            }}
          >
            <Chart
              dataSet={DM.DataSource}
              chartType={selectedChartType}
              dataOptions={getDataOptions()}
              styleOptions={{ height: 280, width: 400 }}
              onBeforeRender={onBeforeRender}
            />
            <Button
              variant="contained"
              sx={{ m: 3, mt: 1, float: 'right' }}
              onClick={handleAddChartClick}
            >
              Add To Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </Popover>
  );
};
