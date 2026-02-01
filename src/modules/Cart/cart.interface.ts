export interface AddToCartPayload {
  medicineId: string;
  quantity: number;
}

export interface UpdateCartItemPayload {
  medicineId: string;
  quantity: number;
}

export interface SyncCartPayload {
  items: {
    medicineId: string;
    quantity: number;
  }[];
}

export interface CartResponse {
  id: string;
  userId: string;
  items: CartItemResponse[];
  totalItems: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItemResponse {
  id: string;
  medicineId: string;
  medicine: {
    id: string;
    name: string;
    price: number;
    stock: number;
    imageUrl: string | null;
    manufacturer: string;
    category: {
      id: string;
      name: string;
    };
  };
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}
