const jss = {
    // styles for top navbar links
    navLink: theme => ({
        textDecoration: 'none',
        marginRight: 40,
        color: 'white',
        '&:hover': {
            color: theme.palette.primary.main
        },
        fontSize: '15px',
        fontWeight: 100,
        display: 'inline-block',
        cursor: 'pointer' ,
        verticalAlign: 'middle',
        pointerEvents: 'all',
        fontWeight: 500
    }),
}

export default jss;