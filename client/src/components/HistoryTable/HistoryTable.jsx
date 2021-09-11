import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import IconButton from '@material-ui/core/IconButton';

let API_URL = '';

if (process.env.NODE_ENV === 'development') {
  API_URL = require('../../config/config').API_URL;
} else {
  API_URL = `https://shftr-api.herokuapp.com`;
}

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    // marginTop: theme.spacing(3),
    overflowX: 'auto',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 650,
  },
  selectTableCell: {
    width: 60,
  },
  tableCell: {
    width: 130,
    height: 40,
  },
  input: {
    width: 130,
    height: 40,
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
}));

const HistoryTable = () => {
  const { jwtToken } = localStorage;
  const classes = useStyles();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    };

    fetch(`${API_URL}/api/history`, options)
      .then(response => response.json())
      .then(recordsList => {
        recordsList.map(record => {
          let newRow = {
            id: record.ticketId,
            assignedAt: new Date(record.assignedAt).toLocaleString('en-CA'),
            name: record.name,
            groupName: record.groupName,
            ticketUrl: record.ticketUrl,
            ticketId: record.ticketId,
          };
          setRows(oldRows => [...oldRows, newRow]);
        });
      })
      .catch(error => console.log(error));
  }, []);

  return (
    <div className={classes.root}>
      <TableContainer
        style={{
          height: 'fit-content',
          marginBottom: '10px',
          overflowY: 'scroll',
        }}
      >
        <Table stickyHeader className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell align='left'>Assigned at:</TableCell>
              <TableCell align='left'>Agent</TableCell>
              <TableCell align='left'>Group</TableCell>
              <TableCell align='left'>Ticket to Ticket</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => (
              <TableRow key={row.id}>
                <TableCell className={classes.tableCell}>
                  {row.assignedAt}
                </TableCell>
                <TableCell className={classes.tableCell} align='left'>
                  {row.name}
                </TableCell>
                <TableCell className={classes.tableCell} align='left'>
                  {row.groupName}
                </TableCell>
                <TableCell className={classes.tableCell} align='left'>
                  <a href={`https://${row.ticketUrl}`} target='_blank'>
                    {row.ticketId}
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default HistoryTable;
