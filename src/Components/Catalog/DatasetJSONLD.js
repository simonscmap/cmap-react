import React from 'react';

const DatasetJSONLD = (props) => {
    const keywords = [...Array.from(new Set(props.Keywords.split(','))).map(e => e.trim()), 'oceanography'];

    let data = {
        "@context":"https://schema.org/",
        "@type":"Dataset",
        "name": props.Long_Name,
        "description": props.Description,
        "keywords": keywords,
        "alternateName": props.Short_Name,
        "citation" : props.References || '',
        "measurementTechnique" : props.sensors,
        "hasPart" : props.Variables.map(e => ({
            "@type": "Dataset",
            "name": e.Long_Name,
            "description": `${e.Long_Name} measured via ${e.Sensor} in ${e.Unit}. Part of dataset ${props.Long_Name}`,
            "creator":{
                "@type":"Organization",
                "name": props.Data_Source
            },
        })),
        "creator":{
            "@type":"Organization",
            "name": props.Data_Source
        },
        "includedInDataCatalog":{
            "@type":"DataCatalog",
            "name":"simonscmap.com"
        },
        "temporalCoverage": props.Time_Min && props.Time_Max ? `${props.Time_Min.slice(0,10)}/${props.Time_Max.slice(0,10)}` : '',
        "spatialCoverage":{
            "@type":"Place",
            "geo":{
                "@type": "GeoShape",
                "box": `${props.Lat_Min} ${props.Lon_Min} ${props.Lat_Max} ${props.Lon_Max}`
            }
        }
    }

    return (
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(data)}}/>
    )
}

export default DatasetJSONLD;