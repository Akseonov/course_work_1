class ItemsList {
    constructor() {
        this.items = [];
        this.filteredItems = [];
        this.loaded = false;
    }

    fetchItems() {
        return fetch('/goods')
            .then(response => response.json())
            .then((items) => {
                this.items = items;
                this.loaded = true;
                this.filteredItems = items;
            })
    }

    filter(query) {
        this.filteredItems = this.items.filter((item) => {
            const regexp = new RegExp(query, 'i');

            return regexp.test(item.title);
        });
    }

    render(size) {
        return this.filteredItems.slice(0,size).map((item) =>
                new Item(item.id, item.title, item.price, item.url).render()).join('');
    }
}

class Item {
    constructor(id, title, price, url) {
        this.price = price;
        this.title = title;
        this.id = id;
        this.url = url;
    }

    render() {
        return `<article class="products__fetured__item">
            <a href="#">
                <img src="${this.url}" alt="${this.url}">
            </a>
            <div class="futured__info">
                <a class="futured__a" href="single_page.html">${this.title}</a>
                <h4 class="fetured__h4">$ ${this.price}.00</h4>
            </div>
            <div class="fetured__add">
                <button class="fetured__a"
                data-id="${this.id}"
                data-title="${this.title}"
                data-price="${this.price}"
                data-url="${this.url}"
                >Add to Cart
                </button>
            </div>
            <div class="fetured__add">
                <a href="#" class="fetured__a_2"></a>
            </div>
            <div class="fetured__add">
                <a href="#" class="fetured__a_3"></a>
            </div>
        </article>`
    }
}

class Cart {
    constructor() {
        this.items = [];
        this.element = null;
    }

    fetchItems() {
        return fetch('/cart')
            .then(response => response.json())
            .then((items) => {
                this.items = items;
            });
    }

    add(item) {
        fetch('/cart', {
            method: 'POST',
            body: JSON.stringify({...item, qty: 1}),
            headers: {
                'Content-type': 'application/json',
            },
        })
            .then((response) => response.json())
            .then((item) => {
                this.element.insertAdjacentHTML('beforeend', this.renderItem(item));
            });
        this.items.push({...item, qty: 1});
    }

    update(id, newQty) {
        if(newQty < 1) {
            if(confirm('Вы действительно хотите удалить товар из корзины?')) {
                fetch(`/cart/${id}`, {
                    method: 'DELETE',
                })
                    .then(response => response.json())
                    .then((item) => {
                        const $item = document.querySelector(`.shopping_cart__block 
                        .shopping_cart__item[data-id="${id}"]`);
                        if($item) {
                            $item.remove();
                        }
                    });
                const idx = this.items.findIndex(entity => entity.id === id);
                this.items.splice(idx, 1);
            } else {
                return false;
            }
        } else {
            fetch(`/cart/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({qty: newQty}),
                headers: {
                    'Content-type': 'application/json',
                },
            })
                .then(response => response.json())
                .then((item) => {
                    console.log('Обновление количества прошло успешно!');
                });

            const idx = this.items.findIndex(entity => entity.id === id);
            this.items[idx].qty = newQty;
        }

        return true;
    }

    renderItem(item) {
        return `<div class="shopping_cart__item" data-id="${item.id}">
            <div class="shopping_cart_box1">
                <div class="shopping_cart_box1_img">
                    <img class="shopping_cart_img" src="${item.url}" alt="${item.url}">
                </div>
                <div class="shopping_cart_box1_p_cont">
                <p class="shopping_cart_box1_p">${item.title}</p>
                <p class="shopping_cart_box1_p1"><span class="shopping_cart_box1_span">Color:</span>   Red</p>
                <p class="shopping_cart_box1_p1"><span class="shopping_cart_box1_span">Size:</span>   Xll</p>
                </div>
            </div>
            <div class="shopping_cart_box2 shopping_cart_center">
                <p class="shopping_cart_box1_p2">$${item.price}</p>
            </div>
            <div class="shopping_cart_box3 shopping_cart_center">
                <input class="shopping_cart_box1_input" type="text" placeholder="${item.qty}" pattern="\\S+[1-100]">
            </div>
            <div class="shopping_cart_box4 shopping_cart_center">
                <p class="shopping_cart_box1_p3">FREE</p>
            </div>
            <div class="shopping_cart_box5 shopping_cart_center">
                <p class="shopping_cart_box1_p2">$${item.price*item.qty}</p>
            </div>
            <div class="shopping_cart_box6 shopping_cart_center">
                <div class="shopping_cart_box6_i"></div>
            </div>
        </div>`
    }

    render() {
        this.element = document.createElement('div');
        this.element.innerHTML = this.items.map(this.renderItem).join('');

        return this.element;
    }

    renderItemDrop(item) {
        return `<div class="cart__prod">
            <img src="${item.url}" alt="${item.url}" width="72px" height="85px">
            <div class="prod_block">
                <p class="prod__name">${item.title}</p>
                <img src="img/prod_rait.png" alt="">
                <p class="prod__price">${item.qty} x $${item.price}</p>
            </div>
            <i class="fa fa-times-circle"></i>
        </div>
        <hr class="cart__hr">`
    }

    renderDrop() {
        this.element = document.createElement('div');
        this.element.innerHTML = this.items.map(this.renderItemDrop).join('');

        return this.element;
    }

    total() {
        return this.items.reduce((acc, item) => acc + item.qty * item.price, 0);
    }
}

const items = new ItemsList();
items.fetchItems().then(() => {
    document.querySelector('.feature__box').innerHTML = items.render(9);
});

const items2 = new ItemsList();
items2.fetchItems().then(() => {
    document.querySelector('.fetured__content').innerHTML = items2.render(8);
});

const cart = new Cart();
cart.fetchItems().then(() => {
    document.querySelector('.shopping_cart__block').appendChild(cart.render());
    document.querySelector('.total').innerHTML = `$${cart.total()}`;
    document.querySelector('.total2').innerHTML = `$${cart.total()}`;
});

const cart2 = new Cart();
cart.fetchItems().then(() => {
    document.querySelector('.cart__drop_items').appendChild(cart.renderDrop());
    document.querySelector('.cart__total__price').innerHTML = `$${cart.total()}`;
});

document.querySelector('.shopping_cart__block').addEventListener('change', (event) => {
    if (event.target.classList.contains('qty')) {
        const $parent = event.target.parentElement;
        if (!cart.update($parent.dataset.id, +event.target.value)) {
            event.target.value = 1;
        }
        document.querySelector('.total').innerHTML = cart.total();
        document.querySelector('.total2').innerHTML = cart.total();
        document.querySelector('.cart__total__price').innerHTML = cart.total();
    }
});

document.querySelector('.feature__box').addEventListener('click', (event) => {
    if (event.target.classList.contains('fetured__add')) {
        const id = event.target.dataset.id;
        const $item = document.querySelector(`.shopping_cart__block 
        .shopping_cart__item[data-id="${id}"]`);
        if ($item) {
            const $currentQty = $item.querySelector('.shopping_cart_box1_input');
            $currentQty.value = +$currentQty.value + 1;
            cart.update(id, +$currentQty.value);
        } else {
            cart.add(event.target.dataset);
        }
        document.querySelector('.total').innerHTML = cart.total();
    }
});



document.querySelector('[name="query"]').addEventListener('input', (event) => {
    const query = event.target.value;
    items.filter(query);
    document.querySelector('.catalog').innerHTML = items.render();
});