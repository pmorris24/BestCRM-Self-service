import Highcharts from 'highcharts';

export const getHighchartsThemeOptions = (
  theme: 'light' | 'dark' | undefined
): Highcharts.Options => {
  if (theme !== 'dark') {
    // Light Theme Options
    return {
      colors: [
        '#0059B2',
        '#7CB5EC',
        '#434348',
        '#90ED7D',
        '#F7A35C',
        '#8085E9',
      ],
      chart: {
        backgroundColor: '#FFFFFF',
      },
      title: {
        style: {
          color: '#333333',
        },
      },
      subtitle: {
        style: {
          color: '#666666',
        },
      },
      plotOptions: {
        bar: {
          groupPadding: 0.4,
        },
        column: {
          groupPadding: 0.4,
        },
      },
      xAxis: {
        labels: {
          style: {
            color: '#333333',
          },
        },
        title: {
          style: {
            color: '#666666',
          },
        },
        lineColor: '#C0C0C0',
        tickColor: '#C0C0C0',
      },
      yAxis: {
        labels: {
          style: {
            color: '#333333',
          },
        },
        title: {
          style: {
            color: '#666666',
          },
        },
        lineColor: '#C0C0C0',
        tickColor: '#C0C0C0',
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#EAEBEF',
        style: {
          color: '#1A2B3C',
        },
      },
      legend: {
        itemStyle: {
          color: '#333333',
        },
        itemHoverStyle: {
          color: '#000000',
        },
        itemHiddenStyle: {
          color: '#cccccc',
        },
      },
      credits: {
        enabled: false,
      },
    };
  }

  // Dark Theme Options
  return {
    colors: ['#8A8AFF', '#66DEFF', '#A5FF8A', '#BFBFFF', '#FF8A8A', '#FFB58A'],
    chart: {
      backgroundColor: 'transparent',
    },
    title: {
      style: {
        color: '#FFFFFF',
      },
    },
    subtitle: {
      style: {
        color: '#E0E0E3',
      },
    },
    plotOptions: {
      series: {
        // This will style the fill for area-like series, which is used for the forecast plot band
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(102, 222, 255, 0.2)'], // Top color
            [1, 'rgba(102, 222, 255, 0.05)'], // Bottom color
          ],
        },
      },
      bar: {
        groupPadding: 0.4,
      },
      column: {
        groupPadding: 0.4,
      },
    },
    xAxis: {
      gridLineColor: '#707073',
      labels: {
        style: {
          color: '#E0E0E3',
        },
      },
      lineColor: '#707073',
      tickColor: '#707073',
      title: {
        style: {
          color: '#A0A0A3',
        },
      },
    },
    yAxis: {
      gridLineColor: '#444446',
      labels: {
        style: {
          color: '#E0E0E3',
        },
      },
      lineColor: '#707073',
      tickColor: '#707073',
      title: {
        style: {
          color: '#A0A0A3',
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      style: {
        color: '#F0F0F0',
      },
      borderColor: '#333333',
    },
    legend: {
      itemStyle: {
        color: '#E0E0E3',
      },
      itemHoverStyle: {
        color: '#FFF',
      },
      itemHiddenStyle: {
        color: '#606063',
      },
    },
    credits: {
      enabled: false,
    },
  };
};
