import colors from '../enums/colors';

const spanStyles =
  'style="width:50%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"';

export default {
  layout: {
    font: { color: '#ffffff' },
    paper_bgcolor: colors.backgroundGray,
    plot_bgcolor: 'transparent',
    autosize: true,
    margin: {
      t: 116,
      b: 104,
    },
  },

  config: {
    displaylogo: false,
    displayModeBar: true,
  },

  title: (metadata, date, lat, lon, depth) => {
    return {
      text:
        metadata.Dataset_Name +
        `<br>${
          metadata.Long_Name.length > 60
            ? metadata.Long_Name.slice(0, 60) + '...'
            : metadata.Long_Name
        } [${metadata.Unit}]` +
        `<br>${date}, ` +
        depth +
        `<br>Lat: ${lat}, ` +
        `Lon: ${lon}`,
      font: {
        size: 12,
      },
    };
  },

  annotations: (distributor, dataSource) => {
    // let yshift = ((document.documentElement.clientWidth * (height / 100)) / -2) + 20;
    let _dataSource =
      dataSource.length > 70
        ? 'Source:<br> ' + dataSource.slice(0, 67) + '...'
        : 'Source:<br> ' + dataSource;

    let _distributor = distributor
      ? distributor.length > 70
        ? 'Distributor:<br> ' + distributor.slice(0, 67) + '...'
        : 'Distributor:<br> ' + distributor
      : '';

    let cmapCredit = 'Simons CMAP';

    return [
      {
        text: _dataSource,
        font: {
          color: 'white',
          size: 10,
        },
        xref: 'paper',
        yref: 'paper',
        yanchor: 'top',
        x: 0,
        y: 0,
        yshift: -45,
        showarrow: false,
        xanchor: 'left',
      },
      {
        text: cmapCredit,
        font: {
          color: 'white',
          size: 10,
        },
        xref: 'paper',
        yref: 'paper',
        yanchor: 'top',
        x: 0.5,
        y: 0,
        yshift: -60,
        showarrow: false,
        xanchor: 'center',
      },
      {
        text: _distributor,
        font: {
          color: 'white',
          size: 10,
        },
        xref: 'paper',
        yref: 'paper',
        yanchor: 'top',
        x: 1,
        y: 0,
        yshift: -45,
        showarrow: false,
        xanchor: 'right',
      },
    ];
  },
};
