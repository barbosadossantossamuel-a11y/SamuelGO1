import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { Bell, ChevronRight, LayoutDashboard, LogOut, Menu, Palette, Package, QrCode, Settings, ShoppingBag, Store, Truck, Utensils, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const items = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/dashboard/cardapio", label: "Meu cardápio", icon: Utensils },
  { href: "/dashboard/modelos", label: "Modelos", icon: Palette },
  { href: "/dashboard/produtos", label: "Produtos", icon: Package },
  { href: "/dashboard/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/dashboard/estabelecimento", label: "Estabelecimento", icon: Store },
  { href: "/dashboard/entrega", label: "Entrega e horários", icon: Truck },
  { href: "/dashboard/qrcode", label: "QR Code", icon: QrCode },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#f6f4ef]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ef6b4b] border-t-transparent" /></div>;
  if (!user) return <div className="min-h-screen bg-[#111315] px-5 py-10 text-white"><div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center text-center"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ef6b4b] text-xl font-bold">P</span><h1 className="display-serif mt-6 text-4xl">Seu painel está a um login.</h1><p className="mt-4 text-sm leading-relaxed text-white/55">Entre com sua conta Manus para criar, editar e publicar o cardápio do seu negócio.</p><button onClick={() => startLogin()} className="button-pop mt-8 rounded-full bg-[#ef6b4b] px-7 py-4 text-sm font-bold">Entrar no PedidoGO <ChevronRight className="ml-1 inline h-4 w-4" /></button><Link href="/" className="mt-5 text-sm text-white/45 hover:text-white">Voltar para a página inicial</Link></div></div>;
  return <div className="min-h-screen bg-[#f6f4ef] text-[#111315]">
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-black/8 bg-[#151719] text-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-20 items-center justify-between border-b border-white/8 px-6"><Link href="/dashboard" className="flex items-center gap-3" onClick={()=>setOpen(false)}><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ef6b4b] font-bold">P</span><span className="font-bold tracking-[-.04em]">Pedido<span className="text-[#f1bd69]">GO</span></span></Link><button onClick={()=>setOpen(false)} className="text-white/50 lg:hidden"><X className="h-5 w-5" /></button></div>
      <div className="flex-1 overflow-y-auto px-3 py-6"><p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[.18em] text-white/30">Workspace</p><nav className="space-y-1">{items.map(item => { const Icon=item.icon; const active=location===item.href || (item.href!=="/dashboard" && location.startsWith(item.href)); return <Link key={item.href} href={item.href} onClick={()=>setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active ? "bg-[#ef6b4b] text-white shadow-lg shadow-[#ef6b4b]/10" : "text-white/55 hover:bg-white/6 hover:text-white"}`}><Icon className="h-[18px] w-[18px]" /><span>{item.label}</span>{active && <ChevronRight className="ml-auto h-4 w-4" />}</Link>})}</nav></div>
      <div className="border-t border-white/8 p-4"><div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1bd69] text-sm font-bold text-[#111315]">{user.name?.charAt(0).toUpperCase() ?? "P"}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{user.name ?? "Meu perfil"}</p><p className="truncate text-xs text-white/35">{user.email ?? "Conta ativa"}</p></div></div><button onClick={logout} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-white/40 transition hover:text-white"><LogOut className="h-4 w-4" /> Sair da conta</button></div>
    </aside>
    {open && <button onClick={()=>setOpen(false)} className="fixed inset-0 z-40 bg-black/45 lg:hidden" aria-label="Fechar menu" />}
    <div className="lg:pl-[270px]"><header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-black/8 bg-[#f6f4ef]/90 px-4 backdrop-blur sm:px-8"><div className="flex items-center gap-3"><button onClick={()=>setOpen(true)} className="rounded-xl border border-black/10 p-2 lg:hidden"><Menu className="h-5 w-5" /></button><div className="hidden items-center gap-2 text-sm text-black/45 sm:flex"><span>Workspace</span><ChevronRight className="h-3.5 w-3.5" /><span className="font-semibold text-black">{items.find(item=>location===item.href)?.label ?? "PedidoGO"}</span></div></div><div className="flex items-center gap-3"><a href="/m/pedido-go-demo" target="_blank" rel="noreferrer" className="hidden rounded-full bg-white px-4 py-2 text-xs font-bold shadow-sm sm:block">Ver cardápio <ChevronRight className="ml-1 inline h-3.5 w-3.5" /></a><button className="relative rounded-full border border-black/10 p-2 text-black/50"><Bell className="h-4 w-4" /><span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#ef6b4b]" /></button></div></header><main className="container py-7 sm:py-10">{children}</main></div>
  </div>;
}
