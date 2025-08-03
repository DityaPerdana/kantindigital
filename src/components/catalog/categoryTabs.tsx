"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

interface CategoryTabsProps {
  categories: string[]
  currentCategory: string
}

export function CategoryTabs({ categories, currentCategory }: CategoryTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateCategory = (category: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (category === "Semua") {
      params.delete("category")
    } else {
      params.set("category", category)
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {categories.map((category) => (
        <Button
          key={category}
          variant={currentCategory === category ? "default" : "outline"}
          onClick={() => updateCategory(category)}
          className="rounded-full bg-amber-500 text-black hover:text-blue-950"
        >
          {category}
        </Button>
      ))}
    </div>
  )
}
