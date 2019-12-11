import colors from '../Enums/colors';

export default {
    layout: {
        font: {color: '#ffffff'},
        paper_bgcolor: colors.backgroundGray,
        autosize: true
    },

    config: {
        displaylogo: false
    },

    annotations: (distributor, height = 40) => {
        let yshift = ((document.documentElement.clientWidth * (height / 100)) / -2) + 20;
        return (
            [
                {
                    text: `Source: ${distributor.length < 35 ? 
                        distributor : 
                        distributor.slice(0,32) + '...'} -- Provided by Simons CMAP`,
                    font: {
                        color: 'white',
                        size: 10
                    },
                    xref: 'paper',
                    yref: 'paper',
                    // yshift: height ? 0 - height + 160 : -290,
                    yshift,
                    showarrow: false,
                }
            ]
        )   
    }
}