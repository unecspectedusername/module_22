class Screen {
    innerWidth = window.innerWidth;
    innerHeight = window.innerHeight;

    get innerSize() {
        return `${this.innerWidth} x ${this.innerHeight} px`
    }
}

function makeElement({
                         tag = 'div',
                         text,
                         id,
                         classList
                     }) {

    const element = document.createElement(tag)
    if (text) element.textContent = text;
    if (id) element.id = id;
    if (classList) {
        const classNames = Array.isArray(classList) ? classList : [classList];
        classNames.forEach(c => element.classList.add(c))
    }
    return element;
}

function createLoader() {
    const loader = makeElement({
        tag: 'div',
        classList: 'loader'
    });
    const spinner = makeElement({
        tag: 'div',
        classList: 'spinner'
    });
    loader.appendChild(spinner);
    return loader;
}

async function getLocation() {
    if ("geolocation" in navigator) {
        try {
            const location = await new Promise((res, rej) => {
                navigator.geolocation.getCurrentPosition(res, rej)
            })
            return `Широта: ${location.coords.latitude}, долгота: ${location.coords.longitude}`
        } catch {
            return 'Информация о позиции недоступна'
        }
    } else {
        return 'Информация о позиции недоступна'
    }
}

async function showScreenData(parent) {
    const screen = new Screen()

    const header = makeElement({
        tag: 'h2',
        text: 'Данные пользователя:',
        classList: 'right-block__header'
    })
    const screenInfo = makeMessage('screen-info', 'Размеры окна браузера', screen.innerSize);

    const location = await getLocation()
    let locationInfo;
    if (await location) {
        locationInfo = makeMessage('location-info', 'Координаты пользователя', location)
    } else {
        locationInfo = makeMessage('location-info', 'Координаты пользователя', 'Информация о местоположении недоступна')
    }

    parent.innerHTML = '';
    [header, screenInfo, locationInfo].forEach(node => parent.appendChild(node))
}

function makeMessage(wrapperId, headerText, data) {
    const wrapper = makeElement({
        id: wrapperId,
        classList: 'right-block-message-wrapper'
    });
    const header = makeElement({
        tag: 'h3',
        text: headerText,
        classList: 'right-block__message-header'
    });
    const message = makeElement({
        tag: 'p',
        text: data,
        classList: 'right-block__message'
    });
    [header, message].forEach(e => wrapper.appendChild(e));
    return wrapper;
}

document.querySelector('.button').addEventListener('click', async () => {
    const rightBlock = document.querySelector('div.right-block');

    const loader = createLoader();
    rightBlock.appendChild(loader);

    try {
        await showScreenData(rightBlock);
    } finally {
        rightBlock.removeChild(loader);
    }
})