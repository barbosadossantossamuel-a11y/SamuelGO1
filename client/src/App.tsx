import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import AuthPage from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Home from "@/pages/Home";
import Models from "@/pages/Models";
import Onboarding from "@/pages/Onboarding";
import Orders from "@/pages/Orders";
import Products from "@/pages/Products";
import PublicMenu from "@/pages/PublicMenu";
import Settings from "@/pages/Settings";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/login" component={AuthPage} />
    <Route path="/cadastro" component={AuthPage} />
    <Route path="/recuperar-senha" component={AuthPage} />
    <Route path="/onboarding" component={Onboarding} />
    <Route path="/dashboard" component={Dashboard} />
    <Route path="/dashboard/cardapio" component={Settings} />
    <Route path="/dashboard/modelos" component={Models} />
    <Route path="/dashboard/aparencia" component={Models} />
    <Route path="/dashboard/produtos" component={Products} />
    <Route path="/dashboard/categorias" component={Products} />
    <Route path="/dashboard/adicionais" component={Products} />
    <Route path="/dashboard/pedidos" component={Orders} />
    <Route path="/dashboard/estabelecimento" component={Settings} />
    <Route path="/dashboard/entrega" component={Settings} />
    <Route path="/dashboard/horarios" component={Settings} />
    <Route path="/dashboard/whatsapp" component={Settings} />
    <Route path="/dashboard/qrcode" component={Settings} />
    <Route path="/dashboard/plano" component={Settings} />
    <Route path="/dashboard/configuracoes" component={Settings} />
    <Route path="/m/:slug" component={PublicMenu} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
