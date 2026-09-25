export type Template = {
  id: string;
  name: string;
  category: string;
  description: string;
  colors: string[];
  image: string;
  accent: string;
  badge?: string;
};

export const templates: Template[] = [
  { id: "burger-dark", name: "Burger Dark", category: "Hamburgueria", description: "Contraste alto, apetite imediato e destaque para o produto.", colors: ["#121212", "#ee5c3b", "#f6f1e8"], image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85", accent: "#ee5c3b", badge: "Mais escolhido" },
  { id: "burger-premium", name: "Burger Premium", category: "Hamburgueria", description: "Uma leitura sofisticada para hamburguerias artesanais.", colors: ["#1e1b18", "#d8aa4a", "#f2e4cc"], image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=85", accent: "#d8aa4a" },
  { id: "acai-tropical", name: "Açaí Tropical", category: "Açaíteria", description: "Colorido, leve e feito para vender adicionais.", colors: ["#5c2d78", "#e64b88", "#e0edc8"], image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=900&q=85", accent: "#e64b88" },
  { id: "acai-fresh", name: "Açaí Fresh", category: "Açaíteria", description: "Uma estética jovem para marcas mais naturais.", colors: ["#8d7bbd", "#a9d9a4", "#fffdf7"], image: "https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?auto=format&fit=crop&w=900&q=85", accent: "#8d7bbd" },
  { id: "pizza-italiana", name: "Pizza Italiana", category: "Pizzaria", description: "A tradição italiana com uma vitrine que abre o apetite.", colors: ["#9c3d2e", "#57765c", "#f4e3bc"], image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85", accent: "#9c3d2e" },
  { id: "pizza-premium", name: "Pizza Premium", category: "Pizzaria", description: "Vinho, dourado e detalhes para um ticket maior.", colors: ["#242021", "#9c6b55", "#e4ba73"], image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=85", accent: "#9c6b55" },
  { id: "restaurante-caseiro", name: "Restaurante Caseiro", category: "Restaurante", description: "Acolhedor, organizado e com espaço para o prato do dia.", colors: ["#3d5a4a", "#f3e6cf", "#ad8059"], image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85", accent: "#3d5a4a" },
  { id: "restaurante-premium", name: "Restaurante Premium", category: "Restaurante", description: "Elegância para apresentar experiências gastronômicas.", colors: ["#4d262d", "#d5a65b", "#f4e9d4"], image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=85", accent: "#8e4551" },
  { id: "distribuidora", name: "Distribuidora", category: "Distribuidora", description: "Direto ao ponto para vender unidade, pacote ou caixa.", colors: ["#151515", "#f2c94c", "#f7f7f5"], image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=900&q=85", accent: "#f2c94c" },
  { id: "lanchonete", name: "Lanchonete", category: "Lanchonete", description: "Energético, colorido e perfeito para o movimento do dia.", colors: ["#eb7a3c", "#29231f", "#f7d45c"], image: "https://images.unsplash.com/photo-1521305916504-4a1121188589?auto=format&fit=crop&w=900&q=85", accent: "#eb7a3c" },
  { id: "food-truck", name: "Food Truck", category: "Food Truck", description: "Urbano, rápido e com cara de marca memorável.", colors: ["#e9bc42", "#202020", "#d54f3d"], image: "https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?auto=format&fit=crop&w=900&q=85", accent: "#e9bc42" },
  { id: "minimal-food", name: "Minimal Food", category: "Outros", description: "Branco, leve e flexível para qualquer negócio.", colors: ["#fbfaf7", "#202224", "#b9a68b"], image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=85", accent: "#b99e7e" },
];

export const categories = ["Todos", "Hamburgueria", "Açaíteria", "Pizzaria", "Restaurante", "Distribuidora", "Lanchonete", "Food Truck", "Outros"];

export const demoCategories = [
  { id: 1, name: "Favoritos da casa", icon: "★" },
  { id: 2, name: "Combos", icon: "✦" },
  { id: 3, name: "Porções", icon: "◒" },
  { id: 4, name: "Bebidas", icon: "◌" },
];

export const demoProducts = [
  { id: 1, categoryId: 1, name: "X-Bacon da casa", description: "Blend bovino 180g, cheddar cremoso, bacon crocante e molho especial.", price: 2890, promoPrice: 2490, imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=85", isFeatured: 1 },
  { id: 2, categoryId: 1, name: "X-Salada artesanal", description: "Blend bovino, queijo, alface, tomate e maionese da casa.", price: 2490, imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=700&q=85", isFeatured: 1 },
  { id: 3, categoryId: 2, name: "Combo Burger + fritas", description: "Seu burger favorito com batata rústica e bebida gelada.", price: 3590, imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=85", isFeatured: 0 },
  { id: 4, categoryId: 3, name: "Batata rústica", description: "Porção generosa com páprica defumada e molho da casa.", price: 1590, imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=85", isFeatured: 0 },
  { id: 5, categoryId: 4, name: "Refrigerante lata", description: "Lata bem gelada para acompanhar.", price: 690, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=700&q=85", isFeatured: 0 },
];

export const formatBRL = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
