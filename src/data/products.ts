export interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  imageUrl: string;
  category: string;
}
