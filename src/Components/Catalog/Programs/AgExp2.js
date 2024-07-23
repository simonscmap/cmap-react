"use strict";

import React, { Component } from "react";
import { AgGridReact } from "ag-grid-react";

class GridExample extends Component {
  constructor(props) {
    super(props);

    this.state = {
      rowData: [
        {
          name: "Ireland",
          continent: "Europe",
          language: "English",
          code: "ie",
          population: 4000000,
          summary: "Master Drinkers"
        },
        {
          name: "Spain",
          continent: "Europe",
          language: "Spanish",
          code: "es",
          population: 4000000,
          summary: "Bull Fighters"
        },
        {
          name: "United Kingdom",
          continent: "Europe",
          language: "English",
          code: "gb",
          population: 4000000,
          summary: "Center of the World"
        },
        {
          name: "France",
          continent: "Europe",
          language: "French",
          code: "fr",
          population: 4000000,
          summary: "Best Lovers"
        },
        {
          name: "Germany",
          continent: "Europe",
          language: "German",
          code: "de",
          population: 4000000,
          summary: "Always on Time"
        },
        {
          name: "Sweden",
          continent: "Europe",
          language: "Swedish",
          code: "se",
          population: 4000000,
          summary: "Home of Vikings"
        },

      ],
      columnDefs: getColumnDefs(),
      isFullWidthCell: function(rowNode) {
        var rowIsNestedRow = rowNode.flower;
        return rowIsNestedRow;
      },
      fullWidthCellRenderer: getFullWidthCellRenderer(),
      getRowHeight: function(params) {
        var rowIsNestedRow = params.node.flower;
        return rowIsNestedRow ? 100 : 25;
      },
      doesDataFlower: function(dataItem) {
        return dataItem.name !== "Venezuela";
      }
    };
  }

  onGridReady = params => {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    params.api.forEachLeafNode(function(rowNode) {
      if (rowNode.data.name === "Ireland" || rowNode.data.name === "United Kingdom") {
        rowNode.expanded = true;
      }
    });
    // params.api.onGroupExpandedOrCollapsed();
  };

  render() {
    return (
      <div style={{ width: "100%" }}>
        <div
          id="myGrid"
          style={{
            height: "300px",
            width: "100%"
          }}
          className="ag-theme-balham"
        >
          <AgGridReact
            rowData={this.state.rowData}
            columnDefs={this.state.columnDefs}
            isFullWidthCell={this.state.isFullWidthCell}
            fullWidthCellRenderer={this.state.fullWidthCellRenderer}
            getRowHeight={this.state.getRowHeight}
            doesDataFlower={this.state.doesDataFlower}
            onGridReady={this.onGridReady}
          />
        </div>
      </div>
    );
  }
}

function getColumnDefs() {
  var columnDefs = [
    {
      headerName: "Name",
      field: "name",
      width: 150,
      cellRenderer: "agGroupCellRenderer",
    },
    {
      headerName: "Continent",
      field: "continent",
      width: 150
    },
    {
      headerName: "Language",
      field: "language",
      width: 150
    }
  ];
  return columnDefs;
}


function getFullWidthCellRenderer() {
  function FullWidthCellRenderer() {}

  FullWidthCellRenderer.prototype.init = function(params) {
    var eTemp = document.createElement("div");
    eTemp.innerHTML = this.getTemplate(params);
    this.eGui = eTemp.firstElementChild;
  };

  FullWidthCellRenderer.prototype.getTemplate = function(params) {
    var data = params.node.data;
    var template =
      '<div class="full-width-panel">' +
        `${data}` +
      "</div>";
    return template;
  };

  FullWidthCellRenderer.prototype.getGui = function() {
    return this.eGui;
  };

  return FullWidthCellRenderer;
}

export default GridExample;
