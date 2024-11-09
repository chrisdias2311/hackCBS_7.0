import React from 'react'

const SidebarCopy = () => {
    return (
        <div>
            <div className="sidebar  d-flex flex-column justify-content-between">

                <ul className="sidebar-nav px-md-4 px-1">
                    <li>
                        <NavLink to="/dashboard/home" activeclassname="active"  >
                            <i className="bi bi-house"></i>
                            Home
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/dashboard/meetings" activeclassname="active">
                            <i className="bi bi-mic"></i>
                            Meetings
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/dashboard/reports" activeclassname="active">
                            <i className="bi bi-bar-chart"></i>
                            Reports
                        </NavLink>
                    </li>

                    {/* <li>
    <NavLink to="/dashboard/feedback" activeclassname="active">
      Feedback
    </NavLink>
  </li> */}

                    <li>
                        <NavLink to="/dashboard/setting" activeclassname="active">
                            <i className="bi bi-gear"></i>
                            Settings
                        </NavLink>
                    </li>
                </ul>

                <div className="contact-us-btn-sidebar d-flex justify-content-center p-2 align-items-center">
                    <button type='button' className='btn btn-primary'>
                        <i className="bi bi-telephone"></i>
                        Contact us
                    </button>
                </div>
                {/* <div className="contact-us">
  <Link to="/contact">Contact Us</Link>
</div> */}
            </div>
        </div>
    )
}

export default SidebarCopy