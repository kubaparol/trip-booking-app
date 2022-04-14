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

export default Trip;