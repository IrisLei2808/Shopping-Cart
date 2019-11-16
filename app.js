const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDom = document.querySelector('.products-center');
const wrap = document.querySelector('.search-wrapper');
let cart = [];
let buttonsDOM = [];
class Products {
  async  getProducts() {
    try {
      let result = await fetch('products.json');
      let data = await result.json();

      let products = data.items;
      products = products.map(item => {
        const {title,price} = item.fields;
        const {id} = item.sys;
        const image = item.fields.image.fields.file.url;
        return {title,price,id,image}
      })
      return products
    } catch (error) {
       console.log(error);
    }

    }
}
class UI {
  displayProducts(products) {
      let result = '';
      products.forEach(product  => {
        result += `
        <article class="product">
          <div class="img-container">
            <img src= ${product.image} alt="item" class="product-img">
            <button class="bag-btn" data-id=${product.id}>
              Quick View
            </button>
              </div>
            <h3>${product.title}</h3>
            <h4>$${product.price}</h4>
        </article>
        `;
      });
      productsDom.innerHTML = result;
  }
  getCartBtn() {
    const buttons = [...document.querySelectorAll('.bag-btn')];
    buttonsDOM = buttons;
    buttons.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if(inCart) {
        button.innerText = "IN CART";
        button.disabled = true
      }

        button.addEventListener('click',(event) => {

          event.target.disabled = true;
          let cartItem = {...Storage.getProduct(id),amount:1};
          cart = [...cart,cartItem];
          Storage.saveCart(cart);
          this.setCartValues(cart);
          this.addCartItem(cartItem);
          this.showCart();
        });

    });
  }

setCartValues(cart) {
   let tempTotal = 0;
   let itemsTotal = 0;
   cart.map(item => {
     tempTotal += item.price + item.amount;
     itemsTotal += item.amount;
   });
   cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
   cartItems.innerText = itemsTotal;
 }
 addCartItem(item) {
         const div = document.createElement('div');
         div.classList.add('cart-item');
         div.innerHTML = `
         <img src=${item.image} alt="product"/>
         <div>
           <h4><em>${item.title}</em></h4>
           <h5> <em>$${item.price}</em></h5>
           <h5><em>SIZE</em> : XXL</h5>
           <span class="remove-item" data-id=${item.id}>REMOVE</span>
         </div>
         <div>
           <i class="fas fa-arrow-up" data-id=${item.id}></i>
           <p class="item-amount">${item.amount}</p>
            <i class="fas fa-arrow-down" data-id=${item.id}></i>
         </div>`;
         cartContent.appendChild(div);

 }

showCart() {
    cartOverlay.classList.add('transparentBcg');
    cartDOM.classList.add('showCart');
}

setupAPP() {
  cart = Storage.getCart();
  this.setCartValues(cart);
  this.populateCart(cart);
  cartBtn.addEventListener('click', this.showCart);
  closeCartBtn.addEventListener('click',this.hideCart);
}
populateCart(cart) {
  cart.forEach(item => this.addCartItem(item));
}
hideCart() {
  cartOverlay.classList.remove('transparentBcg');
  cartDOM.classList.remove('showCart');
}
cartLogic() {
  clearCartBtn.addEventListener('click', ()=>{
    this.clearCart();
  });
  cartContent.addEventListener('click',event => {
    if(event.target.classList.contains('remove-item')) {
      let removeItem = event.target;
      let id = removeItem.dataset.id;
      console.log(removeItem.parentElement.parentElement);
      cartContent.removeChild(removeItem.parentElement.parentElement);
      this.removeItem(id);
    }
    else if(event.target.classList.contains("fas fa-arrow-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
    }
    else if (event.target.classList.contains("fas fa-arrow-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
          tempItem.amount = tempItem.amount - 1;
          if(tempItem.amount > 0) {
                 Storage.saveCart(cart);
                 this.setCartValues(cart);
                 lowerAmount.previousElementSibling.innerText = tempItem.amount;
          }
          else {

             this.setCartValues(cart);
         Storage.saveCart(cart);
            cartContent.removeChild(lowerAmount.parentElement.parentElement);
            this.removeItem(id);
          }


    }
  });
}
clearCart() {
   let cartItems = cart.map(item => item.id);
   cartItems.forEach(id => this.removeItem(id));
   while (cartContent.children.length>0) {
     cartContent.removeChild(cartContent.children[0])
   }
   this.hideCart();
}
removeItem(id) {
  cart = cart.filter(item => item.id !== id);
  this.setCartValues(cart);
  Storage.saveCart(cart);
  let button = this.getSingleButton(id);
  button.disabled = false;
  button.innerHTML = `<i class="fas fa-shopping-cart"></i>ADD TO CART`;
}
getSingleButton(id) {
  return buttonsDOM.find(button => button.dataset.id === id);
}
}
class Storage {
    static saveProducts(products) {
      localStorage.setItem("products",JSON.stringify(products));
    }
    static getProduct(id) {
      let products = JSON.parse(localStorage.getItem('products'));
      return products.find(product => product.id === id);
    }
    static saveCart(cart) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
    static getCart() {
      return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[];
    }
}
function showElement() {

    cartOverlay.classList.add('transparentBcg');
    wrap.classList.add('showSearch');
    wrap.style.visibility = 'visible';
}

document.addEventListener("DOMContentLoaded",()=> {
  const ui = new UI();
  const products = new Products();
  ui.setupAPP();
  products.getProducts().then(products=> {
  ui.displayProducts(products);
  Storage.saveProducts(products);
}).then(() => {
  ui.getCartBtn();
  ui.cartLogic();
});
});

function searchToggle(obj, evt){
    var container = $(obj).closest('.search-wrapper');
        if(!container.hasClass('active')){
            container.addClass('active');
            evt.preventDefault();
        }
  else if(container.hasClass('active') && $(obj).closest('.input-holder').length == 0){
            container.removeClass('active');
            // clear input
            container.find('.search-input').val('');
            cartOverlay.classList.remove('transparentBcg');
             cartDOM.classList.remove('showSearch');
             wrap.style.visibility = 'hidden';
        }

}
/* slideshow*/
$("#slideshow > div:gt(0)").hide();

setInterval(function() {
  $('#slideshow > div:first')
    .fadeOut(1000)
    .next()
    .fadeIn(1000)
    .end()
    .appendTo('#slideshow');
},  3000);

var backToTop = $(".add-to-top");
var scrollAmount = 150;
$(window).scroll( function() {
  if ($(this).scrollTop() > scrollAmount) {
    backToTop.fadeIn();
  } else {
    backToTop.fadeOut();
  }
});

backToTop.click( function(e) {
  $("html, body").animate({scrollTop: 0}, 750);
});
