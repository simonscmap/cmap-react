import colors from '../Enums/colors';

export default {
    layout: {
        font: {color: '#ffffff'},
        paper_bgcolor: colors.backgroundGray,
        // plot_bgcolor: 'transparent'
    },

    config: {
        displaylogo: false
    },

    annotations: (distributor, height) => (
        [
            {
                text: `Source: ${distributor.length < 30 ? 
                    distributor : 
                    distributor.slice(0,30)} -- Provided by Simons CMAP`,
                font: {
                    color: 'white',
                    size: 10
                },
                xref: 'paper',
                yref: 'paper',
                yshift: height ? 0 - height + 160 : -290,
                showarrow: false,
            }
        ]
    )
}