const options = {
    SNACKBAR: 10000,
    LOADING_OVERLAY: 9999,
    MUI_DIALOG: 9800,
    LOGIN_DIALOG: 9850,
    TOOLTIP: 9000,
    NAVBAR_DROPDOWN: 8000,
    HELP_DIALOG: 7000,
    NON_HELP_DIALOG: 6000,

    NAVBAR: 5000,
    // secondary controls can be nested in secondary control, tertiary can be nested in secondary
    CONTROL_TERTIARY: 4000,
    CONTROL_SECONDARY: 3000,
    CONTROL_PRIMARY: 2000,

    // Material-UI Defaults for reference:
    // mobile stepper: 1000
    // speed dial: 1050
    // app bar: 1100
    // drawer: 1200
    // modal: 1300
    // snackbar: 1400
    // tooltip: 1500
};

export default Object.freeze(options);
