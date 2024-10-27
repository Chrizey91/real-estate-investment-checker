// src/DynamicTable.js
import React, { useState } from 'react';
import { TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid, Typography, Container, Accordion, AccordionSummary, AccordionDetails, IconButton, Collapse, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

function DynamicTable() {
  // Field names for the input fields
  const fieldNames = [
    'monthlyRent', 
    'propertyValue', 
    'InitialCreditDept', 
    'creditTax', 
    'monthlyRepayment', 
    'maintenanceCosts'
  ];

  // Advanced settings field names
  const advancedFieldNames = [
    'Property Value Increase YoY',  // Special repayment
    'Additional Purchasing Costs',   // Depreciation
    'Inflationsrate'  // Inflation rate
  ];

  // Column names for the table
  const columnNames = [
    'Year', 
    'Credit Dept', 
    'Repayment', 
    'Credit Taxes', 
    'Credit reduction', 
    'Credit Dept EOY', 
    'Rent (net)', 
    'Taxes', 
    'Maintenance Costs', 
    'Net Costs',
    'Property Value',
    'Total Value'
  ];

  const [inputValues, setInputValues] = useState(Array(6).fill(''));
  const [advancedValues, setAdvancedValues] = useState(Array(3).fill(''));
  const [rows, setRows] = useState([]);
  const [rowsMonth, setRowsMonth] = useState([]);
  const [openRow, setOpenRow] = useState(null); // Track which row is expanded

  const handleInputChange = (index, value) => {
    const newValues = [...inputValues];
    newValues[index] = value;
    setInputValues(newValues);
  };

  const handleAdvancedChange = (index, value) => {
    const newValues = [...advancedValues];
    newValues[index] = value;
    setAdvancedValues(newValues);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const [
      monthlyRent,
      propertyValue,
      InitialCreditDept,
      creditTax,
      monthlyRepayment,
      maintenanceCosts
    ] = inputValues.map(Number); // Convert inputs to numbers

    const [propIncrease, Abschreibung, Inflationsrate] = advancedValues.map(Number); // Advanced settings

    const numberOfYears = 10; // Assume a 10-year loan repayment period

    const newRows = [];
    const valueRows = [];
    const monthData = [];

    for (let year = 1; year <= numberOfYears; year++) {
      let currentDebt = InitialCreditDept;
      if (year > 1) {
        currentDebt = valueRows[year-2][1] + valueRows[year-2][3] - valueRows[year-2][2];
      }

      const monthlyRows = [];

      let yearlyPayBack = 0.0;
      let annualInterest = 0.0;
      let yearlyPrincipalRepayment = 0.0;
      let yearlyRent = 0.0;
      let yearlyTaxes = 0.0;
      let yearlyMaintenanceCost = 0.0;

      for (let month = 1; month <= 12; month++) {
        let currentDebt = InitialCreditDept;
        if (month > 1) {
          currentDebt = monthlyRows[month-2][1] + monthlyRows[month-2][3] - monthlyRows[month-2][2];
        } else if (year > 1) {
          currentDebt = valueRows[year-2][1] + valueRows[year-2][3] - valueRows[year-2][2];
        }

        yearlyPayBack += monthlyRepayment;
        let monthlyInterest = currentDebt*(creditTax/12.0);
        annualInterest += monthlyInterest;

        let principalRepayment = monthlyRepayment-monthlyInterest;
        yearlyPrincipalRepayment += principalRepayment;
        yearlyRent += monthlyRent;

        let monthEndDept = currentDebt - principalRepayment;

        let capitalTaxBreak = propertyValue*(0.02/12);
        let taxes = (monthlyRent-monthlyInterest-capitalTaxBreak)*0.5;
        yearlyTaxes += taxes;
        yearlyMaintenanceCost += maintenanceCosts;

        let netCost = taxes+(monthlyRepayment-monthlyRent)+maintenanceCosts;
        if (month > 1) {
          netCost = netCost + monthlyRows[month-2][9];
        } else if (year > 1) {
          netCost = netCost + valueRows[year-2][9];
        }
        

        let propValue = propertyValue;
        if (month > 1) {
          propValue = monthlyRows[month-2][10] * (1+(propIncrease/12));
        } else if (year > 1) {
          propValue = valueRows[year-2][10] * (1+(propIncrease/12));
        }

        let totValue = propValue - netCost - monthEndDept;

        monthlyRows.push([
          (year-1)*12+month,
          currentDebt,
          monthlyRepayment,
          monthlyInterest,
          principalRepayment,
          monthEndDept,
          monthlyRent,
          taxes,
          maintenanceCosts,
          netCost,
          propValue,
          totValue
        ]);
      }

      valueRows.push([
        year,
        monthlyRows[0][1],
        yearlyPayBack,
        annualInterest,
        yearlyPrincipalRepayment,
        monthlyRows[11][5],
        yearlyRent,
        yearlyTaxes,
        yearlyMaintenanceCost,
        monthlyRows[11][9],
        monthlyRows[11][10],
        monthlyRows[11][11]
      ]);

      monthData.push(monthlyRows);
    }
    setRows(valueRows);
    setRowsMonth(monthData);
    //   newRows.push([
    //     year, // Jahr
    //     currentDebt.toLocaleString(undefined, {minimumFractionDigits: 2}),
    //     payBack.toLocaleString(undefined, {minimumFractionDigits: 2}),
    //     annualInterest.toLocaleString(undefined, {minimumFractionDigits: 2}),
    //     principalRepayment.toLocaleString(undefined, {minimumFractionDigits: 2}),
    //     yearEndDept.toLocaleString(undefined, {minimumFractionDigits: 2}),
    //     rentIncome.toLocaleString(undefined, {minimumFractionDigits: 2}),
    //     taxes.toLocaleString(undefined, {minimumFractionDigits: 2}),
    //     yearlyMaintenance.toLocaleString(undefined, {minimumFractionDigits: 2}),
    //     netCost.toLocaleString(undefined, {minimumFractionDigits: 2}),
    //     propValue.toLocaleString(undefined, {minimumFractionDigits: 2}),
    //     totValue.toLocaleString(undefined, {minimumFractionDigits: 2})
    //   ]);
  };

  const handleRowExpand = (index) => {
    setOpenRow(openRow === index ? null : index);
  };

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Container maxWidth="lg"> {/* Set maxWidth to lg for a wider container */}
        <Paper elevation={3} style={{ padding: '30px', backgroundColor: '#ffffff', borderRadius: '10px' }}>
          <Typography variant="h4" align="center" gutterBottom style={{ marginBottom: '20px', color: '#3f51b5' }}>
            Loan Repayment Calculator
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {fieldNames.map((label, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <TextField
                    label={label}  // Field name from the array
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={inputValues[index]}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    InputLabelProps={{
                      style: { color: '#3f51b5' }  // Change label color
                    }}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Accordion for advanced settings */}
            <Accordion style={{ marginTop: '20px' }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="advanced-settings-content"
                id="advanced-settings-header"
                style={{ backgroundColor: '#e0e0e0' }}
              >
                <Typography>Advanced Settings</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {advancedFieldNames.map((label, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <TextField
                        label={label}  // Advanced field name from the array
                        variant="outlined"
                        fullWidth
                        type="number"
                        value={advancedValues[index]}
                        onChange={(e) => handleAdvancedChange(index, e.target.value)}
                        InputLabelProps={{
                          style: { color: '#3f51b5' }  // Change label color
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              style={{ marginTop: '30px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
            >
              Generate Table
            </Button>
          </form>

          {rows.length > 0 && (
            <TableContainer component={Paper} style={{ marginTop: '40px', maxWidth: '100%', overflowX: 'auto' }}>
              <Table style={{ width: '100%', minWidth: '800px' }}> {/* Use 100% width with a minimum width */}
                <TableHead>
                  <TableRow>
                  <TableCell 
                        key={0} 
                        align="center" 
                        style={{ 
                          fontWeight: 'bold', 
                          backgroundColor: '#3f51b5', 
                          color: 'white', 
                          padding: '8px', 
                          fontSize: '0.85rem',
                          minWidth: '50px', // Set a minimum width for each column
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                      </TableCell>
                    {columnNames.map((columnName, index) => (
                      <TableCell 
                        key={index+1} 
                        align="center" 
                        style={{ 
                          fontWeight: 'bold', 
                          backgroundColor: '#3f51b5', 
                          color: 'white', 
                          padding: '8px', 
                          fontSize: '0.85rem',
                          minWidth: '90px', // Set a minimum width for each column
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'break-spaces'
                        }}
                      >
                        {columnName}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                      <TableRow>
                        <TableCell>
                          <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => handleRowExpand(rowIndex)}
                          >
                            {openRow === rowIndex ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                          </IconButton>
                        </TableCell>
                        {row.map((cell, colIndex) => (
                          <TableCell key={colIndex} align="center">
                            {
                              colIndex == 0 ? cell : cell.toLocaleString(undefined, {minimumFractionDigits: 2})
                            }
                          </TableCell>
                        ))}
                      </TableRow>

                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={columnNames.length + 1}>
                          <Collapse in={openRow === rowIndex} timeout="auto" unmountOnExit>
                            <Box margin={2}>
                              <Typography variant="h6" gutterBottom component="div">
                                Monthly Breakdown for Year {row[0]}
                              </Typography>
                              <Table size="small" aria-label="monthly breakdown">
                                <TableHead>
                                  <TableRow>
                                    {columnNames.map((columnName, index) => (
                                      <TableCell 
                                        key={index} 
                                        align="center" 
                                        style={{ 
                                          fontWeight: 'bold', 
                                          backgroundColor: '#3f51b5', 
                                          color: 'white', 
                                          padding: '8px', 
                                          fontSize: '0.85rem',
                                          minWidth: '120px', // Set a minimum width for each column
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap'
                                        }}
                                      >
                                        {
                                          index == 0 ? "Month" : columnName
                                        }
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {rowsMonth[row[0]-1].map((rowMonth, rowMonthIndex) => (
                                    <TableRow key={rowMonthIndex}>
                                      {rowMonth.map((cellMonth, colMonthIndex) => (
                                        <TableCell 
                                          key={colMonthIndex} 
                                          align="center" 
                                          style={{ 
                                            padding: '8px', 
                                            fontSize: '0.85rem',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                          }}
                                        >
                                          {
                                           colMonthIndex == 0 ? cellMonth : cellMonth.toLocaleString(undefined, {minimumFractionDigits: 2})
                                          }
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </div>
  );
}

export default DynamicTable;
