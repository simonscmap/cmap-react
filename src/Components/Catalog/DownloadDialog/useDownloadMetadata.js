import React, { useState } from 'react';
import api from '../../../api/api';
import { downloadMetadata } from '../DownloadMetaData';

const useDownloadMetadata = (Short_Name) => {
  const fetchDataset = async () => {
    let data;
    try {
      data = await api.catalog.datasetFullPageDataFetch(Short_Name);
      if (data.ok) {
        data = await data.json();
        return await data;
      }
    } catch (e) {
      console.error(`There was an error attempting to fetch ${Short_Name}`);
      alert('There was an error attempting to retrieve the metadata');
    }
  };

  const onDownloadMetaClick = async () => {
    let data = await fetchDataset();
    if (data) {
      downloadMetadata(Short_Name, data);
    } else {
      console.log('no data yet');
    }
  };

  return [() => onDownloadMetaClick()];
};

export default useDownloadMetadata;
