function isMathExpression(str) {
  try {
    Complex.compile(str);
  } catch (error) {
    return false;
  }
  return true;
}

const vscode = acquireVsCodeApi();

function send() {
  if (question.value.length > 0) {
    vscode.postMessage({
      command: "question-asked",
      data: question.value,
      isMath: isMathExpression(question.value),
    });
  }
}

window.onload = function() {
  document.querySelectorAll('.copy-to-editor').forEach((elem) => elem.addEventListener('click', () => {
    vscode.postMessage({
      command: "copy-to-editor",
      data: elem.parentNode.querySelector('.code').innerText,
    });
  }));

  document.getElementById('question').focus();

  const chat = document.getElementById('chat');
  chat.scrollTop = chat.scrollHeight;
};
