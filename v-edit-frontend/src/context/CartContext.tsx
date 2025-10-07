import React, { createContext, useContext, useMemo, useState } from 'react'

export type CartItem =
  | { id: string; type: 'template'; title: string; price: number }
  | { id: string; type: 'folder'; title: string; price: number }
  | { id: string; type: 'picture-template'; title: string; price: number }
  | { id: string; type: 'picture-folder'; title: string; price: number }

type CartContextType = {
  items: CartItem[]
  couponCode: string
  setCouponCode: (c: string) => void
  appliedCoupon: any
  setAppliedCoupon: (coupon: any) => void
  discount: number
  setDiscount: (amount: number) => void
  addItem: (item: CartItem) => void
  removeItem: (id: string, type: 'template' | 'folder' | 'picture-template' | 'picture-folder') => void
  clear: () => void
  subtotal: number
  total: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [discount, setDiscount] = useState(0)

  function addItem(item: CartItem) {
    console.log('CartContext: Adding item to cart:', item);
    setItems((prev) => {
      const exists = prev.find((i) => i.id === item.id && i.type === item.type)
      if (exists) {
        console.log('CartContext: Item already exists in cart');
        return prev
      }
      console.log('CartContext: Adding new item to cart');
      return [...prev, item]
    })
  }

  function removeItem(id: string, type: 'template' | 'folder' | 'picture-template' | 'picture-folder') {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.type === type)))
  }

  function clear() {
    setItems([])
    setCouponCode('')
    setAppliedCoupon(null)
    setDiscount(0)
  }

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price, 0), [items])
  const total = useMemo(() => Math.max(0, subtotal - discount), [subtotal, discount])

  return (
    <CartContext.Provider value={{ 
      items, 
      couponCode, 
      setCouponCode, 
      appliedCoupon, 
      setAppliedCoupon, 
      discount, 
      setDiscount, 
      addItem, 
      removeItem, 
      clear, 
      subtotal,
      total
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}


