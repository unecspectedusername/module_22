let websocket, serverIsUp;

class Message {
    constructor(text = null) {
        this.node = document.createElement('div');
        if (text) this.node.textContent = text;
        this.node.className = 'message'
    }

    show() {
        const screen = document.querySelector('.messenger__screen')
        screen.prepend(this.node)
    }
}

class Status extends Message {
    constructor(text, preloader = false) {
        super(text);
        this.preloader = preloader;
        this.node.className = 'message--status'
    }

    show() {
        const screen = document.querySelector('.messenger__screen')
        screen.appendChild(this.node)
        if (this.preloader === true) {
            const preloader = document.createElement('div');
            preloader.className = 'preloader';
            this.node.appendChild(preloader)
        }
    }

    hide() {
        const element = this.node;
        const startOpacity = 1;
        const endOpacity = 0;
        const duration = 2000;
        const delay = 1000;
        const startTime = performance.now();
        let isAnimating = false;

        function animate(currentTime) {
            if (!isAnimating) return;

            const progress = (currentTime - startTime) / duration;
            if (progress < 1) {
                const opacity = startOpacity + (endOpacity - startOpacity) * progress;
                element.style.opacity = opacity.toString()
                requestAnimationFrame(animate);
            } else {
                element.style.opacity = endOpacity.toString();
            }
        }

        setTimeout(() => {
            isAnimating = true;
            requestAnimationFrame(animate);
        }, delay);
    }

    remove() {
        this.node.remove()
    }

}

class IncomingMessage extends Message {
    constructor(text) {
        super(text);
        this.node.classList.add('message--incoming')
    }
}

class OutgoingMessage extends Message {
    constructor(text) {
        super(text);
        this.node.classList.add('message--outgoing')
    }

    sendLocation(url) {
        const link = document.createElement('a')
        link.href = url;
        link.textContent = 'Мое местоположение'
        link.setAttribute('target', '_blank')
        this.node.appendChild(link)
        this.show()
    }
}

function connect() {
    let status = new Status('Соединение с сервером', true)
    status.show()
    websocket = new WebSocket('wss://echo.websocket.org/');
    websocket.onopen = () => {
        serverIsUp = true;
        status.remove();
        status = new Status('Соединение установлено')
        status.show()
        status.hide()
    }
    websocket.onerror = () => {
        serverIsUp = false;
        status.remove()
        status = new Status('Не удалось установить соединение с сервером')
        status.show()
    }
}

function sendMessage(dontSendToServer = false) {
    const text = document.querySelector('#input').value
    if (!serverIsUp) {
        const status = new Status('Нет соединения с сервером')
        document.querySelector('.message--status').remove()
        status.show()
        return
    }
    if (text) {
        const message = new OutgoingMessage(text);
        message.show();
        if (!dontSendToServer) {
            websocket.send(text)
        }
    }
}

function receiveAnswer() {
    websocket.onmessage = (m) => {
        const response = m.data;
        const message = new IncomingMessage(response)
        message.show()
    }
}

async function sendLocation() {
    const status = new Status('Определяю местоположение', true)
    status.show()
    if ("geolocation" in navigator) {
        try {
            const location = await new Promise((res, rej) => {
                navigator.geolocation.getCurrentPosition(res, rej)
            })
            status.hide()
            const message = new OutgoingMessage()
            const url = `https://www.openstreetmap.org/#map=18/${location.coords.latitude}/${location.coords.longitude}`
            message.sendLocation(url)

        } catch {
            status.remove()
            const error = new Status('Определение местоположения отключено')
            error.show()
            error.hide()
            throw new Error('Информация о геопозиции недоступна')
        }
    } else {
        status.remove()
        const error = new Status('Браузер не поддерживает определение местоположения')
        error.show()
        error.hide()
        throw new Error('Браузер не поддерживает определение геолокации')
    }
}

document.querySelector('.messenger__send-button').addEventListener('click', (e) => {
    e.preventDefault()
    sendMessage()
    receiveAnswer()
})

document.querySelector('.messenger__location-button').addEventListener('click', async (e) => {
    e.preventDefault()
    await sendLocation();
})

window.addEventListener("load", (event) => {
    connect()
});
