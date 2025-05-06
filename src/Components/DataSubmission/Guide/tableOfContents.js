export const data = [
  {
    id: 'getting-started',
    name: 'Getting Started',
  },
  {
    id: 'process-overview',
    name: 'Process Overview',
  },
  {
    id: 'dataset-preparation',
    name: 'Dataset Preparation',
    children: [
      {
        id: 'data-sheet',
        name: 'Data Sheet',
        children: [
          {
            id: 'time-column',
            name: 'time',
          },
          {
            id: 'lat-column',
            name: 'lat',
          },
          {
            id: 'lon-column',
            name: 'lon',
          },
          {
            id: 'depth-column',
            name: 'depth',
          },
          {
            id: 'var-n-columns',
            name: 'var1 ... varN',
          },
          {
            id: 'cruise-column',
            name: 'cruise',
          },
        ],
      },
      {
        id: 'dataset-metadata-sheet',
        name: 'Dataset Metadata Sheet',
        children: [
          {
            id: 'dataset_short_name',
            name: 'dataset_short_name',
          },
          {
            id: 'dataset_long_name-column',
            name: 'dataset_long_name',
          },
          {
            id: 'dataset_version-column',
            name: 'dataset_version',
          },
          {
            id: 'dataset_release_date-column',
            name: 'dataset_release_date',
          },
          {
            id: 'dataset_make-column',
            name: 'dataset_make',
          },
          {
            id: 'dataset_source-column',
            name: 'dataset_source',
          },
          {
            id: 'dataset_distributor-column',
            name: 'dataset_distributor',
          },
          {
            id: 'dataset_acknowledgment-column',
            name: 'dataset_acknowledgment',
          },
          {
            id: 'dataset_history-column',
            name: 'dataset_history',
          },
          {
            id: 'dataset_description-column',
            name: 'dataset_description',
          },
          {
            id: 'dataset_references-column',
            name: 'dataset_references',
          },
          {
            id: 'climatology-column',
            name: 'climatology',
          },
          {
            id: 'cruise_names-column',
            name: 'cruise_names',
          },
        ],
      },
      {
        id: 'variable-metadata-sheet',
        name: 'Variable Metadata Sheet',
        children: [
          {
            id: 'var_short_name-column',
            name: 'var_short_name',
          },
          {
            id: 'var_long_name-column',
            name: 'var_long_name',
          },
          {
            id: 'var_sensor-column',
            name: 'var_sensor',
          },
          {
            id: 'var_unit-column',
            name: 'var_unit',
          },
          {
            id: 'var_spatial_res-column',
            name: 'var_spatial_res',
          },
          {
            id: 'var_temporal_res-column',
            name: 'var_temporal_res',
          },
          {
            id: 'var_discipline-column',
            name: 'var_discipline',
          },
          {
            id: 'visualize-column',
            name: 'visualize',
          },
          {
            id: 'var_keywords-column',
            name: 'var_keywords',
          },
          {
            id: 'var_comment-column',
            name: 'var_comment',
          },
        ],
      },
    ],
  },
  {
    id: 'dataset-validation',
    name: 'Dataset Validation',
    children: [
      {
        id: 'validation-api',
        name: 'Validation API',
        media: true,
      },
      {
        id: 'submission-portal',
        name: 'Submission Portal',
        media: true,
      },
    ],
  },
  {
    id: 'faq',
    name: 'Frequently Asked Questions',
  },
  {
    id: 'contact',
    name: 'Contact',
    icon: 'email',
  },
];

const generateSequence = (toc) => {
  const reduceBranch = (node) => {
    const { children, ...nodeData } = node;
    if (children) {
      const restOfBranchData = children.reduce((acc, curr) => {
        return [...acc, ...reduceBranch(curr)];
      }, []);
      return [nodeData, ...restOfBranchData];
    }
    return [nodeData];
  };

  return reduceBranch({ children: toc, id: 'root' }).slice(1);
};

export const flatToC = generateSequence(data);

export const findNext = (current) => {
  const indexOfCurrent = flatToC.findIndex((node) => {
    return node.id === current.id;
  });
  if (indexOfCurrent > -1 && indexOfCurrent !== flatToC.length - 1) {
    return flatToC[indexOfCurrent + 1];
  } else {
    return null;
  }
};

export const findPrev = (current) => {
  const indexOfCurrent = flatToC.findIndex((node) => {
    return node.id === current.id;
  });
  if (indexOfCurrent > 0) {
    return flatToC[indexOfCurrent - 1];
  } else {
    return null;
  }
};

// find a node in the table of contents
// return both the node and the path to it
const findNodeById =
  (root) =>
  (path = []) =>
  (id) => {
    if (Array.isArray(root)) {
      return root.reduce((found, current) => {
        if (found) {
          return found;
        } else {
          return findNodeById(current)(path)(id);
        }
      }, null);
    } else if (root && root.id) {
      const { children, ...current } = root;
      if (root.id === id) {
        return {
          current,
          path,
        };
      } else if (Array.isArray(children)) {
        return findNodeById(children)([...path, current])(id);
      } else {
        return null;
      }
    }
  };

export const findById = findNodeById(data)([]);

const capitalizeWord = (str = '') => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getImportNameById = (id = '') => {
  return id.split(/-|_/).map(capitalizeWord).join('');
};
