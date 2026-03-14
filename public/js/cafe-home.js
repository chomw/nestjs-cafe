document.addEventListener('DOMContentLoaded', () => {
    const postListContainer = document.getElementById('post-list-container');
    const paginationContainer = document.getElementById('pagination-container');
    
    const address = postListContainer.dataset.address;

    // HBS에서 숨겨둔 초기 페이지 데이터 가져오기
    let currentPage = parseInt(paginationContainer.dataset.currentPage, 10) || 1;
    let totalPages = parseInt(paginationContainer.dataset.totalPages, 10) || 1;

    const postPagination = new Pagination('pagination-container', (targetPage) => {
        // 버튼이 눌리면 이 fetchPosts 함수가 실행됨
        fetchPosts(targetPage);
    });

    // 최초 로딩 시 1번 그려주기
    postPagination.render(currentPage, totalPages);


    // ==========================================
    // API로 새 데이터를 가져오는 함수
    // ==========================================
    async function fetchPosts(targetPage) {
        try {
            const limit = 10; // 요구사항: 한 페이지당 10개
            const response = await fetch(`/api/cafe/${address}/posts?page=${targetPage}&limit=${limit}`);
            const result = await response.json();

            if (response.ok) {
                const data = result.data;
                renderPosts(data.posts);

                // 새로운 페이지 정보로 페이징 UI만 다시 렌더링!
                postPagination.render(data.currentPage, data.totalPages);
            } else {
                alert('게시글을 불러오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('API Error:', error);
            alert('서버 통신 오류가 발생했습니다.');
        }
    }

    // ==========================================
    // 함수 3: 게시글 목록 HTML을 갱신하는 함수
    // ==========================================
    function renderPosts(posts) {
        postListContainer.innerHTML = ''; // 기존 게시글 비우기

        if (posts.length === 0) {
            postListContainer.innerHTML = '<div style="padding: 40px; text-align: center; color: #888;">등록된 게시글이 없습니다.</div>';
            return;
        }

        // 받아온 데이터로 HTML 조립 후 삽입
        posts.forEach(post => {
            // 날짜 포맷팅 (YYYY-MM-DD HH:mm)
            const dateObj = new Date(post.createdAt);
            const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;

            let thumbnailHtml = '';
            if (post.thumbnailUrl) {
                thumbnailHtml = `
                    <div class="post-thumbnail">
                        <img src="${post.thumbnailUrl}" alt="썸네일">
                    </div>
                `;
            }

            const postHtml = `
                <div class="post-item">
                    <div class="post-main">
                        <a href="/cafe/${address}/post/${post.id}" class="post-title">${post.title}</a>
                    </div>
                    <div class="post-side">
                        <div class="post-author-info">
                            <span class="author-name">${post.nickname || '탈퇴한 사용자'}</span>
                            <span class="author-date">${formattedDate}</span>
                        </div>
                        <div class="post-meta">
                            <span class="meta-item">조회 ${post.viewCount || 0}</span>
                            <span class="meta-item"><i class="fa-regular fa-heart"></i> ${post.likeCount || 0}</span>
                            <span class="meta-item"><i class="fa-regular fa-comment"></i> ${post.commentCount || 0}</span>
                        </div>
                    </div>
                    ${thumbnailHtml}
                </div>
            `;
            postListContainer.insertAdjacentHTML('beforeend', postHtml);
        });
    }
});