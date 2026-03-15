document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('home_create_form');

    if (!form) {
        console.error('폼을 찾을 수 없습니다.');
        return;
    }

    form.addEventListener('submit', async (e) => {
        
        e.preventDefault();

        // 1. 입력값 가져오기
        const name = document.getElementById('cafeName').value;
        const address = document.getElementById('cafeAddress').value;
        const description = document.getElementById('cafeDescription').value;

        // 라디오 버튼 값 가져오기
        const publicTypeInput = document.querySelector('input[name="public_type"]:checked');
        const public_type = publicTypeInput ? parseInt(publicTypeInput.value) : 0;

        // 2. 유효성 검사
        if (!name) return alert('카페 이름을 입력해주세요.');
        if (!address) return alert('카페 주소를 입력해주세요.');

        // 3. 데이터 객체 생성
        const payload = {
            name,
            address,
            description,
            public_type,
        };

        try {
            // 4. POST 요청
            const response = await window.fetchWithAuth('/api/cafe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            
            // 5. 응답 처리
            if (response.ok) {
                const result = await response.json();
                alert('카페가 성공적으로 개설되었습니다!');
                window.location.href = '/';
            } else {
                const errorData = await response.json();
                alert(`생성 실패: ${errorData.message || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error('네트워크 오류:', error);
            alert('서버와 통신 중 오류가 발생했습니다.');
        }

        // 스토리지에 저장된 accessToken을 헤더에 포함.
        // 401 에러가 발생하면? 팝업.
    });


});