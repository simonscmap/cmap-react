const options = {
  SNACKBAR: 10000,
  LOADING_OVERLAY: 9999,
  MODAL_LAYER_3_POPPER: 9950, // Dropdowns/popovers in tertiary modals (confirmations)
  CONFIRMATION_DIALOG: 9900, // Tertiary modals that appear on top of secondary modals (warnings, confirmations)
  LOGIN_DIALOG: 9900,
  MODAL_LAYER_2_POPPER: 9850, // Dropdowns/popovers in secondary modals (e.g., AddDatasetsModal)
  SECONDARY_MODAL: 9800, // Secondary modals that appear on top of primary modals
  MODAL_LAYER_1_POPPER: 9750, // Dropdowns/popovers in primary modals (e.g., EditCollectionModal)
  MUI_DIALOG: 9700, // Primary modals (main content modals)
  SLIDE_OUT_PANEL: 9500,
  TOOLTIP: 9000,
  NAVBAR_DROPDOWN: 8000,
  HELP_DIALOG: 7000,
  NON_HELP_DIALOG: 6000,

  NAVBAR: 5000,
  DOCS_SIDEBAR: 4500,
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
