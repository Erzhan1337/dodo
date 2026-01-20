export type Ingredient = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
};

export type ProductItem = {
  id: string;
  price: number;
  name: string;
  imageUrl: string;
  pizzaType: number;
  size: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  categoryId: number;
  ingredients: Ingredient[];
  items: ProductItem[];
};
