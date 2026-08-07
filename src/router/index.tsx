import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Loading from "@/components/Loading";
import BasicLayout from "@/layouts/BasicLayout";
import NotFound from "@/pages/exception/404";
import { AuthGuard } from "./guards";
import { type AppRouteObject, layoutRoutes } from "./routes";

const Login = lazy(() => import("@/pages/login"));

function renderRoutes(routes?: AppRouteObject[]) {
  return routes?.map((route) => (
    <Route key={route.path} path={route.path} element={route.element}>
      {route.children ? renderRoutes(route.children) : null}
    </Route>
  ));
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <AuthGuard>
                <BasicLayout />
              </AuthGuard>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            {renderRoutes(layoutRoutes)}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
