import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CategoryService } from '../../shared/services/category.service';
import { ProductService } from '../../shared/services/product.service';
import { catchError, of } from 'rxjs';

 interface Category{
  description: string;
  id: number;
  name: string;
}

interface ProductData {
  name: string;
  price: number;
  quantity: number;
  category: number;
  picture?: File;
}

@Component({
  selector: 'app-new-product',
  templateUrl: './new-product.component.html',
  styleUrls: ['./new-product.component.css']
})

export class NewProductComponent implements OnInit {

  productForm: FormGroup;
  stateForm = "Agregar";
  categories: Category[] = [];
  selectedFile?: File;
  nameImage?: string;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private productService: ProductService,
    private dialogRef: MatDialogRef<NewProductComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    ){
      this.productForm = this.fb.group({
        name: ['', Validators.required],
        price: [null, [Validators.required, Validators.min(0)]],
        quantity: [null, [Validators.required, Validators.min(0)]],
        category: ['', Validators.required],
        picture: ['', Validators.required]
      })

      if(data != null){
        this.updateForm(data);
        this.stateForm = "Actualizar";
      }
    }

    ngOnInit(): void {
      this.getCategories();
    }

    onSave(): void{
      const data: ProductData = {
        name: this.productForm.get('name')?.value,
        price: this.productForm.get('price')?.value,
        quantity: this.productForm.get('quantity')?.value,
        category: this.productForm.get('category')?.value,
        picture: this.selectedFile
      };

      const uploadImageData = new FormData();
      if (data.picture) {
        uploadImageData.append('picture', data.picture, data.picture.name);
      }
      uploadImageData.append('name', data.name);
      uploadImageData.append('price', String(data.price));
      uploadImageData.append('quantity', String(data.quantity));
      uploadImageData.append('categoryId', String(data.category));

      const productObservable = this.data != null
      ? this.productService.updateProduct(uploadImageData, this.data.id)
      : this.productService.saveProduct(uploadImageData);

      productObservable.subscribe({
        next: () => this.dialogRef.close(1),
        error: () => this.dialogRef.close(2),
      });
    }

    onCancel(){
      this.dialogRef.close(3);
    }

    getCategories() {
      this.categoryService.getCategories().pipe(
          catchError(() => {
            console.log("error al consultar categorías");
            return of([]);
          })
        )
        .subscribe((data: any) => {
          this.categories = data.categoryResponse.category;
        });
    }

      onFileChanged(event: any) {
      const files = event.target.files;
      if(files && files.length > 0) {
        this.selectedFile = files[0];
        this.nameImage = this.selectedFile?.name || '';;
      }
    }

    updateForm(data: any) : void{
      this.productForm.setValue({
        name: data.name,
        price: data.price,
        quantity: data.quantity,
        category: data.category.id,
        picture: ''
      });
    }

    hasError(controlName: string, errorName: string) {
      return this.productForm.controls[controlName].hasError(errorName) &&
        (this.productForm.controls[controlName].dirty || this.productForm.controls[controlName].touched);
    }
}
