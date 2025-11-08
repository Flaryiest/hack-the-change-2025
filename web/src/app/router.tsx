import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';

import IndexPage from '@/pages/home/index';
import DemoPage from '@/pages/demo/demo';
import VillagesPage from '@/pages/villages/villages';

const router = createBrowserRouter(createRoutesFromElements(<>
  <Route path="/" element={<IndexPage/>}>
  </Route>
  <Route path="/demo" element={<DemoPage/>}>
  </Route>
  <Route path="/villages" element={<VillagesPage/>}>
  </Route>
</>));

export default router;
