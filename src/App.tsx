import { ThemeProvider } from './context/ThemeContext';
import { Hero } from './components/layout/Hero';
import { Services } from './components/layout/Services';
import { About } from './components/layout/About';
import { Projects } from './components/layout/Projects';
import { Team } from './components/layout/Team';
import { Testimonials } from './components/layout/Testimonials';
import { Process } from './components/layout/Process';
import { CTA } from './components/layout/CTA';
import { Contact } from './components/layout/Contact';
import { ProjectsPage } from './pages/ProjectsPage';
import { LoginPage } from './pages/LoginPage';
import { MainLayout } from './components/layout/MainLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { UsersManagement } from './pages/admin/UsersManagement';
import { ServicesManagement } from './pages/admin/ServicesManagement';
import { ProjectsManagement } from './pages/admin/ProjectsManagement';
import { TeamManagement } from './pages/admin/TeamManagement';
import { TestimonialsManagement } from './pages/admin/TestimonialsManagement';
import { AboutManagement } from './pages/admin/AboutManagement';
import { BookingsManagement } from './pages/admin/BookingsManagement';
import { ContactsManagement } from './pages/admin/ContactsManagement';
import { Settings } from './pages/admin/Settings';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const HomePage = () => (
  <main className="relative z-10">
    <Hero />
    <Services />
    <About />
    <Projects />
    <Team />
    <Testimonials />
    <Process />
    <CTA />
    <Contact />
  </main>
);

export default function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="light" storageKey="editors-room-theme">
        <div className="min-h-screen bg-background font-sans antialiased selection:bg-primary/30 selection:text-primary-foreground relative overflow-hidden">
          <Routes>
            {/* Frontend Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/projects" element={<ProjectsPage />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="about" element={<AboutManagement />} />
              <Route path="services" element={<ServicesManagement />} />
              <Route path="projects" element={<ProjectsManagement />} />
              <Route path="team" element={<TeamManagement />} />
              <Route path="testimonials" element={<TestimonialsManagement />} />
              <Route path="bookings" element={<BookingsManagement />} />
              <Route path="contacts" element={<ContactsManagement />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </div>
      </ThemeProvider>
    </Router>
  );
}
