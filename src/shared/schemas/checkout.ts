export interface CustomerFieldsInput {
  first_name: string;
  last_name?: string;
  contact_number: string;
  secondary_number?: string;
  preferredCourier: string;
}

export interface AddressInput {
  door: string;
  street: string;
  area: string;
  landmark?: string;
  pincode: string;
  city: string;
  state: string;
}

export interface CheckoutInput extends CustomerFieldsInput {
  billing_door: string;
  billing_street: string;
  billing_area: string;
  billing_landmark?: string;
  billing_pincode: string;
  billing_city: string;
  billing_state: string;
  shipping_door?: string;
  shipping_street?: string;
  shipping_area?: string;
  shipping_landmark?: string;
  shipping_pincode?: string;
  shipping_city?: string;
  shipping_state?: string;
  sameAsBilling: boolean;
  paymentMethod: string;
}
