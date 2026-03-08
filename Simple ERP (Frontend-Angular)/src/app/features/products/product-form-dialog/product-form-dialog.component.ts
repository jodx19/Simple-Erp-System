import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { Product, ProductCreateDto, ErpApiClient, Supplier } from '../../../core/api/erp.api';

@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCheckboxModule,
    MatSelectModule,
  ],
  templateUrl: './product-form-dialog.component.html',
  styleUrl: './product-form-dialog.component.scss',
})
export class ProductFormDialogComponent {
  private fb = inject(NonNullableFormBuilder);
  private dialogRef = inject(MatDialogRef<ProductFormDialogComponent>);
  private api = inject(ErpApiClient);
  data: Product | null = inject(MAT_DIALOG_DATA);

  suppliers: Supplier[] = [];
  isEdit = !!this.data;

  form = this.fb.group({
    name: [this.data?.name ?? '', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    price: [this.data?.price ?? 0, [Validators.required, Validators.min(0)]],
    stockQuantity: [this.data?.stockQuantity ?? 0, [Validators.required, Validators.min(0)]],
    lowStockThreshold: [this.data?.lowStockThreshold ?? 5, [Validators.required, Validators.min(0)]],
    sku: [this.data?.sku ?? ''],
    category: [this.data?.category ?? ''],
    imageUrl: [this.data?.imageUrl ?? ''],
    isActive: [this.data?.isActive ?? true],
    supplierId: [this.data?.supplierId ?? null],
  });

  ngOnInit(): void {
    this.api.suppliersAll().subscribe(data => {
      this.suppliers = data;
    });
  }

  get name() { return this.form.get('name'); }
  get price() { return this.form.get('price'); }
  get stockQuantity() { return this.form.get('stockQuantity'); }
  get lowStockThreshold() { return this.form.get('lowStockThreshold'); }

  onCancel(): void { this.dialogRef.close(); }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const dto: any = {
      name: raw.name,
      price: raw.price,
      stockQuantity: raw.stockQuantity,
      lowStockThreshold: raw.lowStockThreshold,
      supplierId: raw.supplierId,
      isActive: raw.isActive,
    };
    if (this.data?.rowVersion) {
      dto.rowVersion = this.data.rowVersion;
    }
    this.dialogRef.close(dto as ProductCreateDto);
  }
}
