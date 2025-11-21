import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import LandingPage from './pages/LandingPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import EmployeeDashboard from './pages/employee/EmployeeDashboard'
import SkillAssessment from './pages/employee/SkillAssessment'
import AssessmentResults from './pages/employee/AssessmentResults'
import LearningPath from './pages/employee/LearningPath'
import TestList from './pages/employee/TestList'
import TestInterface from './pages/employee/TestInterface'
import PromotionRequest from './pages/employee/PromotionRequest'
import AdminPromotions from './pages/admin/AdminPromotions'
import EmployeeList from './pages/admin/EmployeeList'
import RoleSkillManager from './pages/admin/RoleSkillManager'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

function DashboardRouter() {
  const { role } = useAuth()

  if (role === 'admin') {
    return <AdminDashboard />
  }
  return <EmployeeDashboard />
}

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10B981',
              color: 'white',
            },
            iconTheme: {
              primary: 'white',
              secondary: '#10B981',
            },
          },
          error: {
            style: {
              background: '#EF4444',
              color: 'white',
            },
            iconTheme: {
              primary: 'white',
              secondary: '#EF4444',
            },
          },
        }}
      />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route element={<ProtectedRoute allowedRoles={['admin', 'employee']} />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardRouter />} />

              {/* Admin Routes */}
              <Route path="/admin/employees" element={<EmployeeList />} />
              <Route path="/admin/roles" element={<RoleSkillManager />} />
              <Route path="/admin/promotions" element={<AdminPromotions />} />

              {/* Employee Routes */}
              <Route path="/employee/skills" element={<SkillAssessment />} />
              <Route path="/employee/results" element={<AssessmentResults />} />
              <Route path="/employee/learning" element={<LearningPath />} />
              <Route path="/employee/tests" element={<TestList />} />
              <Route path="/employee/tests/:skillId" element={<TestInterface />} />
              <Route path="/employee/promotions" element={<PromotionRequest />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
