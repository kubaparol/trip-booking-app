import './../css/client.css';

import ExcursionsAPI from './ExcursionsAPI';

const api = new ExcursionsAPI();

document.addEventListener('DOMContentLoaded', init);

function init() {
    console.log('client');
    
    loadExcursions();
}

const apiExcursions = 'http://localhost:3000/excursions';
const apiOrders = 'http://localhost:3000/orders';
const totalBasketAmountEl = document.querySelector('.order__total-price-value');
const totalBasketAmountArr = [];
const basket = [];

const orderInput = document.querySelector('.order__field-submit');
orderInput.addEventListener('click', checkDataAndOrderConfirmation);


function loadExcursions() {
    api.loadData(apiExcursions)
        .then(data => {
            insertExcursions(data)
        })
        .catch(err => console.log(err));
}

function insertExcursions(excursionsArr) {
    const ulEl = document.querySelector('.panel__excursions');
    excursionsArr.forEach(item => {
        const liPrototype = ulEl.querySelector('.excursions__item--prototype');
        const newLi = liPrototype.cloneNode(true);
        newLi.classList.remove('excursions__item--prototype');
        const newLiTitle = newLi.querySelector('.excursions__title');
        const newLiDescription = newLi.querySelector('.excursions__description');
        const newLiAdultPrice = newLi.querySelector('.adults-price');
        const newLiChildrenPrice = newLi.querySelector('.children-price');

        newLi.dataset.id = item.id;
        newLiTitle.textContent = item.title;
        newLiDescription.textContent = item.description;
        newLiAdultPrice.textContent = item.adultPrice;
        newLiChildrenPrice.textContent = item.childrenPrice;

        ulEl.appendChild(newLi);
        getAddButtons();
    })
}

function getAddButtons() {
    const ulEl = document.querySelector('.panel__excursions');
    ulEl.addEventListener('submit', addToBasket)
}

function getRemoveButtons() {
    const ulEl = document.querySelector('.panel__summary');
    ulEl.addEventListener('click', removeTrip);
}

function addToBasket(e) {
    e.preventDefault();
    const item = e.target.parentElement;
    const title = item.querySelector('.excursions__title').textContent;
    const adultNumber = item.querySelector('input[name="adults"]');
    const adultPrice = item.querySelector('.adults-price').textContent;
    const childrenNumber = item.querySelector('input[name="children"]');
    const childrenPrice = item.querySelector('.children-price').textContent;

    const trip = new Trip(title, adultNumber.value, adultPrice, childrenNumber.value, childrenPrice);

    const summaryEl = document.querySelector('.panel__summary');
    const summaryItemPrototype = summaryEl.firstElementChild;
    const newSummaryItem = summaryItemPrototype.cloneNode(true);
    newSummaryItem.classList.remove('summary__item--prototype');
    const itemTitle = newSummaryItem.querySelector('.summary__name');
    const itemPrice = itemTitle.nextElementSibling;
    const itemParagraph = newSummaryItem.querySelector('.summary__prices');

    if (adultNumber.value === '' && childrenNumber.value === '') {
        alert('Wprowadź wartości!');
    } else if (isNaN(Number(adultNumber.value)) || isNaN(Number(childrenNumber.value))) {
        alert('Wprowadź poprawne wartości!');
    } else {
        summaryEl.appendChild(newSummaryItem);
        basket.push(trip);
        trip.addTrip(itemTitle, itemPrice, itemParagraph);
        totalBasketAmountArr.push(parseInt(itemPrice.textContent));
        totalBasketAmountEl.textContent = `${sumTotalBasketAmount(totalBasketAmountArr)}PLN`;
    }
    adultNumber.value = '';
    childrenNumber.value = '';
    console.log(basket)

    getRemoveButtons();
}

