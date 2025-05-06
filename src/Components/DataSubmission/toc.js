const NavListItem = ({ item, classes }) => (
  <ListItem
    component="a"
    href={`#data-structure-${item.anchorEnd}`}
    className={classes.navListItem}
  >
    <ListItemText
      primary={item.label}
      className={classes.subListText}
      classes={{ primary: classes.navListSubItemText }}
    />
  </ListItem>
);

<Paper className={classes.stickyPaper} elevation={6}>
  <List dense={true}>
    <ListItem
      component="a"
      href="#getting-started"
      className={classes.navListItem}
    >
      <ListItemText
        primary="Getting Started"
        classes={{ primary: classes.navListItemText }}
        className={classes.navListItemtextWrapper}
      />
    </ListItem>

    <ListItem
      component="a"
      href="#submission-process"
      className={classes.navListItem}
    >
      <ListItemText
        primary="Submission Process"
        classes={{ primary: classes.navListItemText }}
        className={classes.navListItemtextWrapper}
      />
    </ListItem>

    <List dense={true} style={{ padding: '0 0 0 12px' }}>
      <ListItem
        component="a"
        href="#validation"
        className={classes.navListItem}
      >
        <ListItemText
          primary="Validation"
          className={classes.subListText}
          classes={{ primary: classes.navListSubItemText }}
        />
      </ListItem>

      <ListItem component="a" href="#feedback" className={classes.navListItem}>
        <ListItemText
          primary="Feedback"
          className={classes.subListText}
          classes={{ primary: classes.navListSubItemText }}
        />
      </ListItem>

      <ListItem component="a" href="#doi" className={classes.navListItem}>
        <ListItemText
          primary="DOI"
          className={classes.subListText}
          classes={{ primary: classes.navListSubItemText }}
        />
      </ListItem>

      <ListItem component="a" href="#ingestion" className={classes.navListItem}>
        <ListItemText
          primary="Ingestion"
          className={classes.subListText}
          classes={{ primary: classes.navListSubItemText }}
        />
      </ListItem>
    </List>

    <ListItem component="a" href="#dashboard" className={classes.navListItem}>
      <ListItemText
        primary="User Dashboard"
        classes={{ primary: classes.navListItemText }}
        className={classes.navListItemtextWrapper}
      />
    </ListItem>

    <ListItem
      component="a"
      href="#data-structure"
      className={classes.navListItem}
    >
      <ListItemText
        primary="Data Structure"
        classes={{ primary: classes.navListItemText }}
        className={classes.navListItemtextWrapper}
      />
    </ListItem>

    <List dense={true} style={{ padding: '0 0 0 12px' }}>
      <ListItem
        component="a"
        href="#data-structure-data"
        className={classes.navListItem}
      >
        <ListItemText
          primary="Data"
          className={classes.subListText}
          classes={{ primary: classes.navListSubItemText }}
        />
      </ListItem>

      <List
        dense={true}
        style={{
          padding: '0 0 0 12px',
        }}
      >
        {dsGuideItems.dataItems.map((e, i) => (
          <NavListItem item={e} key={i} classes={classes} />
        ))}
      </List>

      <ListItem
        component="a"
        href="#data-structure-dataset_short_name"
        className={classes.navListItem}
      >
        <ListItemText
          primary="Dataset Metadata"
          className={classes.subListText}
          classes={{ primary: classes.navListSubItemText }}
        />
      </ListItem>

      <List
        dense={true}
        style={{
          padding: '0 0 0 12px',
        }}
      >
        {dsGuideItems.datasetMetadataItems.map((e, i) => (
          <NavListItem item={e} key={i} classes={classes} />
        ))}
      </List>

      <ListItem
        component="a"
        href="#data-structure-variable"
        className={classes.navListItem}
      >
        <ListItemText
          primary="Variable Metadata"
          className={classes.subListText}
          classes={{ primary: classes.navListSubItemText }}
        />
      </ListItem>

      <List
        dense={true}
        style={{
          padding: '0 0 0 12px',
        }}
      >
        {dsGuideItems.variableMetadataItems.map((e, i) => (
          <NavListItem item={e} key={i} classes={classes} />
        ))}
      </List>

      <ListItem
        component="a"
        href="#data-structure-references"
        className={classes.navListItem}
      >
        <ListItemText
          primary="References"
          className={classes.subListText}
          classes={{ primary: classes.navListSubItemText }}
        />
      </ListItem>
    </List>

    <ListItem component="a" href="#faq" className={classes.navListItem}>
      <ListItemText
        primary="FAQ &amp; Help"
        classes={{ primary: classes.navListItemText }}
        className={classes.navListItemtextWrapper}
      />
    </ListItem>

    <List dense={true} style={{ padding: '0 0 0 12px' }}>
      <ListItem component="a" href="#faq-doi" className={classes.navListItem}>
        <ListItemText primary="DOIs" className={classes.subListText} />
      </ListItem>

      <ListItem
        component="a"
        href="#faq-curation"
        className={classes.navListItem}
      >
        <ListItemText primary="Curation" className={classes.subListText} />
      </ListItem>

      <ListItem
        component="a"
        href="#faq-validation-warnings"
        className={classes.navListItem}
      >
        <ListItemText
          primary="Validation Warnings"
          className={classes.subListText}
        />
      </ListItem>

      <ListItem
        component="a"
        href="#faq-preliminary"
        className={classes.navListItem}
      >
        <ListItemText
          primary="Preliminary Datasets"
          className={classes.subListText}
        />
      </ListItem>
    </List>

    <ListItem component="a" href="#contact" className={classes.navListItem}>
      <ListItemText
        primary="Contact"
        classes={{ primary: classes.navListItemText }}
        className={classes.navListItemtextWrapper}
      />
    </ListItem>

    <ListItem component="a" href="#resources" className={classes.navListItem}>
      <ListItemText
        primary="Resources"
        classes={{ primary: classes.navListItemText }}
        className={classes.navListItemtextWrapper}
      />
    </ListItem>
  </List>
</Paper>;
