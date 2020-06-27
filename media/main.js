console.log('LOADED!');

function message(text) {
    const el = document.createElement('span');
    el.className = 'message';
    el.textContent = text;

    return el;
}

function send() {
    const question = document.getElementById('question');
    console.log(question.innerHTML, question.innerText, question.textContent);
    document.getElementById('chat').appendChild(message('test'));
}