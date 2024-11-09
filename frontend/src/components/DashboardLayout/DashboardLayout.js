import React, { useState } from 'react'
import SidebarComponent from './../SidebarComponent/SidebarComponent';
import NavTopComponent from '../NavTopComponent/NavTopComponent';
import { Outlet } from 'react-router-dom';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  console.log('Layouttttt');


  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };
  return (
    <div className='container-fluid m-0'>


      <div className="sidebar-left row m-0 p-0 ">

        <SidebarComponent />

        <div className="navbar-right col p-0 m-0">
          <NavTopComponent />
          <main className="content-wrapper border border-2">
            <div className="content-scroll">
              {children ? children : <Outlet />}
            </div>
          </main>
        </div>

      </div>

    </div>
  );
}

export default DashboardLayout