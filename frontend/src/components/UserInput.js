import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Grid, Typography, TextField, Button, Box, MenuItem, FormControl, Select, InputLabel, Card, CardContent, RadioGroup, FormControlLabel, Radio } from '@mui/material';

// Mapping state abbreviations to full state names
const stateNameMapping = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
  'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland', 
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 
  'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 
  'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 
  'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
};

function UserInput() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedPlayer, finePercentage, fine } = location.state; // Receiving fine and finePercentage
  const [userSalary, setUserSalary] = useState('');
  const [userState, setUserState] = useState('');
  const [breakdown, setBreakdown] = useState(null); // To store the detailed breakdown
  const [inputMode, setInputMode] = useState('salary'); // To switch between salary or hourly input mode
  const [hourlyWage, setHourlyWage] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState('');
  const [errors, setErrors] = useState({ salary: '', hours: '', state: '' }); // Error handling

  // State tax rates by state abbreviation
  const stateTaxRates = {
    'AL': 0.05, 'AK': 0, 'AZ': 0.0454, 'AR': 0.065, 'CA': 0.13, 'CO': 0.0463, 'CT': 0.06, 'DE': 0.066, 'FL': 0, 'GA': 0.0575,
    'HI': 0.0825, 'ID': 0.0625, 'IL': 0.0495, 'IN': 0.0323, 'IA': 0.0853, 'KS': 0.057, 'KY': 0.05, 'LA': 0.06, 'ME': 0.0715,
    'MD': 0.0575, 'MA': 0.05, 'MI': 0.0425, 'MN': 0.0985, 'MS': 0.05, 'MO': 0.054, 'MT': 0.0675, 'NE': 0.0684, 'NV': 0, 
    'NH': 0, 'NJ': 0.0897, 'NM': 0.049, 'NY': 0.0685, 'NC': 0.05499, 'ND': 0.029, 'OH': 0.04997, 'OK': 0.05, 'OR': 0.099,
    'PA': 0.0307, 'RI': 0.0515, 'SC': 0.07, 'SD': 0, 'TN': 0, 'TX': 0, 'UT': 0.0495, 'VT': 0.0895, 'VA': 0.0575, 
    'WA': 0, 'WV': 0.065, 'WI': 0.0765, 'WY': 0
  };

  const states = Object.keys(stateTaxRates).sort();

  // Helper function to format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Handler for salary input changes, allowing only numbers and periods
  const handleSalaryChange = (event) => {
    let inputValue = event.target.value;
    inputValue = inputValue.replace(/[^0-9.]/g, ''); // Allow only digits and periods
    setUserSalary(inputValue);
  };

  // Handler for hourly wage input
  const handleHourlyWageChange = (event) => {
    let inputValue = event.target.value;
    inputValue = inputValue.replace(/[^0-9.]/g, '');
    setHourlyWage(inputValue);
  };

  // Handler for hours worked per week input
  const handleHoursPerWeekChange = (event) => {
    let inputValue = event.target.value;
    inputValue = inputValue.replace(/[^0-9]/g, ''); // Only digits for hours
    if (parseInt(inputValue) > 168) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        hours: 'There are only 168 hours in a week. Please enter a valid number.',
      }));
    } else {
      setHoursPerWeek(inputValue);
      setErrors((prevErrors) => ({
        ...prevErrors,
        hours: '',
      }));
    }
  };

  // Handler to format salary and hourly wage inputs as currency when losing focus
  const handleSalaryBlur = () => {
    if (userSalary) {
      const formattedValue = formatCurrency(parseFloat(userSalary.replace(/[^0-9.]/g, '')));
      setUserSalary(formattedValue);
    }
  };

  const handleHourlyWageBlur = () => {
    if (hourlyWage) {
      const formattedValue = formatCurrency(parseFloat(hourlyWage.replace(/[^0-9.]/g, '')));
      setHourlyWage(formattedValue);
    }
  };

  const calculateGrossSalary = () => {
    if (inputMode === 'salary') {
      return parseFloat(userSalary.replace(/[^0-9.]/g, ''));
    } else {
      const wage = parseFloat(hourlyWage.replace(/[^0-9.]/g, ''));
      const hours = parseFloat(hoursPerWeek.replace(/[^0-9]/g, ''));
      return wage * hours * 52;
    }
  };

  const handleCalculate = () => {
    const errorsFound = {};
  
    if (inputMode === 'salary' && !userSalary) {
      errorsFound.salary = 'Please enter your gross salary.';
    }
    if (inputMode === 'hourly' && (!hourlyWage || !hoursPerWeek)) {
      errorsFound.salary = 'Please enter your hourly wage and hours per week.';
    }
    if (!userState) {
      errorsFound.state = 'Please select your state.';
    }
  
    if (Object.keys(errorsFound).length === 0) {
      const grossSalary = calculateGrossSalary(); // Get gross salary based on mode (salary or hourly)
      const stateTaxRate = stateTaxRates[userState] || 0.05; // Use the state-selected tax rate or default 5%
      const federalTax = grossSalary * 0.37; // 37% federal tax
      const stateTax = grossSalary * stateTaxRate; // State tax
      const netIncome = grossSalary - federalTax - stateTax; // Net income after taxes
      
      // Correct fine calculation by removing .toFixed here and applying it later
      const calculatedFine = netIncome * (finePercentage / 100); // Fine based on net income
  
      // Store the fine and breakdown details
      setBreakdown({
        grossSalary,
        federalTax,
        stateTax,
        netIncome,
        calculatedFine,
      });
    } else {
      setErrors(errorsFound);
    }
  };  

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Typography variant="h4" gutterBottom>
        Comparable Fine Calculator
      </Typography>
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="body1" textAlign="center" gutterBottom>
            <strong>Selected Player:</strong> {selectedPlayer.name}
          </Typography>
          <Grid container spacing={2} justifyContent="space-between">
            <Grid item xs={6}>
              <Typography variant="body1">
                <strong>Fine Amount:</strong> {fine}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">
                <strong>Fine Percentage:</strong> {finePercentage.toFixed(2)}%
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Toggle between Gross Salary and Hourly Wage input modes */}
      <FormControl component="fieldset" sx={{ mb: 4 }}>
        <Typography>Choose Input Type</Typography>
        <RadioGroup
          row
          value={inputMode}
          onChange={(e) => setInputMode(e.target.value)}
        >
          <FormControlLabel
            value="salary"
            control={<Radio />}
            label="Gross Salary"
          />
          <FormControlLabel
            value="hourly"
            control={<Radio />}
            label="Hourly Wage"
          />
        </RadioGroup>
      </FormControl>

      {/* Conditionally render input fields based on selected mode */}
      {inputMode === 'salary' ? (
        <TextField
          fullWidth
          label="Enter Your Gross Salary"
          value={userSalary}
          onChange={handleSalaryChange}
          onBlur={handleSalaryBlur}
          error={Boolean(errors.salary)}
          helperText={errors.salary}
          type="text"
          sx={{ mb: 4 }}
        />
      ) : (
        <>
          <TextField
            fullWidth
            label="Enter Your Hourly Wage"
            value={hourlyWage}
            onChange={handleHourlyWageChange}
            onBlur={handleHourlyWageBlur}
            error={Boolean(errors.salary)}
            helperText={errors.salary}
            type="text"
            sx={{ mb: 4 }}
          />
          <TextField
            fullWidth
            label="Enter Hours Worked Per Week"
            value={hoursPerWeek}
            onChange={handleHoursPerWeekChange}
            error={Boolean(errors.hours)}
            helperText={errors.hours}
            type="text"
            sx={{ mb: 4 }}
          />
        </>
      )}

      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel>Select Your State</InputLabel>
        <Select
          value={userState}
          onChange={(e) => setUserState(e.target.value)}
          error={Boolean(errors.state)}
        >
          {states.map((state) => (
            <MenuItem key={state} value={state}>
              {stateNameMapping[state]}  {/* Display full state names */}
            </MenuItem>
          ))}
        </Select>
        {errors.state && (
          <Typography color="error">{errors.state}</Typography>
        )}
      </FormControl>

      <Box textAlign="center" sx={{ mb: 4 }}>
        <Button variant="contained" color="primary" onClick={handleCalculate}>
          Calculate
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => navigate('/')}
          sx={{ ml: 2 }}
        >
          Home
        </Button>
      </Box>

      {breakdown && (
        <Card variant="outlined" sx={{ mt: 4, mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Your Salary Breakdown
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong style={{ color: '#28a745' }}>Gross Salary:</strong> {formatCurrency(breakdown.grossSalary)}
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="body1">
                      <strong style={{ color: '#FF0000' }}>Federal Tax (37%):</strong> {formatCurrency(breakdown.federalTax)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                  <Typography variant="body1">
                    <strong style={{ color: '#FF0000' }}>State Tax ({(stateTaxRates[userState] * 100).toFixed(2)}%):</strong> {formatCurrency(breakdown.stateTax)}
                  </Typography>
                  </Grid>
                </Grid>
            <Typography variant="body1">
              <strong style={{ color: '#28a745' }}>Net Income:</strong> {formatCurrency(breakdown.netIncome)}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Based on your net income, your comparable fine would be:
            </Typography>
            <Typography variant="h6" sx={{ mt: 2, color: '#FF0000' }}>
              <strong>{formatCurrency(breakdown.calculatedFine.toFixed(2))}</strong>
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}

export default UserInput;
