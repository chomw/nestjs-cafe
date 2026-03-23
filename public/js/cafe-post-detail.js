document.addEventListener('DOMContentLoaded', () => {

    loadCommentSubmitBtn();
});


function loadCommentSubmitBtn() {
    const postDetailWrap = document.getElementById('cafe-post-detail');
    const postId = postDetailWrap.dataset.postId; // HBS에서 심어둔 postId 가져오기

    const commentInput = document.getElementById('comment-input');
    const submitBtn = document.getElementById('submit-comment-btn');    
    const commentCountSpan = document.querySelector('.comment-count span');

    submitBtn.addEventListener('click', async () => {
        const content = commentInput.value.trim();

        if (!content) {
            alert('댓글 내용을 입력해주세요.');
            return;
        }

        try {
            // 버튼 연타 방지를 위해 비활성화
            submitBtn.disabled = true;

            const response = await window.fetchWithAuth(`/api/cafe/post/${postId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content })
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.message || '댓글 등록에 실패했습니다.');
                return;
            }

            // TransformInterceptor를 사용 중이므로 보통 result.data 안에 배열이 들어있습니다.
            // 만약 감싸져 있지 않다면 result 자체를 사용합니다.
            const comments = result.data || result;

            // 1. 화면의 댓글 목록 새로 그리기
            renderComments(comments);

            // 2. 총 댓글 수 업데이트
            if (commentCountSpan) {
                commentCountSpan.textContent = comments.length;
            }

            // 3. 입력창 비우기
            commentInput.value = '';

        } catch (error) {
            console.error('댓글 등록 에러:', error);
            alert('네트워크 오류가 발생했습니다.');
        } finally {
            submitBtn.disabled = false; // 버튼 다시 활성화
        }
    });
}

// 서버에서 받아온 데이터로 HTML을 만들어 교체하는 함수
function renderComments(comments) {
    
    const commentList = document.querySelector('.comment-list');

    // 기존 목록 초기화
    commentList.innerHTML = '';

    comments.forEach(comment => {
        const li = document.createElement('li');
        li.className = 'comment-item';

        // 프로필 이미지 없으면 기본 이미지 처리
        const profileImg = comment.profile_img || '/images/avatar-default.jpg';

        const dateObj = new Date(comment.createdAt);
        const formattedDate = window.formatLocalDates(dateObj);

        li.innerHTML = `
                <div class="avatar-wrap size-m">
                    <img src="${profileImg}" alt="프로필" class="avatar-img"
                        onerror="this.src='/images/avatar-default.jpg'">
                </div>
                <div class="comment-content-area">
                    <div class="comment-author">${comment.nickname}</div>
                    <div class="comment-text">${comment.content}</div>
                    <div class="comment-date local-time" data-utc="${formattedDate}"></div>
                </div>
            `;
        commentList.appendChild(li);

        window.loadLocalDate();
    });    
}