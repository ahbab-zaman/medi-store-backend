export interface WishlistResponse {
  id: string;
  userId: string;
  medicineId: string;
  medicine: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string | null;
    manufacturer: string;
    category: {
      id: string;
      name: string;
    };
  };
  createdAt: Date;
}
