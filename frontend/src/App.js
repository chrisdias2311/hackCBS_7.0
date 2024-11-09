import { useEffect } from 'react';
import './App.css';

function App() {

  useEffect(() => {
    if (window.location.pathname === '/') {
      window.location.href = '/login';
    }
  }, []);

  return (
    <div className="App">
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        {/* <=======================Test Pages====================> */}
        {/* <=======================Test Pages====================> */}
        <Route path='/view' element={<ChrisViewAnalytics />} />
        <Route path='/*' element={<ErrorPage />} />

        {/* Nested layout */}
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path='/dashboard' element={<DashboardLayout />}>
            <Route path='home' element={<Home />} />
            <Route path='meetings' element={<MeetingPage />} />
            <Route path='assesments' element={<AssesmentsPage />} />
            <Route path='reports' element={<ReportsPage />} />
          </Route>
        </Route>


        {/* Video Pages */}


      </Routes>

    </div>
  );
}

export default App;
