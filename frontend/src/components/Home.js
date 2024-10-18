import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';

function Home() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 10 }}>
      <Typography variant="h3" gutterBottom>
        Welcome to the ProPenalty.com!
      </Typography>
      <Typography variant="body1" gutterBottom>
        This site allows you to compare professional sports player salaries and fines to your own
        income. Get started by selecting a league and player and then entering the details.
      </Typography>
      <Box mt={4}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          onClick={() => navigate('/player-selection')}
        >
          Get Started!
        </Button>
      </Box>
    </Container>
  );
}

export default Home;
