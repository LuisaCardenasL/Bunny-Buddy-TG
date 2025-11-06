import { Routes, Route, Link } from 'react-router-dom';
import React from 'react';
import { AppBar, Toolbar, Box, Typography } from '@mui/material';
import LandingPage from './LandingPage';
import logo from '/bunnycon.svg';
import ChatPage from './ChatPage';

export default function App() {
  return (
    <div>
      <AppBar position="sticky" sx={{ backgroundColor: "#3a5a60" }} elevation={1}>
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <img src={logo} alt="Logo" style={{ width: '40px', marginRight: '10px' }} />
              <Typography
                variant="h6"
                sx={{
                  color: '#fcefe3', // tono beige claro como el conejo
                  fontFamily: 'cursive', // usa tu fuente personalizada aquí si la tienes
                  fontWeight: 'bold',
                  fontSize: '1.8rem',
                }}
              >
                BunnyBuddy
              </Typography>
            </Link>
          </Box>
        </Toolbar>
      </AppBar>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/ChatPage" element={<ChatPage />} />
      </Routes>
    </div>
  );
}
