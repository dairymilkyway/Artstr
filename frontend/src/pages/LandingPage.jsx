// landingpage.jsx
import React from 'react';
import { 
  Box,
  Button,
  Container,
  Typography,
  useTheme,
  createTheme,
  ThemeProvider 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';


const ArtstrTheme = createTheme({
  palette: {
    primary: {
      main: '#1DB954', 
    },
    background: {
      default: '#121212',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B3B3B3',
    },
  },
});

// Styled components
const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '500px',
  padding: '10px 32px',
  fontSize: '16px',
  fontWeight: 'bold',
  textTransform: 'none',
  '&:hover': {
    transform: 'scale(1.04)',
    backgroundColor: theme.palette.primary.main,
  },
}));

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={ArtstrTheme}>
      <Box
        sx={{
          bgcolor: 'background.default',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Container maxWidth="sm">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 4,
            }}
          >
            <img src={logo} alt="Logo" style={{ height: 400}} />
            
            <Typography
              variant="h2"
              color="text.primary"
              fontWeight="bold"
              gutterBottom
            >
              ARTSTR
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              gutterBottom
            >
              Buy merchandise from your favorite artists
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <StyledButton
                variant="contained"
                onClick={() => navigate('/register')}
              >
                Sign up free
              </StyledButton>
              
              <StyledButton
                variant="outlined"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'transparent',
                  },
                }}
                onClick={() => navigate('/login')}
              >
                Log in
              </StyledButton>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default LandingPage;