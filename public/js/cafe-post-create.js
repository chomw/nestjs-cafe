document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cafe-post-create-form');

    if (!form) {
        console.error('글쓰기 폼을 찾을 수 없습니다.');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. 입력값 가져오기 (HTML input/textarea의 name 속성과 일치해야 함)
        const cafeId  = form.dataset.cafeId;
        const title   = form.elements['title'].value.trim();
        const content = form.elements['content'].value.trim();

        // 2. 프론트엔드 1차 유효성 검사
        if (!title) return alert('제목을 입력해주세요.');
        if (title.length > 100) return alert('제목은 100자를 초과할 수 없습니다.');
        if (!content) return alert('내용을 입력해주세요.');

        // 3. 데이터 객체 생성 (CreateCafePostDto 구조에 맞춤)
        const payload = {
            cafeId: Number(cafeId), // DTO에서 숫자를 기대하므로 Number()로 형변환
            title,
            content,
        };
        console.log('payload: ' + JSON.stringify(payload));

        try {
            // 4. POST 요청
            const response = await window.fetchWithAuth('/api/cafe/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            
            // 5. 응답 처리
            if (response.ok) {
                const result = await response.json();
                const createdPost = result.data;

                console.log('result: ' + JSON.stringify(result));

                alert('게시글이 성공적으로 등록되었습니다!');

                // 가입 성공 시 해당 카페의 홈 화면으로 이동
                // 현재 URL(예: /cafes/abcd/posts/new)에서 뒤쪽 경로를 잘라내서 홈으로 보냅니다.
                const cafeAddress  = form.dataset.cafeAddress;
                window.location.href = `/cafe/${cafeAddress}/post/${createdPost.postId}`;
                
            } else {
                const errorData = await response.json();
                
                // NestJS class-validator 에러 메시지 배열 처리
                const errorMessage = Array.isArray(errorData.message) 
                    ? errorData.message.join('\n') 
                    : errorData.message;
                    
                alert(`게시글 등록 실패:\n${errorMessage || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error('네트워크 오류:', error);
            alert('서버와 통신 중 오류가 발생했습니다.');
        }
    });
});