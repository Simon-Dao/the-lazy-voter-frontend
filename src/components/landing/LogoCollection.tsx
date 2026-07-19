'use client'

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { useColorScheme } from '@mui/material/styles';


const logos = [
  "logos\\fec_logo.webp",
  "logos\\congressdotgov_logo.png",
  "logos\\legiscan_logo.png"
];

const logoStyle = {
  width: '100px',
  height: '100px',
  margin: '0 32px',
  borderRadius: '10px',
};

export default function LogoCollection() {
  const { mode, systemMode } = useColorScheme();

  return (
    <Box id="logoCollection" sx={{ py: 4 }}>
      <Typography
        component="p"
        variant="subtitle2"
        align="center"
        sx={{ color: 'text.secondary' }}
      >
        This website displays data from the following public data sources
      </Typography>
      <Grid container sx={{ justifyContent: 'center', mt: 0.5, opacity: 0.85 }}>
        {logos.map((logo, index) => (
          <Grid key={index}>
            <img
              src={logo}
              alt={`Fake company number ${index + 1}`}
              style={logoStyle}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
