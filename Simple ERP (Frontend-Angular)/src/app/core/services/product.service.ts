import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ErpApiClient, Product, ProductCreateDto } from '../api/erp.api';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = inject(ErpApiClient);

  getProducts(): Observable<Product[]> {
    return this.api.productsAll();
  }

  getProductById(id: number): Observable<Product> {
    return this.api.productsGET(id);
  }

  addProduct(product: ProductCreateDto): Observable<Product> {
    return this.api.productsPOST(product);
  }

  updateProduct(id: number, product: any): Observable<void> {
    return this.api.productsPUT(id, product as ProductCreateDto);
  }

  deleteProduct(id: number): Observable<void> {
    return this.api.productsDELETE(id);
  }

  toggleStatus(product: Product): Observable<void> {
    const update: any = {
      name: product.name,
      price: product.price,
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
      categoryId: product.categoryId,
      isActive: !product.isActive,
      rowVersion: product.rowVersion // Concurrency guard
    };
    return this.api.productsPUT(product.id!, update as ProductCreateDto);
  }

  archiveProduct(id: number, currentProduct: Product): Observable<void> {
    const update: any = {
      name: currentProduct.name,
      price: currentProduct.price,
      stockQuantity: currentProduct.stockQuantity,
      lowStockThreshold: currentProduct.lowStockThreshold,
      categoryId: currentProduct.categoryId,
      isActive: false,
      rowVersion: currentProduct.rowVersion
    };
    return this.api.productsPUT(id, update as ProductCreateDto);
  }
}
