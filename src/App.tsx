import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';

// Public & Landing
import { PortalLanding } from './pages/PortalLanding';

// Admin Portal
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminPortal } from './pages/admin/AdminPortal';

// Teacher Portal
import { TeacherLogin } from './pages/teacher/TeacherLogin';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherClassrooms } from './pages/teacher/TeacherClassrooms';
import { TeacherActivity } from './pages/teacher/TeacherActivity';
import { TeacherProfile } from './pages/teacher/TeacherProfile';

// Curriculum Lesson Pages
import { CreateLesson } from './pages/CreateLesson';
import { LessonWorkspace } from './pages/LessonWorkspace';
import { LessonHistory } from './pages/LessonHistory';
import { LessonView } from './pages/LessonView';

// Student Portal
import { StudentJoin } from './pages/StudentJoin';
import { StudentClassDashboard } from './pages/student/StudentClassDashboard';
import { StudentClassLessonView } from './pages/student/StudentClassLessonView';

export function App() {
  const [dataVersion, setDataVersion] = useState(0);

  const handleDataChanged = () => {
    setDataVersion((v) => v + 1);
  };

  return (
    <BrowserRouter>
      <AppLayout onDataReset={handleDataChanged}>
        <Routes>
          {/* ========================================================= */}
          {/* 1. ENTRY PAGE — 3-PORTAL SELECTOR                         */}
          {/* ========================================================= */}
          <Route path="/" element={<PortalLanding />} />

          {/* ========================================================= */}
          {/* 2. MASTER ADMIN PORTAL                                   */}
          {/* ========================================================= */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="/admin/teachers" element={<AdminPortal />} />
          <Route path="/admin/students" element={<AdminPortal />} />
          <Route path="/admin/classrooms" element={<AdminPortal />} />
          <Route path="/admin/lessons" element={<AdminPortal />} />
          <Route path="/admin/activity" element={<AdminPortal />} />

          {/* ========================================================= */}
          {/* 3. TEACHER PORTAL                                        */}
          {/* ========================================================= */}
          <Route path="/teacher/login" element={<TeacherLogin />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route
            path="/teacher/create"
            element={<CreateLesson onLessonCreated={handleDataChanged} />}
          />
          <Route
            path="/teacher/lessons"
            element={
              <LessonHistory
                dataVersion={dataVersion}
                onLessonDeleted={handleDataChanged}
              />
            }
          />
          <Route
            path="/teacher/workspace/:id"
            element={<LessonWorkspace onLessonUpdated={handleDataChanged} />}
          />
          <Route path="/teacher/classrooms" element={<TeacherClassrooms />} />
          <Route path="/teacher/classrooms/:id" element={<TeacherClassrooms />} />
          <Route path="/teacher/activity" element={<TeacherActivity />} />
          <Route path="/teacher/profile" element={<TeacherProfile />} />

          {/* ========================================================= */}
          {/* 4. STUDENT PORTAL                                        */}
          {/* ========================================================= */}
          <Route path="/student/join" element={<StudentJoin />} />
          <Route path="/student/class/:classId" element={<StudentClassDashboard />} />
          <Route
            path="/student/class/:classId/lesson/:lessonId"
            element={<StudentClassLessonView />}
          />
          <Route path="/student/lesson/:code" element={<StudentClassLessonView />} />

          {/* ========================================================= */}
          {/* 5. BACKWARD-COMPATIBLE WORKSPACE & HISTORY SHORTCUTS      */}
          {/* ========================================================= */}
          <Route path="/dashboard" element={<Navigate to="/teacher" replace />} />
          <Route
            path="/create"
            element={<CreateLesson onLessonCreated={handleDataChanged} />}
          />
          <Route
            path="/workspace/:id"
            element={<LessonWorkspace onLessonUpdated={handleDataChanged} />}
          />
          <Route
            path="/lesson/:id/edit"
            element={<LessonWorkspace onLessonUpdated={handleDataChanged} />}
          />
          <Route
            path="/history"
            element={
              <LessonHistory
                dataVersion={dataVersion}
                onLessonDeleted={handleDataChanged}
              />
            }
          />
          <Route path="/lesson/:id" element={<LessonView />} />
          <Route path="/classrooms" element={<TeacherClassrooms />} />
          <Route path="/classrooms/:id" element={<TeacherClassrooms />} />
          <Route path="/join" element={<StudentJoin />} />
          <Route path="/join/:code" element={<StudentJoin />} />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
