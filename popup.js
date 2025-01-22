console.log('This is a popup!');

document.getElementById('goToOptions').addEventListener('click', function() {
  chrome.runtime.openOptionsPage();
});
