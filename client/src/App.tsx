import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Kanban from "./pages/Kanban";
import ListaPrazo from "./pages/ListaPrazo";
import Exportar from "./pages/Exportar";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path={"/"} component={Kanban} />
        <Route path={"/lista-prazo"} component={ListaPrazo} />
        <Route path={"/exportar"} component={Exportar} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
