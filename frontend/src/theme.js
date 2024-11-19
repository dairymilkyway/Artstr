// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
      primary: {
        main: '#1db954', // Green
        light: '#66eb77', // Lighter green for hover states
        dark: '#188e3c',  // Darker green
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#181413', // Dark Chocolate
        light: '#43302e', // Lighter chocolate for hover states
        dark: '#0f0a07',  // Darker chocolate
        contrastText: '#ffffff',
      },
      background: {
        default: '#ffffff', // White background
      },
      greey: {
        main: '#3e3735', // Light grey
      }
    },
  });
  

export default theme;
