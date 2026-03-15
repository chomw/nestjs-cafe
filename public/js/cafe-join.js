document.addEventListener('DOMContentLoaded', () => {
    loadInput();
    loadPreviewImage();
    loadSubmitBtn();
});


function loadInput () {
    const targetInput = document.getElementById('nickname-input');

    targetInput.addEventListener('input', function(event) {
        // 1. 특수문자를 찾아서 빈 문자열('')로 치환하는 정규표현식
        // 아래는 '영문 대소문자, 숫자, 한글'을 제외한 모든 문자(특수문자, 공백)를 찾습니다.
        const regex = /[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]/g;
        
        // 2. 입력된 값에서 특수문자를 제거
        const cleanValue = event.target.value.replace(regex, '');
        
        // 3. 제거된 깨끗한 값을 다시 input 창에 덮어씌움
        if (event.target.value !== cleanValue) {
            event.target.value = cleanValue;
        }
    });
}

function loadPreviewImage() {
    const fileInput = document.getElementById('profile_img');
    const previewImage = document.getElementById('profile_preview_img');
    const defaultIcon = document.getElementById('default_profile_icon');
    const fileNameDisplay = document.getElementById('file_name_display');

    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];

        if (file) {
            // 파일명 표시
            fileNameDisplay.textContent = `선택된 파일: ${file.name}`;

            // FileReader로 미리보기 렌더링
            const reader = new FileReader();
            
            reader.onload = function(e) {
                previewImage.src = e.target.result; 
                previewImage.style.display = 'block'; 
                
                // 기존 CSS에서 position: absolute를 사용했으므로 
                // defaultIcon을 굳이 display: none 할 필요는 없지만, 
                // DOM에서 안 보이게 숨기는 것이 더 깔끔합니다.
                defaultIcon.style.display = 'none';   
            };
            
            reader.readAsDataURL(file);
        } else {
            // 취소했을 경우 초기화
            previewImage.src = '';
            previewImage.style.display = 'none';
            defaultIcon.style.display = 'block';
            fileNameDisplay.textContent = '';
        }
    });
}

function loadSubmitBtn() {
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
        
        const fileInput = document.getElementById('profile_img');
        const file = fileInput.files[0];

        let profile_img = null;

        if (file) {
            try {
                profile_img = await uploadImageToServer(file);
                console.log('업로드 완료된 URL:', profile_img);

            } catch (error) {
                alert(`이미지 업로드 실패:\n${error.message}`);
                return; // 업로드 실패 시 다음 단계로 넘어가지 않고 중단
            }
        }

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
}