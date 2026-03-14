document.addEventListener('DOMContentLoaded', () => {
    // 탭 버튼들과, 내용이 담긴 컨테이너들을 모두 찾아옵니다.
    const tabButtons = document.querySelectorAll('.tab-area .tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 1. 모든 탭에서 'active' 클래스를 제거하고, 방금 클릭한 탭에만 'active'를 줍니다.
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // 2. 방금 클릭한 버튼의 data-target 값을 읽어옵니다. (예: 'popular-cafe-container')
            const targetId = button.getAttribute('data-target');

            // 3. 모든 컨테이너를 숨기고, targetId와 일치하는 컨테이너만 보여줍니다.
            tabContents.forEach(content => {
                if (content.id === targetId) {
                    content.style.display = 'block'; // 보여주기
                } else {
                    content.style.display = 'none';  // 숨기기
                }
            });
        });
    });
});