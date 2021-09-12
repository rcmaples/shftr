import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Input from '@material-ui/core/Input';
import IconButton from '@material-ui/core/IconButton';
// Icons
import EditIcon from '@material-ui/icons/EditOutlined';
import DoneIcon from '@material-ui/icons/DoneAllTwoTone';
import RevertIcon from '@material-ui/icons/NotInterestedOutlined';

// Inspiration: https://codesandbox.io/s/material-ui-editable-tables-forked-29csr?file=/src/index.js:1794-1845

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

const CustomTableCell = ({ row, name, onChange }) => {
  const classes = useStyles();
  const { isEditMode } = row;
  return (
    <TableCell align='left' className={classes.tableCell}>
      {isEditMode ? (
        <Input
          name={name}
          value={row[name]}
          onChange={e => onChange(e, row)}
          className={classes.input}
          inputProps={{
            type: 'number',
            min: 0,
            max: 1,
            step: 0.25,
          }}
        />
      ) : (
        row[name]
      )}
    </TableCell>
  );
};

const RulesTable = () => {
  const { jwtToken } = localStorage;
  const classes = useStyles();
  const [rows, setRows] = useState([]);
  // const [previous, setPrevious] = React.useState({});

  const updateQueueShare = body => {
    let options = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      credentials: 'include',
    };

    return fetch(`/api/agent/queueshare`, options)
      .then(response => response.json())
      .then(data => {
        return data;
      })
      .catch(error => console.error(error));
  };

  useEffect(() => {
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    };

    fetch(`/api/zendesk-agents?status=active`, options)
      .then(response => response.json())
      .then(agentList => {
        agentList.map(agentRecord => {
          if (agentRecord.defaultZendeskGroupName === 'Support Engineers') {
            let newRow = {
              id: agentRecord.id,
              name: agentRecord.name,
              techcheck: agentRecord.queueShare.techcheck,
              supeng: agentRecord.queueShare.supeng,
              mobile: agentRecord.queueShare.mobile,
            };
            setRows(oldRows => [...oldRows, newRow]);
          }
        });
      })
      .catch(error => console.log(error));
  }, []);

  const onToggleEditMode = id => {
    setRows(state => {
      return rows.map(row => {
        if (row.id === id) {
          return { ...row, isEditMode: !row.isEditMode };
        }
        return row;
      });
    });
  };

  const onSaveChanges = async row => {
    const { id } = row;
    let updated = await updateQueueShare(row);
    onToggleEditMode(id);
  };

  const onChange = (e, row) => {
    // if (!previous[row.id]) {
    //   setPrevious(state => ({ ...state, [row.id]: row }));
    // }
    const value = e.target.value;
    const name = e.target.name;
    const { id } = row;
    const newRows = rows.map(row => {
      if (row.id === id) {
        return { ...row, [name]: value };
      }
      return row;
    });
    setRows(newRows);
  };

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
              <TableCell align='left' />
              <TableCell align='left'>Agent</TableCell>
              <TableCell align='left'>Tech Check</TableCell>
              <TableCell align='left'>Support Engineers</TableCell>
              <TableCell align='left'>Mobile</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => (
              <TableRow key={row.id}>
                <TableCell className={classes.selectTableCell}>
                  {row.isEditMode ? (
                    <>
                      <IconButton
                        aria-label='done'
                        onClick={() => onSaveChanges(row)}
                      >
                        <DoneIcon />
                      </IconButton>
                    </>
                  ) : (
                    <IconButton
                      aria-label='edit'
                      onClick={() => onToggleEditMode(row.id)}
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                </TableCell>
                <TableCell className={classes.tableCell} align='left'>
                  {row.name}
                </TableCell>
                <CustomTableCell {...{ row, name: 'techcheck', onChange }} />
                <CustomTableCell {...{ row, name: 'supeng', onChange }} />
                <CustomTableCell {...{ row, name: 'mobile', onChange }} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default RulesTable;
