// 导航函数
function navigateTo(page) {
    const frame = document.getElementById('content-frame');
    frame.src = page;
    
    // 添加简单的历史记录
    window.history.pushState({ page }, '', `#${page}`);
}

// 处理浏览器前进/后退
window.addEventListener('popstate', function(event) {
    if (event.state && event.state.page) {
        document.getElementById('content-frame').src = event.state.page;
    }
});

// 初始状态
window.history.replaceState({ page: 'welcome.html' }, '', '#welcome.html');