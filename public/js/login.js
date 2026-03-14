document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login_form');

    if (!form) {
        console.error('로그인 폼을 찾을 수 없습니다.');
        return;
    }

    form.addEventListener('submit', async (e) => {

        e.preventDefault();

        // 1. 입력값 가져오기
        const login_id = form.elements['login_id'].value.trim();
        const password = form.elements['password'].value.trim();

        // 2. 프론트엔드 1차 유효성 검사 (HTML5 required가 있지만 한번 더 체크)
        if (!login_id) return alert('아이디를 입력해주세요.');
        if (!password || password.length < 8) return alert('비밀번호는 최소 8자 이상이어야 합니다.');

        // 3. 데이터 객체 생성 (DTO에 맞춤)
        const payload = {
            login_id,
            password,
        };

        try {
            // 4. POST 요청
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            // 5. 응답 처리
            if (response.ok) {
                const result = await response.json();
                alert(result.message || '로그인이 성공적으로 완료되었습니다!');

                // 로그인 성공 시: URL에서 redirect 꼬리표 찾기
                const urlParams = new URLSearchParams(window.location.search);
                const redirectUrl = urlParams.get('redirect');

                // 꼬리표가 있으면 그곳으로, 없으면 기본 홈으로 이동!
                if (redirectUrl) {
                    window.location.href = redirectUrl;
                } else {
                    window.location.href = '/home'; // 원래 가던 기본 주소
                }
            } else {
                const errorData = await response.json();

                // Nest.js class-validator는 에러 메시지를 배열로 내려주는 경우가 많음
                const errorMessage = Array.isArray(errorData.message)
                    ? errorData.message.join('\n')
                    : errorData.message;

                alert(`로그인 실패:\n${errorMessage || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error('네트워크 오류:', error);
            alert('서버와 통신 중 오류가 발생했습니다.');
        }
    });
});