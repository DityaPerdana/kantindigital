"use client"

import { createClient } from '@/utils/supabase/client'
import React, { createContext, useContext, useEffect, useState } from 'react'

interface CartItem {
  menuid: number
  menuname: string
  price: number
  quantity: number
  stok: number
  image_url: string
  category: {
    categoryid: number
    categoryname: string
  } | null
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (menuid: number) => void
  updateQuantity: (menuid: number, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Load cart from database on mount
  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          quantity,
          menu:menu_id (
            menuid,
            menuname,
            price,
            stok,
            image_url,
            category:category_id (
              categoryid,
              categoryname
            )
          )
        `)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error loading cart:', error)
      } else if (data) {
        // FIX: Explicitly map the properties to create a valid CartItem[]
        const items: CartItem[] = data.map(item => {
          const menuData = item.menu as any; // Assert type to handle Supabase's complex return type

          return {
            // Properties from the nested 'menu' object
            menuid: menuData.menuid,
            menuname: menuData.menuname,
            price: menuData.price,
            stok: menuData.stok,
            image_url: menuData.image_url,
            category: menuData.category,
            // Property from the 'cart_items' table
            quantity: item.quantity,
          };
        });
        setCartItems(items);
      }
    } catch (error) {
      console.error('Error loading cart:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addToCart = async (item: CartItem) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Please login to add items to cart')
      return
    }

    const existingItem = cartItems.find(cartItem => cartItem.menuid === item.menuid)
    
    if (existingItem) {
      // Update quantity if item already exists
      const newQuantity = Math.min(existingItem.quantity + item.quantity, item.stok)
      updateQuantity(item.menuid, newQuantity)
    } else {
      // Add new item
      try {
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            menu_id: item.menuid,
            quantity: item.quantity
          })

        if (error) throw error

        setCartItems([...cartItems, item])
      } catch (error) {
        console.error('Error adding to cart:', error)
        alert('Failed to add item to cart')
      }
    }
  }

  const removeFromCart = async (menuid: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('menu_id', menuid)

      if (error) throw error

      setCartItems(cartItems.filter(item => item.menuid !== menuid))
    } catch (error) {
      console.error('Error removing from cart:', error)
      alert('Failed to remove item from cart')
    }
  }

  const updateQuantity = async (menuid: number, quantity: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (quantity <= 0) {
      removeFromCart(menuid)
      return
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('menu_id', menuid)

      if (error) throw error

      setCartItems(cartItems.map(item => 
        item.menuid === menuid ? { ...item, quantity } : item
      ))
    } catch (error) {
      console.error('Error updating quantity:', error)
      alert('Failed to update quantity')
    }
  }

  const clearCart = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error

      setCartItems([])
    } catch (error) {
      console.error('Error clearing cart:', error)
      alert('Failed to clear cart')
    }
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      isLoading
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}