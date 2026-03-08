import { Component, OnInit, inject, ChangeDetectionStrategy, signal, computed, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ErpApiClient, Product, OrderCreateDto, OrderItemCreateDto, PaymentMethod } from '../../core/api/erp.api';
import { ProductService } from '../../core/services/product.service';

interface CartItem {
    product: Product;
    quantity: number;
}

@Component({
    selector: 'app-pos',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatDividerModule,
        MatBadgeModule,
        MatProgressSpinnerModule,
        MatSelectModule
    ],
    templateUrl: './pos.component.html',
    styleUrl: './pos.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class POSComponent implements OnInit {
    private api = inject(ErpApiClient);
    private productService = inject(ProductService);
    private snackBar = inject(MatSnackBar);
    private cdr = inject(ChangeDetectorRef);

    products = signal<Product[]>([]);
    searchQuery = signal('');
    cart = signal<CartItem[]>([]);
    isLoading = signal(false);
    isCheckingOut = signal(false);

    paymentMethod = signal<PaymentMethod>(0); // Default Cash
    orderNotes = signal('');
    private barcodeBuffer = '';
    private lastKeyTime = 0;

    filteredProducts = computed(() => {
        const query = this.searchQuery().toLowerCase();
        return this.products().filter(p =>
            p.isActive !== false &&
            (p.name?.toLowerCase().includes(query) || p.sku?.toLowerCase().includes(query))
        );
    });

    cartTotal = computed(() =>
        this.cart().reduce((sum, item) => sum + ((item.product.price ?? 0) * item.quantity), 0)
    );

    cartCount = computed(() =>
        this.cart().reduce((sum, item) => sum + item.quantity, 0)
    );

    ngOnInit(): void {
        this.loadProducts();
    }

    loadProducts(): void {
        this.isLoading.set(true);
        this.productService.getProducts().subscribe({
            next: (data) => {
                this.products.set(data);
                this.isLoading.set(false);
                this.cdr.detectChanges();
            },
            error: () => {
                this.snackBar.open('Failed to load products', 'Close', { duration: 3000 });
                this.isLoading.set(false);
                this.cdr.detectChanges();
            }
        });
    }

    addToCart(product: Product): void {
        if ((product.stockQuantity ?? 0) <= 0) {
            this.snackBar.open('Product out of stock', 'Dismiss', { duration: 2000 });
            return;
        }

        const currentCart = this.cart();
        const existingIndex = currentCart.findIndex(item => item.product.id === product.id);

        if (existingIndex > -1) {
            const item = currentCart[existingIndex];
            if (item.quantity + 1 > (product.stockQuantity ?? 999)) {
                this.snackBar.open('Cannot exceed available stock', 'Dismiss', { duration: 2000 });
                return;
            }
            const newCart = [...currentCart];
            newCart[existingIndex] = { ...item, quantity: item.quantity + 1 };
            this.cart.set(newCart);
        } else {
            this.cart.set([...currentCart, { product, quantity: 1 }]);
        }
    }

    removeFromCart(productId: number): void {
        this.cart.set(this.cart().filter(item => item.product.id !== productId));
    }

    updateQuantity(productId: number, delta: number): void {
        const currentCart = this.cart();
        const idx = currentCart.findIndex(item => item.product.id === productId);
        if (idx === -1) return;

        const item = currentCart[idx];
        const newQty = item.quantity + delta;

        if (newQty <= 0) {
            this.removeFromCart(productId);
        } else if (newQty > (item.product.stockQuantity ?? 999)) {
            this.snackBar.open('Stock limit reached', 'Dismiss', { duration: 2000 });
        } else {
            const newCart = [...currentCart];
            newCart[idx] = { ...item, quantity: newQty };
            this.cart.set(newCart);
        }
    }

    checkout(): void {
        if (this.cart().length === 0) return;

        this.isCheckingOut.set(true);
        const orderItems: OrderItemCreateDto[] = this.cart().map(item => ({
            productId: item.product.id,
            quantity: item.quantity
        }));

        const orderDto: OrderCreateDto = {
            customerName: 'POS Walk-in Customer',
            paymentMethod: this.paymentMethod(),
            notes: this.orderNotes(),
            items: orderItems
        };

        this.api.ordersPOST(orderDto).subscribe({
            next: () => {
                this.snackBar.open('✅ Order completed successfully!', 'Great', {
                    duration: 4000,
                    panelClass: 'success-snackbar'
                });
                this.cart.set([]);
                this.loadProducts(); // Refresh stock
                this.isCheckingOut.set(false);
                this.cdr.detectChanges();
            },
            error: (err) => {
                // Handled by global error interceptor for 409 etc.
                this.isCheckingOut.set(false);
                this.cdr.detectChanges();
            }
        });
    }

    clearCart(): void {
        this.cart.set([]);
        this.orderNotes.set('');
        this.paymentMethod.set(0);
    }

    @HostListener('window:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        // Barcode scanners usually send characters rapidly followed by 'Enter'
        const now = Date.now();
        if (now - this.lastKeyTime > 100) {
            this.barcodeBuffer = '';
        }
        this.lastKeyTime = now;

        if (event.key === 'Enter') {
            if (this.barcodeBuffer.length > 2) {
                this.processBarcode(this.barcodeBuffer);
                this.barcodeBuffer = '';
                event.preventDefault();
            }
        } else if (event.key.length === 1) {
            this.barcodeBuffer += event.key;
        }
    }

    private processBarcode(code: string): void {
        const product = this.products().find(p => p.barcode === code || p.sku === code);
        if (product) {
            this.addToCart(product);
            this.snackBar.open(`Added: ${product.name}`, 'OK', { duration: 1500 });
        } else {
            this.snackBar.open(`Barcode ${code} not found`, 'Dismiss', { duration: 2000 });
        }
    }
}
