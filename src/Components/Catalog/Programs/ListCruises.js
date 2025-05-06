import React from 'react';
// import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import TableCell from '@material-ui/core/TableCell';
import { Link as RouterLink } from 'react-router-dom';
import { CommonTable, CommonRow } from './CommonTable';
import Proto from './Proto';

const getRows = (cruises) => {
  if (!cruises) {
    return [];
  } else {
    return Object.keys(cruises).map((k, i) => {
      const { Name, Nickname } = cruises[k];

      const cells = [
        <TableCell key={`cell_${i}_name`}>
          <RouterLink to={{ pathname: `/catalog/cruises/${Name}` }}>
            {Name}
          </RouterLink>
        </TableCell>,
        <TableCell key={`nick`}>{Nickname}</TableCell>,
      ];

      return <CommonRow key={`common_row_${i}`} cells={cells} />;
    });
  }
};

// return array of column header components
const getColumns = () => {
  return [
    <TableCell key={`name`}>Name</TableCell>,
    <TableCell key={`nick`}>Nickname</TableCell>,
  ];
};

const ListCruises = () => {
  // selectors
  const selectProgramDetailsRequestStatus = (state) =>
    state.programDetailsRequestStatus;

  // data
  const program = useSelector((state) => state.programDetails);

  const deps = [selectProgramDetailsRequestStatus];

  return (
    <Proto title={'Cruises'} deps={deps}>
      <CommonTable
        columns={program ? getColumns() : []}
        rows={program ? getRows(program.cruises) : []}
      />
    </Proto>
  );
};

export default ListCruises;
