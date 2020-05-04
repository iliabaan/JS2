const API = 'https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses';

// let getRequest = (url) => {
//   return new Promise((resolve, reject) => {
//     let xhr = new XMLHttpRequest();
//     xhr.open('GET', url, true);
//     xhr.onreadystatechange = () => {
//       if (xhr.readyState === 4) {
//         if (xhr.status !== 200) {
//           reject('Error')
//         } else {
//           resolve(xhr.responseText);
//         }
//       }
//     };
//     xhr.send();
//   })
// };

class ProductList {
  constructor(container = '.products') {
    this.container = container;
    this.goods = [];
    this.allProducts = [];
    this._init();
    this._getProducts()
      .then(data => {
        this.goods = [...data];
        this._render();
      });
  }

  getJson(url) {
    return fetch(url ? url : `${API + url}`)
      .then(result => result.json())
      .catch(error => {
        console.log(error);
      })
  }

  _getProducts() {
    return fetch(`${API}/catalogData.json`)
      .then(response => response.json())
      .catch(error => {
        console.log(error);
      });
  }

  calcSum() {
    return this.goods.reduce((sum, good) => sum + good.price, 0);
  }

  _render() {
    const block = document.querySelector(this.container);

    for (let product of this.goods) {
      const productObject = new ProductItem(product);
      this.allProducts.push(productObject);
      block.insertAdjacentHTML('beforeend', productObject.render());
    }
  }

  _init() {
    document.querySelector(this.container).addEventListener('click', e => {
      if (e.target.classList.contains('buy-btn')) {
        cart.addProduct(e.target);
      }
    });
  }
}

class ProductItem {
  constructor(product, img = 'https://placehold.it/200x150') {
    this.product_name = product.product_name;
    this.price = product.price;
    this.id_product = product.id_product;
    this.img = img;
  }

  render() {
    return `<div class="product-item" data-id="${this.id}">
                <img src="${this.img}" alt="Some img">
                <div class="desc">
                    <h3>${this.product_name}</h3>
                    <p>${this.price} \u20bd</p>
                    <button class="buy-btn"
                    data-id="${this.id_product}"
                    data-name="${this.product_name}"
                    data-price="${this.price}">Купить</button></div>
            </div>`;
  }
}

class CartList extends ProductList {
  constructor(container = '.cart-block') {
    super(container)
  }

  _init() {
    return false
  }

  doesCartEmpty() {
    let cart = document.querySelector('#empty-cart');
    let item = document.querySelector('.cart-item');
    let c = document.querySelector(this.container)
    if (c.contains(item)) {
      console.log(true);
      cart.remove();
    } else {
      c.insertAdjacentHTML('afterbegin', `<p id="empty-cart">Корзина пуста.</p>`)
    }
  }

  _render() {
    return false
  }

  render() {
    const block = document.querySelector(this.container);
    for (let product of this.goods) {
      console.log(product);
      const productObj = new CartItem(product);
      console.log(productObj);
      this.allProducts.push(productObj);
      block.insertAdjacentHTML('beforeend', productObj.render());
    }
  }

  addProduct(element) {
    this.getJson(`${API}/addToBasket.json`)
      .then(data => {
        if (data.result === 1) {
          let productId = +element.dataset['id'];
          let find = this.allProducts.find(product => product.id_product === productId);
          if (find) {
            find.quantity++;
            this._updateCart(find);
          } else {
            let product = {
              id_product: productId,
              price: +element.dataset['price'],
              product_name: element.dataset['name'],
              quantity: 1
            };
            this.goods = [product];
            this.render(product);
          }
          this.doesCartEmpty();
        } else {
          alert('Error');
        }
      })
  }


  removeProduct(element) {
    this.getJson(`${API}/deleteFromBasket.json`)
      .then(data => {
        if (data.result === 1) {
          let productId = +element.dataset['id'];
          let find = this.allProducts.find(product => product.id_product === productId);
          if (find.quantity > 1) {
            find.quantity--;
            this._updateCart(find);
          } else {
            this.allProducts.splice(this.allProducts.indexOf(find), 1);
            document.querySelector(`.cart-item[data-id="${productId}"]`).remove();
          }
        } else {
          alert('Error');
        }
        this.doesCartEmpty();
      })
  }

  _updateCart(product) {
    let block = document.querySelector(`.cart-item[data-id="${product.id_product}"]`);
    block.querySelector('.product-quantity').textContent = `Количество: ${product.quantity}`;
    block.querySelector('.product-price').textContent = `${product.quantity * product.price} ₽`;
  }

  _init() {
    document.querySelector('.btn-cart').addEventListener('click', () => {
      document.querySelector(this.container).classList.toggle('invisible');
    });
    document.querySelector(this.container).addEventListener('click', e => {
      if (e.target.classList.contains('del-btn')) {
        this.removeProduct(e.target);
      }
    })
  }
}

class CartItem extends ProductList {
  constructor(product, img = 'https://placehold.it/50x100') {
    super(product, img);
    this.product_name = product.product_name;
    this.price = product.price;
    this.id_product = product.id_product;
    this.quantity = product.quantity;
    this.img = img
  }

  _init() {
    return false
  }

  _render() {
    return false
  }

  render() {
    return `<div class="cart-item" data-id="${this.id_product}">
            <div class="product-bio">
            <img src="${this.img}" alt="Some image">
            <div class="product-desc">
            <p class="product-title">${this.product_name}</p>
            <p class="product-quantity">Количество: ${this.quantity}</p>
        <p class="product-single-price">${this.price} за ед.</p>
        </div>
        </div>
        <div class="right-block">
            <p class="product-price">${this.quantity*this.price} ₽</p>
            <button class="del-btn" data-id="${this.id_product}">&times;</button>
        </div>
        </div>`
  }
}



new ProductList();
let cart = new CartList;
