function message(text) {
    const el = document.createElement('span');
    el.className = 'message';
    el.textContent = text;

    return el;
}

function send() {
    const vscode = acquireVsCodeApi();
    const question = document.getElementById('question');
    vscode.postMessage({
        command: "question-asked",
        text: question.value
    });
}