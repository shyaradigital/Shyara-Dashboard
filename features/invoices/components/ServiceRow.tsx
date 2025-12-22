"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Service } from "../types/invoice"
import { formatCurrencyNumber } from "../utils/formatters"

interface ServiceRowProps {
  service: Service
  index: number
  onUpdate: (id: string, field: keyof Service, value: string | number) => void
  onRemove: (id: string) => void
  canRemove: boolean
}

export function ServiceRow({ service, index, onUpdate, onRemove, canRemove }: ServiceRowProps) {
  return (
    <tr className="border-b">
      <td className="p-2 text-center text-sm whitespace-nowrap">{index + 1}</td>
      <td className="p-2">
        <Input
          placeholder="Service description"
          value={service.description}
          onChange={(e) => onUpdate(service.id, "description", e.target.value)}
          className="w-full min-w-[150px]"
        />
      </td>
      <td className="p-2">
        <Input
          type="number"
          min="0"
          step="0.01"
          placeholder="Qty"
          value={service.quantity || ""}
          onChange={(e) => onUpdate(service.id, "quantity", parseFloat(e.target.value) || 0)}
          className="w-16 sm:w-20 text-center"
        />
      </td>
      <td className="p-2">
        <Input
          type="number"
          min="0"
          step="0.01"
          placeholder="Rate"
          value={service.rate || ""}
          onChange={(e) => onUpdate(service.id, "rate", parseFloat(e.target.value) || 0)}
          className="w-24 sm:w-28 text-right"
        />
      </td>
      <td className="p-2">
        <Input
          type="number"
          min="0"
          max="100"
          step="0.01"
          placeholder="Disc %"
          value={service.discount || ""}
          onChange={(e) => onUpdate(service.id, "discount", parseFloat(e.target.value) || 0)}
          className="w-20 sm:w-24 text-center"
        />
      </td>
      <td className="p-2 text-right text-sm font-medium whitespace-nowrap">
        ₹ {formatCurrencyNumber(service.amount)}
      </td>
      <td className="p-2 w-10">
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(service.id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            aria-label="Remove service"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </td>
    </tr>
  )
}

