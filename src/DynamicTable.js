// src/DynamicTable.js
import React, { useState } from 'react';
import { TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid, Typography, Container, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
    'Sondertilgung',  // Special repayment
    'Abschreibung',   // Depreciation
    'Inflationsrate'  // Inflation rate
  ];

  // Column names for the table
  const columnNames = [
    'year', 
    'Credit Dept', 
    'Repayment', 
    'Credit Taxes', 
    'Credit reduction', 
    'Credit Dept EOY', 
    'Rent (net)', 
    'Texes', 
    'Maintenance Costs', 
    'Net Costs'
  ];

  const [inputValues, setInputValues] = useState(Array(6).fill(''));
  const [advancedValues, setAdvancedValues] = useState(Array(3).fill(''));
  const [rows, setRows] = useState([]);

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

    const [Sondertilgung, Abschreibung, Inflationsrate] = advancedValues.map(Number); // Advanced settings

    const numberOfYears = 10; // Assume a 10-year loan repayment period

    const newRows = [];
    const valueRows = [];

    for (let year = 1; year <= numberOfYears; year++) {
      let currentDebt = InitialCreditDept;
      if (year > 1) {
        currentDebt = valueRows[year-2][1] + valueRows[year-2][3] - valueRows[year-2][2];
      }
      
      let payBack = 12*monthlyRepayment;

      let annualInterest = currentDebt*creditTax

      let principalRepayment = payBack-annualInterest;

      let yearEndDept = currentDebt - principalRepayment;

      let rentIncome = monthlyRent*12;

      let taxes = (rentIncome-annualInterest-maintenanceCosts-(propertyValue*0.02))*0.5;

      let netCost = taxes+(payBack-rentIncome)+maintenanceCosts
      if (year > 1) {
        netCost = netCost + valueRows[year-2][9];
      }

      newRows.push([
        year, // Jahr
        currentDebt.toLocaleString(undefined, {minimumFractionDigits: 2}),
        payBack.toLocaleString(undefined, {minimumFractionDigits: 2}),
        annualInterest.toLocaleString(undefined, {minimumFractionDigits: 2}),
        principalRepayment.toLocaleString(undefined, {minimumFractionDigits: 2}),
        yearEndDept.toLocaleString(undefined, {minimumFractionDigits: 2}),
        rentIncome.toLocaleString(undefined, {minimumFractionDigits: 2}),
        taxes.toLocaleString(undefined, {minimumFractionDigits: 2}),
        maintenanceCosts.toLocaleString(undefined, {minimumFractionDigits: 2}),
        netCost.toLocaleString(undefined, {minimumFractionDigits: 2})
      ]);
      valueRows.push([
        year,
        currentDebt,
        payBack,
        annualInterest,
        principalRepayment,
        yearEndDept,
        rentIncome,
        taxes,
        maintenanceCosts,
        netCost
      ]);
    }

    setRows(newRows);
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
                        {columnName}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell, colIndex) => (
                        <TableCell 
                          key={colIndex} 
                          align="center" 
                          style={{ 
                            padding: '8px', 
                            fontSize: '0.85rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {cell}
                        </TableCell>
                      ))}
                    </TableRow>
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
