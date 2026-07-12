export type FieldType = "text" | "number" | "select" | "textarea";

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  displayPriority: number;
  searchable?: boolean;
  filterable?: boolean;
  unit?: string;
};

export type GameSpec = {
  id: string;
  name: string;
  icon: string;
  productType: "account";
  fields: FieldDef[];
};

export const GAME_SPECS: Record<string, GameSpec> = {
  clothing: {
    id: "clothing",
    name: "ملابس",
    icon: "👗",
    productType: "account",
    fields: [
      { key: "brand", label: "الماركة", type: "text", required: true, placeholder: "اسم الماركة", displayPriority: 1, searchable: true },
      { key: "size", label: "المقاس", type: "select", required: true, options: [
        { value: "xs", label: "XS" },
        { value: "s", label: "S" },
        { value: "m", label: "M" },
        { value: "l", label: "L" },
        { value: "xl", label: "XL" },
        { value: "xxl", label: "XXL" },
        { value: "3xl", label: "3XL" },
      ], displayPriority: 2, searchable: true, filterable: true },
      { key: "color", label: "اللون", type: "text", required: false, placeholder: "اللون", displayPriority: 3, searchable: true, filterable: true },
      { key: "material", label: "الخامة", type: "text", required: false, placeholder: "نوع القماش", displayPriority: 4, filterable: true },
      { key: "gender", label: "الجنس", type: "select", required: false, options: [
        { value: "male", label: "رجالي" },
        { value: "female", label: "نسائي" },
        { value: "unisex", label: "للجنسين" },
      ], displayPriority: 5, filterable: true },
    ],
  },
  makeup: {
    id: "makeup",
    name: "مكياج",
    icon: "💄",
    productType: "account",
    fields: [
      { key: "brand", label: "الماركة", type: "text", required: true, placeholder: "اسم الماركة", displayPriority: 1, searchable: true },
      { key: "makeup_type", label: "النوع", type: "select", required: true, options: [
        { value: "foundation", label: "فاونديشن" },
        { value: "lipstick", label: "أحمر شفاه" },
        { value: "eyeshadow", label: "ظلال عيون" },
        { value: "mascara", label: "ماسكرا" },
        { value: "blush", label: "بلاش" },
        { value: "highlighter", label: "هايلايتر" },
        { value: "concealer", label: "كونسيلر" },
        { value: "powder", label: "بودرة" },
        { value: "eyeliner", label: "آيلاينر" },
        { value: "lip_liner", label: "محدد شفاه" },
      ], displayPriority: 2, searchable: true, filterable: true },
      { key: "shade", label: "الدرجة", type: "text", required: false, placeholder: "الدرجة أو اللون", displayPriority: 3, searchable: true },
      { key: "volume", label: "الحجم", type: "text", required: false, placeholder: "مثلاً: 30ml", displayPriority: 4, filterable: true },
    ],
  },
  bags: {
    id: "bags",
    name: "حقائب",
    icon: "👜",
    productType: "account",
    fields: [
      { key: "brand", label: "الماركة", type: "text", required: true, placeholder: "اسم الماركة", displayPriority: 1, searchable: true },
      { key: "material", label: "الخامة", type: "select", required: true, options: [
        { value: "leather", label: "جلد" },
        { value: "fabric", label: "قماش" },
        { value: "synthetic", label: "صناعي" },
        { value: "straw", label: "خوص" },
        { value: "velvet", label: "مخمل" },
      ], displayPriority: 2, searchable: true, filterable: true },
      { key: "color", label: "اللون", type: "text", required: false, placeholder: "اللون", displayPriority: 3, searchable: true, filterable: true },
      { key: "bag_size", label: "الحجم", type: "select", required: false, options: [
        { value: "small", label: "صغير" },
        { value: "medium", label: "متوسط" },
        { value: "large", label: "كبير" },
      ], displayPriority: 4, filterable: true },
    ],
  },
  shoes: {
    id: "shoes",
    name: "أحذية",
    icon: "👟",
    productType: "account",
    fields: [
      { key: "brand", label: "الماركة", type: "text", required: true, placeholder: "اسم الماركة", displayPriority: 1, searchable: true },
      { key: "shoe_size", label: "المقاس", type: "select", required: true, options: [
        { value: "36", label: "36" }, { value: "37", label: "37" }, { value: "38", label: "38" },
        { value: "39", label: "39" }, { value: "40", label: "40" }, { value: "41", label: "41" },
        { value: "42", label: "42" }, { value: "43", label: "43" }, { value: "44", label: "44" },
        { value: "45", label: "45" }, { value: "46", label: "46" },
      ], displayPriority: 2, searchable: true, filterable: true },
      { key: "color", label: "اللون", type: "text", required: false, placeholder: "اللون", displayPriority: 3, searchable: true, filterable: true },
      { key: "shoe_material", label: "الخامة", type: "select", required: false, options: [
        { value: "leather", label: "جلد" },
        { value: "fabric", label: "قماش" },
        { value: "synthetic", label: "صناعي" },
        { value: "mesh", label: "شبكي" },
      ], displayPriority: 4, filterable: true },
      { key: "gender", label: "الجنس", type: "select", required: false, options: [
        { value: "male", label: "رجالي" },
        { value: "female", label: "نسائي" },
        { value: "unisex", label: "للجنسين" },
      ], displayPriority: 5, filterable: true },
    ],
  },
  skincare: {
    id: "skincare",
    name: "العناية بالبشرة",
    icon: "🧴",
    productType: "account",
    fields: [
      { key: "brand", label: "الماركة", type: "text", required: true, placeholder: "اسم الماركة", displayPriority: 1, searchable: true },
      { key: "skincare_type", label: "النوع", type: "select", required: true, options: [
        { value: "moisturizer", label: "مرطب" },
        { value: "serum", label: "سيروم" },
        { value: "sunscreen", label: "واقي شمس" },
        { value: "cleaner", label: "منظف" },
        { value: "toner", label: "تونر" },
        { value: "mask", label: "ماسك" },
        { value: "eye_cream", label: "كريم عيون" },
        { value: "exfoliator", label: "مقشر" },
      ], displayPriority: 2, searchable: true, filterable: true },
      { key: "skin_type", label: "نوع البشرة", type: "select", required: false, options: [
        { value: "all", label: "جميع أنواع البشرة" },
        { value: "oily", label: "دهنية" },
        { value: "dry", label: "جافة" },
        { value: "combination", label: "مختلطة" },
        { value: "sensitive", label: "حساسة" },
      ], displayPriority: 3, filterable: true },
      { key: "volume", label: "الحجم", type: "text", required: false, placeholder: "مثلاً: 50ml", displayPriority: 4, filterable: true },
    ],
  },
};

