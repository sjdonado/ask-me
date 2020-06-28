function isMathExpression(str) {
  try {
    Complex.compile(str);
  } catch (error) {
    return false;
  }

  return true;
}

function send() {
  const vscode = acquireVsCodeApi();
  if (question.value.length > 0) {
    vscode.postMessage({
      command: "question-asked",
      text: question.value,
      isMath: isMathExpression(question.value),
    });
  }
}

window.onload = function() {
    document.getElementById('question').focus();
    const chat = document.getElementById('chat');
    chat.scrollTop = chat.scrollHeight;
};