function removeTrip(e) {
    e.preventDefault();
    const item = e.target;
    if (item.tagName === 'A') {
        const tripHeader = item.parentElement;
        const tripItem = tripHeader.parentElement;
        tripItem.remove();
        //wyszukanie w koszyku indexu usuwanego elementu 
        const tripName = tripHeader.querySelector('.summary__name').textContent;
        const tripTitles = basket.map(trip => trip.title);
        const index = tripTitles.indexOf(tripName);
        if(index !== -1) {
            basket.splice(index, 1);
            tripTitles.splice(index, 1);
        }

        //aktualizacja ceny
        const tripPrice = parseInt(tripHeader.querySelector('.summary__total-price').textContent)
        const indexPrice = totalBasketAmountArr.indexOf(tripPrice);
        if (indexPrice !== -1) {
            totalBasketAmountArr.splice(indexPrice, 1);
        }
        totalBasketAmountEl.textContent = `${sumTotalBasketAmount(totalBasketAmountArr)}PLN`;
        console.log(basket)
    }
}

function sumTotalBasketAmount(arr) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
        sum += arr[i];
    }
    return sum;
}

class Trip {
    constructor(initTitle, initAdultNumber, initAdultPrice, initChildNumber, initChildPrice) {
        this.title = initTitle;
        this.adultNumber = initAdultNumber;
        this.adultPrice = initAdultPrice;
        this.childNumber = initChildNumber;
        this.childPrice = initChildPrice;
    }
    addTrip(nameEl, priceEl, paragraphEl) {
        nameEl.textContent = this.title;
        const price = (this.adultNumber * this.adultPrice) + (this.childNumber * this.childPrice);
        priceEl.textContent = `${price}PLN`;
        if (this.childNumber === '') {
            paragraphEl.textContent = `dorośli: ${this.adultNumber} x ${this.adultPrice}PLN`;
        } else if (this.adultNumber === '') {
            paragraphEl.textContent = `dzieci: ${this.childNumber} x ${this.childPrice}PLN`;
        } else {
            paragraphEl.textContent = `dorośli: ${this.adultNumber} x ${this.adultPrice}PLN, dzieci: ${this.childNumber} x ${this.childPrice}PLN`;
        }
    }
}


function checkDataAndOrderConfirmation(e) {
    e.preventDefault();
    const formEl = document.querySelector('.panel__order')
    const nameInput = formEl.querySelector('input[name=name]');
    const emailInput = formEl.querySelector('input[name=email');
    const errors = [];
    const correct = [];

    errors.length = 0;
    correct.length = 0;

    checkInput(nameInput.value === '' || !isNaN(Number(nameInput.value)), nameInput, errors, correct);
    checkInput(!emailInput.value.includes('@'), emailInput, errors, correct)

    if (basket.length === 0) {
        alert('Najpierw wybierz wycieczkę!')
    } else {
        if (errors.length > 0) {
            errors.forEach(element => {
                element.style.background = '#FF1700'
            })
        } else {
            alert(`Dziękujemy za złożenie zamówienia o wartości ${totalBasketAmountEl.textContent}. Szczegóły zamówienia zostały wysłane na adres e-mail: ${emailInput.value}`);
            sendExcursionsToDataBase(basket, nameInput.value, emailInput.value);
            console.log(basket)
            clearData(basket, nameInput, emailInput, totalBasketAmountArr, totalBasketAmountEl);
        }
    }
    correct.forEach(element => {
        element.style.background = 'white';
    })
}

function checkInput(expression, input, arr1, arr2) {
    if (expression) {
        arr1.push(input);
    } else {
        arr2.push(input);
    }
}

function sendExcursionsToDataBase(basket, name, email) {
    basket.forEach(trip => {
        const data = {
            name: name,
            email: email,
            title: trip.title,
            adultNumber: trip.adultNumber,
            adultPrice: trip.adultPrice,
            childrenNumber: trip.childNumber,
            childrenPrice: trip.childPrice,
        }
        api.addData(data, apiOrders);
    })
}


function clearData(basket, nameInput, emailInput, totalPriceArr, totalPrice) {
    basket.length = 0;
    nameInput.value = '';
    emailInput.value = '';
    totalPriceArr.length = 0;
    totalPrice.textContent = '0PLN'
    const itemInBasket = document.querySelectorAll('.summary__item');
    itemInBasket.forEach(item => {
        if(!item.classList.contains('summary__item--prototype')) {
            item.remove();
        }
    });
}