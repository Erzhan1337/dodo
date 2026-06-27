export type ReviewUser = {
  id: string;
  name: string;
};

export type ReviewProduct = {
  id: string;
  name: string;
  imageUrl: string;
};

export type ProductReview = {
  id: string;
  rating: number;
  comment: string | null;
  productId: string;
  userId: string;
  orderItemId: string;
  createdAt: string;
  updatedAt: string;
  user: ReviewUser;
  product: ReviewProduct;
};

export type ProductReviewFormValues = {
  orderItemId: string;
  rating: number;
  comment?: string;
};

export type UpdateProductReviewValues = {
  rating?: number;
  comment?: string;
};

export type PaginatedReviews = {
  data: ProductReview[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};
