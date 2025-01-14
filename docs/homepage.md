# Homepage

The homepage has three data driven sections:

1. The "At a glance" section, which displays some statistics about CMAP. These numbers are pulled in from the database on every page load via the `api/highlights` endpoint, though the API does cache them.
2. The News section, which pulls in the entire catalog of news stories via `api/news/list`; there is no pagination at the time of this writing.
3. The Global Anomaly Monitor, which uses a custom endpoints `api/data/named/avg-sst` and `api/data/named/avg-adt` to populate its visualization. The `data/named` api is set aside for custom data requests that require unique processing; each request has a unique name.

## Theme

The homepage uses its own MUI theme, defined in [homepageStyles](homepageStyles.js). Historically the homepage had a different theme from the rest of the website, but gradually other pages have adopted it, and now import the homepage theme.

Note that the homepage employs a number of unique css breakpoints in order to present the main graphic in proportion to different screen sizes.
