export interface ProductParams {
    productId: string;
  }
  
  export interface AddItemBody {
    productId: string;
    quantity: number;
  }
  
  export interface UpdateItemBody {
    quantity: number;
  }