export function getGameSpec(category: string): GameSpec | null {
  return GAME_SPECS[category] || null;
}

export function getGameSpecs(): GameSpec[] {
  return Object.values(GAME_SPECS);
}

export function validateAttributes(category: string, attributes: Record<string, unknown>): string[] {
  const spec = getGameSpec(category);
  if (!spec) return ["نوع القسم غير معروف"];

  const errors: string[] = [];
  for (const field of spec.fields) {
    const value = attributes[field.key];
    if (field.required && (value === undefined || value === null || value === "")) {
      errors.push(`الحقل "${field.label}" مطلوب`);
      continue;
    }
    if (value !== undefined && value !== null && value !== "") {
      if (field.type === "number") {
        const num = Number(value);
        if (isNaN(num)) {
          errors.push(`الحقل "${field.label}" يجب أن يكون رقمًا`);
        } else {
          if (field.min !== undefined && num < field.min) {
            errors.push(`الحقل "${field.label}" أقل قيمة هي ${field.min}`);
          }
          if (field.max !== undefined && num > field.max) {
            errors.push(`الحقل "${field.label}" أكبر قيمة هي ${field.max}`);
          }
        }
      }
      if (field.type === "select" && field.options) {
        const valid = field.options.some((o) => o.value === value);
        if (!valid) {
          errors.push(`القيمة "${value}" غير صالحة للحقل "${field.label}"`);
        }
      }
    }
  }
  return errors;
}

export function renderFieldValue(field: FieldDef, value: unknown): string {
  if (value === undefined || value === null || value === "") return "-";
  if (field.type === "select" && field.options) {
    const opt = field.options.find((o) => o.value === value);
    return opt?.label || String(value);
  }
  if (field.type === "number" && field.unit) {
    return `${value} ${field.unit}`;
  }
  return String(value);
}
