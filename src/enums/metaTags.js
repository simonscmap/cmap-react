const metaTags = {
    default: {
        title: 'Simons Collaborative Marine Ocean Atlas',
        description: "Simons Collaborative Marine Atlas Project is an open-source data portal interconnecting data sets across Oceanography disciplines. It enables scientists and the public to dive into the vast and often underutilized ocean datasets to retrieve custom subsets of data.",
    },

    visualization: {
        title: 'CMAP Data Visualization',
        description: 'Generate scatter plots, heatmaps, cruise routes, and more using oceanographic data from from CMAP datasets.'
    },

    catalog: {
        title: 'CMAP Catalog',
        description: 'Search for oceanographic datasets in the CMAP database using keywords, or temporal or spatial coverage.'
    },

    dataSubmission: {
        title: 'CMAP Data Submission',
        description: 'Validate and submit your dataset. Track the progress of your previous submissions.'
    },

    community: {
        title: 'CMAP Community',
        description: 'Join the CMAP team on slack, follow us on github, or download the CMAP software package for Python, R, Julia, or MATLAB.'
    }
}

export default Object.freeze(metaTags);