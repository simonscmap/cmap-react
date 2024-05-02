import dayjs from 'dayjs';

export const popupTemplate = {
  'type': "fields",
  fieldInfos: [
    {
      fieldName: 'lon',
      label: 'Longitude',
    },
    {
      fieldName: 'lat',
      label: 'Latitude',
    },
    {
      fieldName: 'time',
      label: 'Time',
    },
    {
      fieldName: 'name',
      label: 'Cruise Name',
    },
    {
      fieldName: 'nick',
      label: 'Nickname',
    },
    {
      fieldName: "cruiseId",
      label: 'Cruise ID',
    },
    {
      fieldName: 'ship',
      label: 'Ship Name',
    },
    {
      fieldName: 'start',
      label: 'Cruise Start Time',
    },
    {
      fieldName: 'end',
      label: 'Cruise End Time',
    },
    {
      fieldName: 'chief',
      label: 'Chief Scientist',
    }
  ]
};

export const polylinePopupTemplate_ = (vertex, cruise) => ([
  {
    'type': "text",
    text: `<span>lat ${vertex.lat}</span><br /><span>lon ${vertex.lon}</span>`
  },
  {
  'type': "fields",
  fieldInfos: [
    {
      fieldName: 'name',
      label: 'Cruise Name',
    },
    {
      fieldName: 'nick',
      label: 'Nickname',
    },
    {
      fieldName: "cruiseId",
      label: 'Cruise ID',
    },
    {
      fieldName: 'ship',
      label: 'Ship Name',
    },
    {
      fieldName: 'start',
      label: 'Cruise Start Time',
    },
    {
      fieldName: 'end',
      label: 'Cruise End Time',
    },
    {
      fieldName: 'chief',
      label: 'Chief Scientist',
    }
  ]
}
]);

export const polylinePopupTemplate = (vertex, cruise) => `
  <tr>
    <th class="esri-feature__field-header">Latitude</th>
    <td class="esri-feature__field-data">${vertex.lat}</td>
  </tr>
  <tr>
    <th class="esri-feature__field-header">Longitude</th>
    <td class="esri-feature__field-data">${vertex.lon}</td>
  </tr>
  <tr>
    <th class="esri-feature__field-header">Cruise Name</th>
    <td class="esri-feature__field-data"><a href="/catalog/cruises/${cruise.Name}" target="_blank">${cruise.Name}</a></td>
  </tr>
  <tr>
    <th class="esri-feature__field-header">Nickname</th>
    <td class="esri-feature__field-data">${cruise.Nickname}</td>
  </tr>
  <tr>
    <th class="esri-feature__field-header">Cruise ID</th>
    <td class="esri-feature__field-data">${cruise.ID}</td>
  </tr>
  <tr>
    <th class="esri-feature__field-header">Ship Name</th>
    <td class="esri-feature__field-data">${cruise.Ship_Name}</td>
  </tr>
  <tr>
    <th class="esri-feature__field-header">Cruise Start Time</th>
    <td class="esri-feature__field-data">${dayjs(cruise.Start_Time).format('YYYY-MM-DD')}</td>
  </tr>
    <tr><th class="esri-feature__field-header">Cruise End Time</th>
    <td class="esri-feature__field-data">${dayjs(cruise.End_Time).format('YYYY-MM-DD')}</td>
  </tr>
  <tr>
    <th class="esri-feature__field-header">Chief Scientist</th>
    <td class="esri-feature__field-data">${cruise.Chief_Name}</td>
  </tr>
    `;
