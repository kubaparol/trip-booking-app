import './../css/admin.css';

import ExcursionsAPI from './ExcursionsAPI';

const api = new ExcursionsAPI();

document.addEventListener('DOMContentLoaded', init);
const apiExcursions = 'http://localhost:3000/excursions';

function init() {
    console.log('client');
    
    loadExcursions();
    removeExcursions();
    addExcursions();
    updateExcursions();
}



function loadExcursions() {
    api.loadData(apiExcursions)
        .then(data => {
            insertExcursions(data)
        })
        .catch(err => console.log(err));
}

function insertExcursions(excursionsArr) {
    const ulEl = document.querySelector('.panel__excursions');
    const liElList = document.querySelectorAll('.excursions__item');
    liElList.forEach(li => {
        if(!li.classList.contains('excursions__item--prototype')) {
            li.remove();
        }
    })
    const liPrototype = document.querySelector('.excursions__item--prototype')
    excursionsArr.forEach(item => {
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
    })
}

function removeExcursions() {
    const ulEl = document.querySelector('.panel__excursions');
    ulEl.addEventListener('click', e => {
        e.preventDefault();
        const targetEl = e.target;
        if (targetEl.classList.contains('excursions__field-input--remove')) {
            const liEl = targetEl.parentElement.parentElement.parentElement;
            const id = liEl.dataset.id;
            api.removeData(apiExcursions, id)
                .finally(loadExcursions)
        }
    })
}

function addExcursions() {
    const form = document.querySelector('.form');
    form.addEventListener('submit', e => {
        e.preventDefault();

        const {title, description, adultPrice, childrenPrice} = e.target;
        const data = {
            title: title.value,
            description: description.value,
            adultPrice: adultPrice.value,
            childrenPrice: childrenPrice.value
        };
        const errors = [];
        for(const prop in data) {
            if(data[prop] === '') {
                errors.push('error')
            }
        }
        if(errors.length > 0) {
            alert('Uzupełnij wszystkie dane!')
        } else {
            api.addData(data, apiExcursions)
                .finally(loadExcursions);
            title.value = '';
            description.value = '';
            adultPrice.value = '';
            childrenPrice.value = '';
        }
    });
}

function updateExcursions() {
    const ulEl = document.querySelector('.excursions');
    ulEl.addEventListener('click', e => {
        const targetEl = e.target;
        const liEl = targetEl.parentElement.parentElement.parentElement;
        const button = liEl.querySelector('.excursions__field-input--update');
        if(targetEl === button) {
            console.log(button)
            e.preventDefault();
            const spanList = liEl.querySelectorAll('span');
            const isEditable = [...spanList].every(span => span.isContentEditable);
            if(isEditable) {
                const id = liEl.dataset.id;
                const data = {
                    title: spanList[0].innerText,
                    description: spanList[1].innerText,
                    adultPrice: spanList[2].innerText,
                    childrenPrice: spanList[3].innerText
                }
                api.updateData(apiExcursions, id, data)
                .finally(() => {
                    button.value = 'edytuj';
                    spanList.forEach(span => span.contentEditable = false);
                    liEl.classList.remove('is-editable');
                })
            } else {
                button.value = 'zapisz';
                spanList.forEach(span => span.contentEditable = true);
                liEl.classList.add('is-editable');
            }
        }
    })
}