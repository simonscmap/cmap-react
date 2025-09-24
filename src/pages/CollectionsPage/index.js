import React from 'react';
import Page2 from '../../Components/Common/Page2';
import { Collections } from '../../features/collections';

const CollectionsPage = () => {
  return (
    <Page2 bgVariant={'slate2'}>
      <Collections />
    </Page2>
  );
};

export default CollectionsPage;

export const collectionsPageConfig = {
  video: false,
  tour: false,
  hints: false,
  navigationVariant: 'Center',
};
