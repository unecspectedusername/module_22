function showPreloader() {
    const root = document.querySelector(':root')
    root.style.setProperty("--background", 'transparent');
    root.style.setProperty("--opacity", '1');
}

function createElement({tag = 'div', text, id, classList}) {

    const element = document.createElement(tag)
    if (text) element.textContent = text;
    if (id) element.id = id;
    if (classList) {
        const classNames = Array.isArray(classList) ? classList : [classList];
        classNames.forEach(c => element.classList.add(c))
    }
    return element;
}

function createContent(message) {
    const wrapper = createElement({
        classList: 'data'
    })
    const header = createElement({
        tag: 'h1',
        text: message,
        classList: 'data__header'
    })
    wrapper.appendChild(header);
    return wrapper
}

function createListElement(text, data) {
    const listElement = createElement({
        tag: 'li',
        classList: 'data__list-element',
        text: text,
    })
    const span = createElement({
        tag: 'span',
        text: data || 'не удалось получить данные'
    })
    listElement.appendChild(span)
    return listElement
}

function createList(data) {
    const list = createElement({
        tag: 'ul',
        classList: 'data__list'
    })

    const timeZone = createListElement('Временная зона: ', data.timezone);

    const localTime = createListElement('Местное время: ', data.date_time_txt);

    [timeZone, localTime].forEach(e => list.appendChild(e))

    return list;
}

function showError(message) {
    const error = createContent(message);
    document.body.innerHTML = '';
    document.body.appendChild(error)
}

async function getLocation() {
    if ("geolocation" in navigator) {
        try {
            const location = await new Promise((res, rej) => {
                navigator.geolocation.getCurrentPosition(res, rej)
            })
            return {
                lat: location.coords.latitude,
                long: location.coords.longitude
            }
        } catch {
            showError('Информация о геопозиции недоступна')
            throw new Error('Информация о геопозиции недоступна')
        }
    } else {
        showError('Браузер не поддерживает определение геолокации')
        throw new Error('Браузер не поддерживает определение геолокации')
    }
}

async function fetchData(url) {
    let location, data;

    try {
        location = await getLocation();
    } catch (e) {
        return
    }

    const params = new URLSearchParams({
        apiKey: '32bcd4a6e4b548968e7afcdb682ac679',
        lat: location.lat,
        long: location.long,
    }).toString()

    try {
        const response = await fetch(url + '?' + params)
        if (!response.ok) {
            const error = await response.text() || response.statusText;
            showError('Возникла ошибка при загрузке данных ' + error)
            throw new Error(`HTTP error! status: ${response.status}, message: ${error}`);
        }
        return response.headers.get('content-type').includes('application/json')
            ? await response.json()
            : await response.text();
    } catch (error) {
        console.error('Fetch error:', error);
        showError('Не удалось загрузить данные')
        throw error;
    }
}

async function showData(url) {
    let data
    try {
        data = await fetchData(url)
    } catch (e) {
        return;
    }
    const content = createContent('Данные:')
    const list = createList(data);
    content.appendChild(list)
    document.body.innerHTML = '';
    document.body.appendChild(content)
}


document.querySelector('.get-data').addEventListener('click', async () => {
    showPreloader()
    await showData('https://api.ipgeolocation.io/timezone');
})