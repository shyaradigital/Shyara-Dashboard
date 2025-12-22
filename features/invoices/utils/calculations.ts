import type { Service } from "../types/invoice"

/**
 * Calculate amount for a single service row
 * Formula: (quantity × rate) × (1 - discount/100)
 */
export function calculateServiceAmount(quantity: number, rate: number, discount: number): number {
  const subtotal = quantity * rate
  const discountAmount = subtotal * (discount / 100)
  return subtotal - discountAmount
}

/**
 * Calculate subtotal (sum of all service amounts)
 */
export function calculateSubtotal(services: Service[]): number {
  return services.reduce((sum, service) => sum + service.amount, 0)
}

/**
 * Calculate total discount amount
 */
export function calculateTotalDiscount(services: Service[]): number {
  return services.reduce((sum, service) => {
    const subtotal = service.quantity * service.rate
    const discountAmount = subtotal * (service.discount / 100)
    return sum + discountAmount
  }, 0)
}

/**
 * Calculate grand total (subtotal - total discount)
 */
export function calculateGrandTotal(subtotal: number, totalDiscount: number): number {
  return subtotal - totalDiscount
}

/**
 * Recalculate all amounts for a service
 */
export function recalculateService(service: Service): Service {
  return {
    ...service,
    amount: calculateServiceAmount(service.quantity, service.rate, service.discount),
  }
}

