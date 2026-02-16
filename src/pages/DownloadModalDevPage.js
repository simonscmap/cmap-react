import React from 'react';
import CollectionDownloadModal from '../features/collections/myCollections/CollectionDownloadModal';

const DEV_COLLECTION = {
  id: 329,
  name: 'Dev Test Collection',
  datasets: [
    { datasetShortName: 'ALOHA_O2toAr' },
    { datasetShortName: 'Darwin_Phytoplankton' },
    { datasetShortName: 'GRUMP' },
    { datasetShortName: 'KM1513_HOE_Legacy_2A' },
    { datasetShortName: 'Tara_Oceans_Surface_Water_Measurements' },
  ],
};

const DownloadModalDevPage = () => {
  if (process.env.NODE_ENV !== 'development') {
    return <div>This page is only available in development mode.</div>;
  }

  return (
    <CollectionDownloadModal
      open={true}
      onClose={() => console.log('Modal close requested')}
      collection={DEV_COLLECTION}
      initialSubsetExpanded={true}
    />
  );
};

export default DownloadModalDevPage;
