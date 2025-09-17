import Highcharts from 'highcharts';

export const getHighchartsThemeOptions = (
  theme: 'light' | 'dark' | undefined
): Highcharts.Options => {
  const isDarkMode = theme === 'dark';
  const hrColor = isDarkMode ? '#374151' : '#E5E7EB';

  const sharedTooltipOptions: Highcharts.TooltipOptions = {
    shared: true,
    useHTML: true,
    formatter: function () {
      if (!this.points) {
        return '';
      }

      const points = this.points;
      const xValue = points[0].key;
      let total = 0;
      let body = '';

      const isCurrency = points.some(
        (p) =>
          p.series.name.toLowerCase().includes('revenue') ||
          p.series.name.toLowerCase().includes('value') ||
          p.series.name.toLowerCase().includes('acv')
      );

      const isOpps = points.some((p) =>
        p.series.name.toLowerCase().includes('opportunities')
      );

      points.forEach((point) => {
        if (point.y === null || point.y === undefined) return;
        total += point.y;

        let formattedY = '';
        const seriesNameLower = point.series.name.toLowerCase();

        if (
          seriesNameLower.includes('%') ||
          seriesNameLower.includes('percent')
        ) {
          formattedY =
            Highcharts.numberFormat(point.y * 100, 2, '.', ',') + '%';
        } else if (isCurrency) {
          formattedY = `$${Highcharts.numberFormat(point.y, 2, '.', ',')}`;
        } else if (isOpps) {
          formattedY = `${Highcharts.numberFormat(point.y, 0, '.', ',')} opps`;
        } else {
          formattedY = Highcharts.numberFormat(point.y, 0, '.', ',');
        }

        body += `
          <tr>
            <td style="padding: 3px 5px 3px 0;">
              <span style="display: inline-block; width: 10px; height: 10px; background-color: ${point.series.color}; margin-right: 5px; vertical-align: middle;"></span>
              <span style="vertical-align: middle;">${point.series.name}</span>
            </td>
            <td style="text-align: right; padding: 3px 0;"><b>${formattedY}</b></td>
          </tr>
        `;
      });

      let footer = '';
      if (points.length > 1) {
        let formattedTotal = '';
        if (isCurrency) {
          formattedTotal = `$${Highcharts.numberFormat(total, 2, '.', ',')}`;
        } else if (isOpps) {
          formattedTotal = `${Highcharts.numberFormat(
            total,
            0,
            '.',
            ','
          )} opps`;
        } else {
          formattedTotal = Highcharts.numberFormat(total, 0, '.', ',');
        }

        footer = `
          <tr>
            <td colspan="2" style="padding: 5px 0 2px 0;"><div style="width: 100%; height: 1px; background-color: ${hrColor};"></div></td>
          </tr>
          <tr>
            <td style="padding: 2px 0;"><b>Total</b></td>
            <td style="text-align: right; padding: 2px 0;"><b>${formattedTotal}</b></td>
          </tr>
        `;
      }

      return `
        <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">${xValue}</div>
        <table style="width: 100%; border-spacing: 0;">
          <tbody>
            ${body}
            ${footer}
          </tbody>
        </table>
      `;
    },
    borderWidth: 1,
    borderRadius: 8,
    shadow: false,
  };

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
        ...sharedTooltipOptions,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
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
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(102, 222, 255, 0.2)'],
            [1, 'rgba(102, 222, 255, 0.05)'],
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
      ...sharedTooltipOptions,
      backgroundColor: 'rgba(31, 41, 55, 0.85)',
      borderColor: '#374151',
      style: {
        color: '#F0F0F0',
      },
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
