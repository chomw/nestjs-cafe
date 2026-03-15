document.addEventListener('DOMContentLoaded', () => {

    loadPreviewImage();
    loadAutoGenBtn();
    loadForm();

});

function loadPreviewImage() {
    const fileInput = document.getElementById('cafe_icon_img');
    const previewImage = document.getElementById('cafe_image_preview');
    const defaultIcon = document.getElementById('default_cafe_icon');
    const fileNameDisplay = document.getElementById('cafe_file_name');

    fileInput.addEventListener('change', function (event) {
        const file = event.target.files[0];

        if (file) {
            // 1. 선택한 파일명 표시
            fileNameDisplay.textContent = `선택된 파일: ${file.name}`;

            // 2. 파일 읽어서 이미지 태그에 렌더링
            const reader = new FileReader();

            reader.onload = function (e) {
                previewImage.src = e.target.result; // Base64 데이터
                previewImage.style.display = 'block'; // 이미지 표시
                defaultIcon.style.display = 'none';   // 기본 머그컵 아이콘 숨김
            };

            reader.readAsDataURL(file);
        } else {
            // 사용자가 파일 창을 열었다가 '취소'를 눌렀을 때 초기화
            previewImage.src = '';
            previewImage.style.display = 'none';
            defaultIcon.style.display = 'block';
            fileNameDisplay.textContent = '';
        }
    });
}

function loadAutoGenBtn() {
    const addressInput = document.getElementById('cafeAddress');
    const autoGenBtn = document.getElementById('btnAutoGen');

    // 10자리 랜덤 문자열(소문자+숫자) 생성 함수
    function generateRandomAddress(length = 10) {
        // 카페 주소에 어울리게 소문자와 숫자만 배치했습니다. 
        // 대문자도 필요하시다면 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'를 추가하시면 됩니다.
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // 자동생성 버튼 클릭 이벤트
    autoGenBtn.addEventListener('click', () => {
        // 랜덤 문자열을 생성하여 input의 value로 삽입
        const randomStr = generateRandomAddress(10);
        addressInput.value = randomStr;

        // 시각적인 피드백을 주고 싶다면 아래처럼 포커스를 줄 수도 있습니다.
        addressInput.focus();
    });
}

function loadForm() {
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

        const fileInput = form.elements['cafe_icon_img'];
        const file = fileInput.files[0];

        // 2. 유효성 검사
        if (!name) return alert('카페 이름을 입력해주세요.');
        if (!address) return alert('카페 주소를 입력해주세요.');

        let icon_img = null;

        if (file) {
            try {
                // 공통 함수 호출 (성공하면 URL이 icon_img에 담김)
                icon_img = await uploadImageToServer(file);
                console.log('업로드 완료된 URL:', icon_img);

            } catch (error) {
                alert(`이미지 업로드 실패:\n${error.message}`);
                return; // 업로드 실패 시 다음 단계로 넘어가지 않고 중단
            }
        }

        // 3. 데이터 객체 생성
        const payload = {
            name,
            address,
            description,
            public_type,
            icon_img
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

}