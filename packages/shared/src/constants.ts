export const GST_RATE = 0.05; // 5% for spices (HSN 0910)
export const HSN_CODE = "0910";
export const DEFAULT_CURRENCY = "INR";
export const FREE_SHIPPING_ABOVE = 499;
export const MAX_CART_QUANTITY = 50;
export const ORDER_NUMBER_PREFIX = "RRS";

export const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu",
  "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"
] as const;

export const WEIGHT_OPTIONS = [
  { label: "50g",  value: "50g",  weight: 50 },
  { label: "100g", value: "100g", weight: 100 },
  { label: "250g", value: "250g", weight: 250 },
  { label: "500g", value: "500g", weight: 500 },
  { label: "1 kg", value: "1kg",  weight: 1000 },
] as const;
