// Not widely used

const jss = {
    // styles for top navbar links
    navLink: theme => ({
        textDecoration: 'none',
        marginRight: 24,
        fontFamily: '"Lato",sans-serif',
        color: 'white',
        '&:hover': {
            color: theme.palette.primary.main
        },
        fontSize: '14px',
        fontWeight: 100,
        display: 'inline-block',
        cursor: 'pointer' ,
        verticalAlign: 'middle',
        pointerEvents: 'all',
        fontWeight: 500,
        letterSpacing: 'normal'
    }),
}

export default jss;