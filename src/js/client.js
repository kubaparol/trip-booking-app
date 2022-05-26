import './../css/client.css';
import './../css/loader.css';

import ExcursionsAPI from './ExcursionsAPI';

import Trip from './trip.js';

const api = new ExcursionsAPI();

document.addEventListener('DOMContentLoaded', init);

function init() {
    console.log('client');
    
    loadExcursions();
}

const apiExcursions = 'https://fake-database-server.herokuapp.com/excursions';
const apiOrders = 'https://fake-database-server.herokuapp.com/orders';
const totalBasketAmountEl = document.querySelector('.order__total-price-value');
const totalBasketAmountArr = [];
const basket = [];

const orderInput = document.querySelector('.order__field-submit');
orderInput.addEventListener('click', checkDataAndOrderConfirmation);

function displayLoading(loader) {
    loader.style.display = 'block';
    document.body.style.pointerEvents = 'none';
    document.body.style.opacity = '0.4';
}

function hideLoading(loader) {
    loader.style.display = 'none';
    document.body.style.pointerEvents = 'auto';
    document.body.style.opacity = '1';
}

function loadExcursions() {
    const loader = document.querySelector('.excursions__loader');
    displayLoading(loader)

    api.loadData(apiExcursions)
        .then(data => {
            hideLoading(loader)
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
    } else if (isNaN(Number(adultNumber.value)) || isNaN(Number(childrenNumber.value)) || Math.sign(adultNumber.value) === -1 || Math.sign(childrenNumber.value) === -1 ) {
        alert('Wprowadź poprawne wartości!');
    } else {
        summaryEl.appendChild(newSummaryItem);
        basket.push(trip);
        trip.addTrip(itemTitle, itemPrice, itemParagraph);
        totalBasketAmountArr.push(parseInt(itemPrice.textContent));
        totalBasketAmountEl.textContent = `${sumTotalBasketAmount(totalBasketAmountArr)}PLN`;
    }
    clearValues(adultNumber, childrenNumber);
    getRemoveButtons();
}

function clearValues(input1, input2) {
    input1.value = '';
    input2.value = '';
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
        element.style.background = 'transparent';
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