"use client"

import { styled } from '@mui/material/styles';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import MenuContent from './MenuContent';
import {useState} from "react"
import SearchBar from '../common/SearchBar'
import {Tab} from '../../constants/SideMenu.ts';
const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

export default function SideMenu() {

    const [value,setValue] = useState<string>();
    const onChange = (e : any) => {setValue(e.target.value)}
    const onSubmit = () => {alert("submitted")}
    const placeholder = "";
    const fullWidth = false;

    const [tab, setTab] = useState<Tab>();

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          mt: 'calc(var(--template-frame-height, 0px) + 4px)',
          p: 1.5,
        }}
      >
        <SearchBar value={value} onChange={onChange} onSubmit={onSubmit} placeholder={placeholder} fullWidth={fullWidth} />
      </Box>
      <Divider />
      <Box
        sx={{
          overflow: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <MenuContent tab={tab} setTab={setTab} />
      </Box>
    </Drawer>
  );
}
