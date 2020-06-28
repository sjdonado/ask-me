function send() {
    const vscode = acquireVsCodeApi();
    if (question.value.length > 0) {
        vscode.postMessage({
            command: 'question-asked',
            text: question.value
        });
    }
}

window.onload = function() {
    document.getElementById('question').focus();
};