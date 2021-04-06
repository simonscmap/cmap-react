import colors from '../Enums/colors';

const spanStyles = 'style="width:50%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"'

export default {
    layout: {
        font: {color: '#ffffff'},
        paper_bgcolor: colors.backgroundGray,
        autosize: true,
        margin: {
            t: 116,
            b: 104
        },
    },

    config: {
        displaylogo: false
    },    

    annotations: (distributor, dataSource) => {
        // let yshift = ((document.documentElement.clientWidth * (height / 100)) / -2) + 20;
        let _dataSource = dataSource.length > 70 ? 
                'Data Source: ' + dataSource.slice(0, 67) + '...' : 
                'Data Source: ' + dataSource;

        let _distributor = distributor ?
            distributor.length > 70 ?
                '<br>Distributor: ' + distributor.slice(0, 67) + '...' :
                '<br>Distributor: ' + distributor :
            '';

        let cmapCredit = '<br>Visualization provided by Simons CMAP';        
        
        return (
            [
                {
                    // text: `Data Source: ${distributor.length < 35 ? 
                    //     distributor : 
                    //     distributor.slice(0,32) + '...'} -- Provided by Simons CMAP`,
                    text: _dataSource + _distributor + cmapCredit,
                    font: {
                        color: 'white',
                        size: 10
                    },
                    xref: 'paper',
                    yref: 'paper',
                    // yshift: height ? 0 - height + 160 : -290,
                    // yshift,
                    yanchor: 'top',
                    x: .5,
                    // y: -.1,
                    y: 0,
                    yshift: -56,
                    showarrow: false,
                    xanchor: 'center',
                }
            ]
        )   
    }
}