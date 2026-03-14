class Pagination {
    /**
     * @param {string} containerId - 페이징 버튼들을 담을 HTML 요소의 ID
     * @param {function} onPageClick - 버튼을 클릭했을 때 실행할 API 호출 함수
     */
    constructor(containerId, onPageClick) {
        this.container = document.getElementById(containerId);
        this.onPageClick = onPageClick; // 외부에서 주입받은 함수
    }

    // 화면에 버튼을 그리는 함수 (외부에서 호출 가능)
    render(currentPage, totalPages) {
        if (!this.container) return;
        this.container.innerHTML = ''; // 초기화

        const current = Number(currentPage);
        const total = Number(totalPages);

        if (total <= 1) return;

        // [이전] 버튼
        if (current > 1) {
            this.container.appendChild(this.createBtn('<i class="fa-solid fa-chevron-left"></i>', 'prev-btn', current - 1));
        }

        // [숫자] 버튼들
        for (let i = 1; i <= total; i++) {
            const isActive = (i === current) ? 'active' : '';
            this.container.appendChild(this.createBtn(i, isActive, i));
        }

        // [다음] 버튼
        if (current < total) {
            this.container.appendChild(this.createBtn('<i class="fa-solid fa-chevron-right"></i>', 'next-btn', current + 1));
        }
    }

    // 버튼 생성 헬퍼 (내부에서만 사용)
    createBtn(htmlContent, extraClass, targetPage) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${extraClass}`.trim();
        btn.innerHTML = htmlContent;
        
        if (extraClass !== 'active') {
            // ✨ 핵심: 버튼이 클릭되면 처음에 주입받은 onPageClick 함수를 타겟 페이지 번호와 함께 실행!
            btn.addEventListener('click', () => this.onPageClick(targetPage));
        }
        return btn;
    }
}