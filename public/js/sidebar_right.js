document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
        });

        if (response.ok) {
            alert('안전하게 로그아웃 되었습니다.');
            window.location.href = '/api/home';
        } else {
            alert('로그아웃 처리에 실패했습니다.');
        }
    } catch (error) {
        console.error('로그아웃 에러:', error);
    }
});
