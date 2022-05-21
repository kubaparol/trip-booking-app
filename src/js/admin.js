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
    removePrototype();
    const liPrototype = document.querySelector('.excursions__item--prototype')
    excursionsArr.forEach(item => {
        const newLi = liPrototype.cloneNode(true);
        newLi.classList.remove('excursions__item--prototype');
        const newLiTitle = newLi.querySelector('.excursions__title');
        const newLiDescription = newLi.querySelector('.excursions__description');
        const newLiAdultPrice = newLi.querySelector('.adults-price');
        const newLiChildrenPrice = newLi.querySelector('.children-price');

        getDataExcursions(newLi, newLiTitle, newLiDescription, newLiAdultPrice, newLiChildrenPrice, item);

        ulEl.appendChild(newLi);
    })
}

function removePrototype() {
    const liElList = document.querySelectorAll('.excursions__item');
    liElList.forEach(li => {
        if (!li.classList.contains('excursions__item--prototype')) {
            li.remove();
        }
    })
}

function getDataExcursions(liDataset, liTitle, liDescription, liAdultPrice, liChildrenPrice, item) {
    liDataset.dataset.id = item.id;
    liTitle.textContent = item.title;
    liDescription.textContent = item.description;
    liAdultPrice.textContent = item.adultPrice;
    liChildrenPrice.textContent = item.childrenPrice;
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

        const {
            title,
            description,
            adultPrice,
            childrenPrice
        } = e.target;
        const data = {
            title: title.value,
            description: description.value,
            adultPrice: adultPrice.value,
            childrenPrice: childrenPrice.value
        };
        const errors = [];
        checkErrors(errors, data);
        if (errors.length > 0) {
            alert('Uzupełnij wszystkie dane!')
        } else {
            api.addData(data, apiExcursions)
                .finally(loadExcursions);
            clearInputs(title, description, adultPrice, childrenPrice);
        }
    });
}

function checkErrors(errorsArr, key) {
    for (const prop in key) {
        if (key[prop] === '') {
            errorsArr.push('error');
        }
    }
}

function clearInputs(title, description, adultPrice, childrenPrice) {
    title.value = '';
    description.value = '';
    adultPrice.value = '';
    childrenPrice.value = '';
}

function updateExcursions() {
    const ulEl = document.querySelector('.excursions');
    ulEl.addEventListener('click', e => {
        const targetEl = e.target;
        const liEl = targetEl.parentElement.parentElement.parentElement;
        const button = liEl.querySelector('.excursions__field-input--update');
        if (targetEl === button) {
            console.log(button)
            e.preventDefault();
            const spanList = liEl.querySelectorAll('span');
            const isEditable = [...spanList].every(span => span.isContentEditable);
            if (isEditable) {
                spanIsEditable(button, spanList, liEl);
            } else {
                spanIsNotEditable(button, spanList, liEl);
            }
        }
    })
}

function spanIsEditable(button, spanList, liEl) {
    const id = liEl.dataset.id;
    const [title, description, adultPrice, childrenPrice] = spanList;
    const data = {
        title: title.innerText,
        description: description.innerText,
        adultPrice: adultPrice.innerText,
        childrenPrice: childrenPrice.innerText
    }
    api.updateData(apiExcursions, id, data)
        .finally(() => {
            button.value = 'edytuj';
            spanList.forEach(span => span.contentEditable = false);
            liEl.classList.remove('is-editable');
        })
}

function spanIsNotEditable(button, spanList, liEl) {
    button.value = 'zapisz';
    spanList.forEach(span => span.contentEditable = true);
    liEl.classList.add('is-editable');
}