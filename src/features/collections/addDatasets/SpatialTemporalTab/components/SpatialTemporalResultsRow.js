import React from 'react';
import { TableCell, Checkbox } from '@material-ui/core';
import { RowCountCell } from '../../../../rowCount';

let SpatialTemporalResultsRow = React.memo(function SpatialTemporalResultsRow(props) {
  let {
    dataset,
    activeColumns,
    columnConfig,
    currentConstraints,
    isSelected,
    isAlreadyPresent,
    onToggleSelection,
    tableCellClass,
    checkboxCellClass,
    rowsCellClass,
  } = props;

  let handleToggle = function () {
    onToggleSelection(dataset.shortName);
  };

  return (
    <React.Fragment>
      <TableCell className={checkboxCellClass + ' ' + tableCellClass}>
        <Checkbox
          checked={isSelected}
          onChange={handleToggle}
          color="primary"
          size="small"
          disabled={isAlreadyPresent}
        />
      </TableCell>
      {activeColumns.map(function (columnKey) {
        if (columnKey === 'rows') {
          return (
            <TableCell
              key="rows"
              className={tableCellClass + ' ' + rowsCellClass}
              align="right"
            >
              <RowCountCell
                shortName={dataset.shortName}
                currentConstraints={currentConstraints}
              />
            </TableCell>
          );
        }
        let column = columnConfig[columnKey];
        return (
          <TableCell
            key={columnKey}
            className={tableCellClass + ' ' + column.cellClass}
            align={column.align}
          >
            {column.render(dataset)}
          </TableCell>
        );
      })}
    </React.Fragment>
  );
});

export default SpatialTemporalResultsRow;
