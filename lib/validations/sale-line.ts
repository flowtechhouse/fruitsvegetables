/**
 * Sale line total calculation and validation.
 * Base: weight×price or count×price; Bya3a: per_unit (count×bya3aValue) or fixed (bya3aValue).
 * Total = base + bya3a
 */

export type SellingMode = "weight" | "piece" | "package";
export type Bya3aMode = "per_unit" | "fixed";

export interface SaleLineCalcInput {
  sellingMode: SellingMode;
  bya3aMode: Bya3aMode;
  price: number;
  bya3aValue: number;
  weight?: number | null;
  count?: number | null;
}

export function calculateSaleLineTotal(input: SaleLineCalcInput): number {
  const { sellingMode, bya3aMode, price, bya3aValue, weight = 0, count = 0 } = input;
  let base = 0;
  if (sellingMode === "weight" && weight && weight > 0) {
    base = weight * price;
  } else if ((sellingMode === "piece" || sellingMode === "package") && (count ?? 0) > 0) {
    base = (count ?? 0) * price;
  }
  let bya3a = 0;
  if (bya3aMode === "per_unit" && (count ?? 0) > 0) {
    bya3a = (count ?? 0) * bya3aValue;
  } else if (bya3aMode === "fixed") {
    bya3a = bya3aValue;
  }
  return Math.round((base + bya3a) * 100) / 100;
}

export function validateSaleLineForSubmit(input: {
  sellingMode: SellingMode;
  bya3aMode: Bya3aMode;
  weight?: number | null;
  count?: number | null;
}): string | null {
  const { sellingMode, bya3aMode, weight, count } = input;
  if (sellingMode === "weight") {
    if (weight == null || weight <= 0) return "الوزن مطلوب ويجب أن يكون أكبر من صفر عند البيع بالوزن.";
  } else if (sellingMode === "piece" || sellingMode === "package") {
    if (count == null || count <= 0) return "العدد مطلوب ويجب أن يكون أكبر من صفر.";
  }
  if (bya3aMode === "per_unit" && (count == null || count <= 0)) {
    return "العدد مطلوب للبيعة بالوحدة.";
  }
  return null;
}
