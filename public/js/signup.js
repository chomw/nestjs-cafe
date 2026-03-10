document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signup_form');

    if (!form) {
        console.error('회원가입 폼을 찾을 수 없습니다.');
        return;
    }

    form.addEventListener('submit', async (e) => {
        
        e.preventDefault();

        // 1. 입력값 가져오기
        const login_id      = form.elements['login_id'].value.trim();
        const password      = form.elements['password'].value.trim();
        const email         = form.elements['email'].value.trim();
        const name          = form.elements['name'].value.trim();
        const nickname      = form.elements['nickname'].value.trim();
        const birth         = form.elements['birth'].value;
        const phone_num     = form.elements['phone_num'].value.trim();

        // 2. 프론트엔드 1차 유효성 검사 (HTML5 required가 있지만 한번 더 체크)
        if (!login_id) return alert('아이디를 입력해주세요.');
        if (!password || password.length < 8) return alert('비밀번호는 최소 8자 이상이어야 합니다.');
        if (!email) return alert('이메일을 입력해주세요.');
        if (!name) return alert('이름을 입력해주세요.');
        if (!nickname) return alert('닉네임을 입력해주세요.');

        // 3. 데이터 객체 생성 (DTO에 맞춤)
        const payload = {
            login_id,
            password,
            email,
            name,
            nickname,
        };

        // 선택 항목은 값이 있을 때만 추가 (@IsOptional 처리용)
        if (birth) payload.birth = birth;
        if (phone_num) payload.phone_num = phone_num;

        /* * 💡 [참고] 프로필 이미지 파일 전송에 관하여
         * 현재는 application/json 형태로 텍스트 데이터만 전송합니다.
         * 실제 이미지 파일을 서버로 보내려면 JSON 대신 FormData를 사용하거나,
         * 이미지만 먼저 업로드하는 별도의 API를 호출하여 URL을 받아와야 합니다.
         */

        try {
            // 4. POST 요청
            const response = await fetch('/api/user/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            
            // 5. 응답 처리
            if (response.ok) {
                const result = await response.json();
                alert(result.message || '회원가입이 성공적으로 완료되었습니다!');
                
                // 가입 성공 시 로그인 페이지(또는 인트로 화면)로 이동
                window.location.href = '/api/login'; 
            } else {
                const errorData = await response.json();
                
                // Nest.js class-validator는 에러 메시지를 배열로 내려주는 경우가 많음
                const errorMessage = Array.isArray(errorData.message) 
                    ? errorData.message.join('\n') 
                    : errorData.message;
                    
                alert(`회원가입 실패:\n${errorMessage || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error('네트워크 오류:', error);
            alert('서버와 통신 중 오류가 발생했습니다.');
        }
    });
});