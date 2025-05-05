class Times {
    static #second = 1000;
    static #minute = this.#second * 60;
    static #hour = this.#minute * 60;
    static #day = this.#hour * 24;
    static #week = this.#day * 7;
    static #month = this.#day * 30;
    static #year = this.#day * 365;

    static seconds(t = 1) {
        return this.#second * t;
    }
    static minutes(t = 1) {
        return this.#minute * t;
    }
    static hours(t = 1) {
        return this.#hour * t;
    }
    static days(t = 1) {
        return this.#day * t;
    }
    static weeks(t = 1) {
        return this.#week * t;
    }
    static months(t = 1) {
        return this.#month * t;
    }
    static years(t = 1) {
        return this.#year * t;
    }
}

module.exports = { Times };
