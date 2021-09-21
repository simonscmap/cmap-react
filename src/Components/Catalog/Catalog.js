// Wrapper and layout for the catalog page
import React, { useEffect } from "react";
import { withStyles, Grid } from "@material-ui/core";

import CatalogSearch from "./CatalogSearch";
import SearchResults from "./SearchResults";
import Help from "../Help/Help";
import metaTags from "../../enums/metaTags";
import { CATALOG_PAGE } from "../../constants";
import { connect } from "react-redux";

const styles = (theme) => ({
  wrapperDiv: {
    marginTop: "68px",
    padding: "20px",
    boxSizing: "border-box",
    [theme.breakpoints.down("sm")]: {
      padding: "20px 8px",
    },
  },

  searchGrid: {
    "@media (min-width: 960px)": {
      paddingTop: "62px",
    },
  },
});

const mapStateToProps = (state) => ({
  // show help on the catalog page if the intro has been disabled
  showHelp: !state.intros[CATALOG_PAGE],
});

const Catalog = ({ classes, showHelp }) => {
  // TODO these use effects return functions that are not used
  useEffect(() => {
    document.title = metaTags.catalog.title;
    document.description = metaTags.catalog.description;

    return () => {
      document.title = metaTags.default.title;
      document.description = metaTags.default.description;
    };
  });

  // TODO can we remove this and handle it in stylesheets?
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  });

  return (
    <div className={classes.wrapperDiv}>
      <Grid container justify="center">
        <Grid item xs={12} md={4} className={classes.searchGrid}>
          <CatalogSearch />
        </Grid>

        <Grid item xs={12} md={8}>
          <SearchResults />
        </Grid>
      </Grid>
      <Help
        showHelp={showHelp}
        videoLink={"https://player.vimeo.com/video/596147087"}
        apiLink={null}
        pythonLink={
          "https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_retrieval/pycmap_catalog.html#getcatalog"
        }
        rLink={
          "https://simonscmap.github.io/cmap4r/getting-started.html#catalog-of-data"
        }
        matlabLink={
          "https://github.com/simonscmap/matcmap/blob/f02ad2dbec4b896f721675399a432deee395658a/src/CMAP.m#L172"
        }
        juliaLink={
          "https://github.com/simonscmap/CMAP.jl/blob/5ae0a5b4125db09414fd36580a56a427a1ddd8da/src/metaMethods.jl#L9"
        }
      />
    </div>
  );
};

export default connect(mapStateToProps)(withStyles(styles)(Catalog));
