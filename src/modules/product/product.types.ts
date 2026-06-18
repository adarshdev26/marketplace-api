export interface ProductParams {
    productId: string;
  }
  
  export interface CreateProductBody {
    title: string;
    description: string;
    price: number;
    stock: number;
    categoryId: string;
  }