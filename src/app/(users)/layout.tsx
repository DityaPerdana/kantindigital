// app/catalog/layout.tsx
import { CartProvider } from "@/utils/cartContext"

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CartProvider>{children}</CartProvider>
}