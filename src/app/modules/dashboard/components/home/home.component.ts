import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import { ProductElement } from 'src/app/modules/product/product/product.component';
import { ProductService } from 'src/app/modules/shared/services/product.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{

  charBar: any;
  charDoughnut: any;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts(){
    this.productService.getProducts()
      .subscribe( (data:any) => {
        console.log("respuesta de productos: ", data);
        this.processProductResponse(data);
      }, (error: any) => {
        console.log("error en productos: ", error);
      })
  }

  processProductResponse(resp: any){

    const nameProduct: String [] = [];
    const quantity: number [] = [];

    if( resp.metadata[0].code == "00"){
      let listCProduct = resp.product.products;

      listCProduct.forEach((element: ProductElement) => {

        nameProduct.push(element.name);
        quantity.push(element.quantity);
      });

      //nuetro gráfico de barras:
      this.charBar = new Chart('canvas-bar', {
        type: 'bar',
        data: {
          labels: nameProduct,
          datasets: [
            { label : 'Productos', data: quantity}
          ]
        }
      });

      //nuetro gráfico de doughnut:
      this.charDoughnut = new Chart('canvas-doughnut', {
        type: 'doughnut',
        data: {
          labels: nameProduct,
          datasets: [
            { label : 'Productos', data: quantity}
          ]
        }
      });

    }
  }
}
