"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SearchAndFiltersProps {
  currentSearch: string
  currentSort: string
}

export function SearchAndFilters({ currentSearch, currentSort }: SearchAndFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-4 h-4" />
        <Input
          placeholder="Cari menu makanan..."
          defaultValue={currentSearch}
          onChange={(e) => updateSearchParams("search", e.target.value)}
          className="pl-10 text-black"
        />
      </div>
      <Select value={currentSort} onValueChange={(value) => updateSearchParams("sort", value)}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Urutkan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Nama A-Z</SelectItem>
          <SelectItem value="price-low">Harga Terendah</SelectItem>
          <SelectItem value="price-high">Harga Tertinggi</SelectItem>
          <SelectItem value="stock">Stok Terbanyak</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
