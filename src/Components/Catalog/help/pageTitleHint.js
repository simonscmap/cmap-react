import React from 'react';
import SeeAlso from './seeAlso';
import InlineVideo from '../../Help/InlineVideo';
import HintContent from '../../Help/HintContent';
import { CATALOG_OVERVIEW_VIDEO } from '../../../constants';

const CatalogPageTitleHint = () => {
  return (
    <HintContent>
      <h3> Simons CMAP Catalog</h3>
      <p>
        The Simons CMAP Catalog page supports users in identifying and accessing
        datasets that match their interests. By default, the Catalog page lists
        all of the datasets accessible through Simons CMAP. The search and
        filtering options located on the left support users in refining this
        list to include only those datasets that match their interests.
      </p>
      <p>Once a dataset of interest is identified it can be:</p>
      <ul>
        <li>Explored on the Simons CMAP visualization page</li>
        <li>Directly downloaded from the dataset catalog page</li>
        <li>
          Accessed via programming tools using information on the dataset
          catalog page
        </li>
      </ul>
      <h3>Video Tutorial</h3>
      <InlineVideo src={CATALOG_OVERVIEW_VIDEO} />
      <SeeAlso />
    </HintContent>
  );
};

export default CatalogPageTitleHint;
