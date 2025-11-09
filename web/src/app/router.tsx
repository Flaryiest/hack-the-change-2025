import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';

import IndexPage from '@/pages/home/index';
import DemoPage from '@/pages/demo/demo';
import VillagesPage from '@/pages/villages/villages';
import LoginPage from '@/pages/login/login';
import DashboardPage from '@/pages/dashboard/dashboard';

const router = createBrowserRouter(createRoutesFromElements(<>
  <Route path="/" element={<IndexPage/>}>
  </Route>
  <Route path="/demo" element={<DemoPage/>}>
  </Route>
  <Route path="/villages" element={<VillagesPage/>}>
  </Route>
  <Route path="/login" element={<LoginPage/>}>
  </Route>
  <Route path="/dashboard" element={<DashboardPage/>}>
  </Route>
</>));

export default router;
