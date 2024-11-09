import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './SidebarComponent.css';

// Lucid react icons
import { LayoutDashboard, LogOut } from 'lucide-react';
import { Presentation } from 'lucide-react';
import { ChartNoAxesCombined } from 'lucide-react';
import { Settings } from 'lucide-react';
import { Headset } from 'lucide-react';
import { ClipboardMinus } from 'lucide-react';

const SidebarComponent = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard/home' },
    { icon: <Presentation size={20} />, label: 'Meetings', path: '/dashboard/meetings' },
    { icon: <ClipboardMinus size={20} />, label: 'Assesments', path: '/dashboard/assesments' },
    { icon: <ChartNoAxesCombined size={20} />, label: 'Reports', path: '/dashboard/reports' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/dashboard/setting' },
  ];

  const bottomItems = [
    { icon: <Headset size={20} />, label: 'Contact us', path: '/dashboard/contact-us' },
    { icon: <LogOut size={20} />, label: 'Log out' },
  ];

  return (

    <div className={`${isExpanded ? 'col-md-2' : 'col-auto'} m-0 p-0 `}>
      <div className="sidebar-wrapper">

        <div className="sidebar-content p-0 m-0 d-flex flex-column">

          {/* Logo */}
          <div className="logo-section">
            <div className="logo-container">

              <div className="logo-circle">
                <span>ML</span>
              </div>

              <span className="logo-text">Moodlens</span>

            </div>
          </div>


          {/* Main Navigation */}
          <nav className="main-nav">

            <ul className="nav-list">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <NavLink
                    to={`${item.path}`}
                    className={`nav-link ${item.active ? 'active' : ''}`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bottom Navigation */}
          <div className="bottom-nav">
            <ul className="nav-list">
              {bottomItems.map((item, index) => (
                <li key={index}>
                  <NavLink
                    to={`${item.path}`}
                    className={`nav-link ${item.active ? 'active' : ''}`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>



    </div >

  );
}

export default SidebarComponent;
