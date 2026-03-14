window.fetchWithAuth = async function(url, options = {}) {
    options.credentials = 'include'; 

    let response = await fetch(url, options);    

    if (response.status === 401) {
        
        // 토큰 만료 감지! 조용한 갱신 시도
        const refreshResponse = await fetch('/auth/refresh', {
            method: 'POST',
            credentials: 'include',
        });

        if (!refreshResponse.ok) {
            // 갱신 실패. 로그인 페이지로 이동
            alert('세션이 만료되었습니다. 다시 로그인해 주세요.');
            window.location.href = '/login';
            return null; 
        }

        console.log('✅ 갱신 성공! 원래 요청 재시도');
        response = await fetch(url, options);
    }

    return response;
};