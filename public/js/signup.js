document.addEventListener('DOMContentLoaded', () => {
    loadPhoneNumInput();
    loadBirthInput();
    loadPreviewImage();
    loadForm();    
});

function loadPhoneNumInput() {
    const phoneInput = document.getElementById('phone_num');

    phoneInput.addEventListener('input', function (event) {
        // 정규표현식: 0~9(숫자)가 '아닌' 모든 문자를 찾아 빈 문자열('')로 치환
        const regex = /[^0-9]/g;

        // 문자가 섞여 들어오면 숫자만 남기고 다 지움
        event.target.value = event.target.value.replace(regex, '');
    });
}

function loadBirthInput() {
    const birthdateInput = document.getElementById('birth');
    
    const dateObj = new Date();
    const today = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;    

    // input 태그의 max 속성에 오늘 날짜를 할당
    birthdateInput.setAttribute('max', today);
}

function loadPreviewImage() {
    const fileInput = document.getElementById('profile_img');
    const previewImage = document.getElementById('image_preview');
    const defaultIcon = document.getElementById('default_icon');
    const fileNameDisplay = document.getElementById('file_name_display');

    fileInput.addEventListener('change', function (event) {
        const file = event.target.files[0];

        if (file) {
            // 1. 파일명 표시
            fileNameDisplay.textContent = `선택된 파일: ${file.name}`;

            // 2. FileReader로 이미지 읽기 및 미리보기 렌더링
            const reader = new FileReader();

            // 파일 읽기가 완료되면 실행되는 콜백 함수
            reader.onload = function (e) {
                previewImage.src = e.target.result; // Base64 형태의 이미지 데이터
                previewImage.style.display = 'block'; // 이미지 태그 노출
                defaultIcon.style.display = 'none';   // 기본 아이콘 숨김
            };

            // 파일을 Data URL 방식으로 읽기 시작
            reader.readAsDataURL(file);
        } else {
            // 사용자가 파일 선택 창을 열었다가 취소했을 경우 초기화
            previewImage.src = '';
            previewImage.style.display = 'none';
            defaultIcon.style.display = 'block';
            fileNameDisplay.textContent = '';
        }
    });
}

function loadForm() {
    const form = document.getElementById('signup_form');

    if (!form) {
        console.error('회원가입 폼을 찾을 수 없습니다.');
        return;
    }

    form.addEventListener('submit', async (e) => {

        e.preventDefault();

        // 1. 입력값 가져오기
        const login_id = form.elements['login_id'].value.trim();
        const password = form.elements['password'].value.trim();
        const email = form.elements['email'].value.trim();
        const name = form.elements['name'].value.trim();
        const nickname = form.elements['nickname'].value.trim();
        const birth = form.elements['birth'].value;
        const phone_num = form.elements['phone_num'].value.trim();

        const fileInput = form.elements['profile_img'];
        const file = fileInput.files[0];

        let profile_img = null;

        if (file) {
            try {
                // 공통 함수 호출 (성공하면 URL이 profile_img에 담김)
                profile_img = await uploadImageToServer(file, 'profile_img');
                console.log('업로드 완료된 URL:', profile_img);

            } catch (error) {
                // 에러 발생 시 현재 맥락(회원가입)에 맞는 경고창 노출
                alert(`이미지 업로드 실패:\n${error.message}`);
                return; // 업로드 실패 시 다음 단계(회원가입 API 호출)로 넘어가지 않고 중단
            }
        }

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
            profile_img
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
                window.location.href = '/login';
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
}