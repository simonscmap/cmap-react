import colors from '../../../enums/colors';
import { truncate60, truncateString } from './chartHelpers';
const truncate75 = truncateString(75);
// const spanStyles = 'style="width:50%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"';

/* var icon1 = {
 *   width: 500,
 *   height: 600,
 *   path: 'M 0 0 H 0 V 0 H 0 L 0 0',
 * }; */

/* let addButton = {
 *   modeBarButtonsToAdd: [
 *     {
 *       name: '#hint-anchor',
 *       icon: icon1,
 *       click: () => null,
 *     },
 *   ],
 * };
 *  */

const makeAnnotations = (distributor, dataSource = '', overrides = {}) => {
  // let yshift = ((document.documentElement.clientWidth * (height / 100)) / -2) + 20;

  const ds = truncate60(dataSource);
  let _dataSource = `Source:<br>${ds}`;

  const dr = truncate75(distributor);
  let _distributor = `Distributor:<br>${dr}`;

  let cmapCredit = 'Simons CMAP';

  const base = {
    font: {
      color: 'white',
      size: 10,
    },
    xref: 'paper',
    yref: 'paper',
    yanchor: 'top',
    showarrow: false,
  };

  const { annotationsLeft, truncated } = overrides;

  if (annotationsLeft) {
    let _cmap = 'Simons CMAP';
    _dataSource = ds;
    _distributor = dr;

    const keyItems = ['Credit', 'Source', 'Distributor'];
    const textItems = [_cmap, _dataSource, _distributor];

    if (truncated) {
      // keyItems.unshift ('');
      // textItems.unshift ('The data is this chart has been truncated due to size');
    }

    const keys = keyItems.map((k, i) =>
      Object.assign({}, base, {
        text: k,
        x: 0,
        y: 0,
        xanchor: 'left',
        yshift: -55 - i * 15,
        align: 'left',
      }),
    );

    const txt = textItems.map((k, i) =>
      Object.assign({}, base, {
        text: k,
        x: 0,
        y: 0,
        xanchor: 'left',
        yshift: -55 - i * 15,
        xshift: 100,
        align: 'left',
      }),
    );

    return keys.concat(txt);
  } else {
    const creditText = [
      Object.assign({}, base, {
        text: _dataSource,
        x: 0,
        y: 0,
        yshift: -45,
        xanchor: 'left',
      }),
      Object.assign({}, base, {
        text: cmapCredit,
        x: 0.5,
        y: 0,
        yshift: -60,
        xanchor: 'center',
      }),
      Object.assign({}, base, {
        text: _distributor,
        x: 1,
        y: 0,
        yshift: -45,
        xanchor: 'right',
      }),
    ];

    return creditText;
  }
};

const makeTitle = (metadata, date, lat, lon, depth) => {
  const titleText = [];

  titleText.push(metadata.Dataset_Name);
  titleText.push(truncate60(metadata.Long_Name) + `[${metadata.Unit}]`);
  titleText.push(`${date}, ${depth}`);
  if (lat && lon) {
    titleText.push(`Lat: ${lat}, Lon: ${lon}`);
  }

  /* let titleText =
   *   `${metadata.Dataset_Name}` +
   *   `<br>${truncate60(metadata.Long_Name)} [${metadata.Unit}]` +
   *   `<br>${date}, ${depth}` +
   *   `<br>Lat: ${lat}, Lon: ${lon}`;
   */
  return {
    text: titleText.join('<br>'),
    font: {
      size: 13,
    },
    yref: 'container',
  };
};

const defaultConfig = {
  style: {
    position: 'relative',
    // width: '60vw',
    // height: '40vw',
    width: '100%',
    // height: '500px',
    // minWidth: '500',
  },
  useResizeHandler: true,
  layout: {
    font: { color: '#ffffff' },
    paper_bgcolor: colors.backgroundGray,
    plot_bgcolor: 'transparent',
    // autosize: true,
    margin: {
      t: 115,
      b: 115,
    },
  },

  config: {
    displaylogo: false,
    // displayModeBar: false,
    toImageButtonOptions: {
      height: 700,
      width: 1000,
      scale: 2,
      format: 'svg',
    },
    responsive: true,
  },

  title: makeTitle,
  annotations: makeAnnotations,
};

export const makeChartConfig = (config) => {
  let {
    annotationArgs = [],
    titleArgs = [],
    cmapOverrides,
    ...restOfConfig
  } = config;

  const layoutOverrides = {};
  if (cmapOverrides && cmapOverrides.bg) {
    layoutOverrides.paper_bgcolor = cmapOverrides.bg;
  }

  return {
    cmapOverrides,
    // first copy all props from config, so nothing is missed
    ...restOfConfig,
    // then apply defaults, and reapply any overrides from the args
    style: {
      ...defaultConfig.style,
      ...(restOfConfig.style || {}),
    },
    layout: {
      ...defaultConfig.layout,
      ...(restOfConfig.layout || {}),
      title: makeTitle(...titleArgs),
      annotations: makeAnnotations(...annotationArgs), // typically only parameters
      // but well pass a 3rd as an overrides object
      ...layoutOverrides,
    },
    config: {
      ...defaultConfig.config,
      ...(restOfConfig.config || {}),
    },
  };
};
export default defaultConfig;
