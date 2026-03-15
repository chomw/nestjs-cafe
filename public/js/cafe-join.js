document.addEventListener('DOMContentLoaded', () => {
    const submitBtn = document.querySelector('.btn-submit');
    const nicknameInput = document.querySelector('.nickname-input');

    if (!submitBtn) {
        console.error('가입 버튼을 찾을 수 없습니다.');
        return;
    }

    if (!nicknameInput) {
        console.error('가입 버튼을 찾을 수 없습니다.');
        return;
    }

    submitBtn.addEventListener('click', async () => {
        const nickname = nicknameInput.value.trim();

        if (!nickname) {
            return alert('별명을 입력해주세요.');
        }

        const cafeId = submitBtn.dataset.cafeId;
        const address = submitBtn.dataset.address;
        const profile_img = null;

        try {
            console.log('body: ' + JSON.stringify({cafeId, nickname, profile_img}));
            const response = await window.fetchWithAuth('/api/cafe/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cafeId, nickname, profile_img })
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message || '가입이 완료되었습니다!');
                window.location.href = `/cafe/${address}`; 
            } else {
                // 중복 가입, 닉네임 중복 등의 커스텀 예외 메시지 출력
                alert(`가입 실패: ${result.message || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error('API 통신 에러:', error);
            alert('서버와 통신 중 오류가 발생했습니다.');
        }

    });    
});