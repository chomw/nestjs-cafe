/**
 * 이미지 파일을 서버에 업로드하고 CDN URL을 반환하는 공통 함수
 * 
 * @param {File} file - 업로드할 이미지 파일 객체
 * @returns {Promise<string|null>} 업로드된 이미지의 CDN URL
 */
async function uploadImageToServer(file) {
    if (!file) return null;

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch('/api/image-upload', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const uploadData = await response.json();
            // 성공 시 최종 CDN URL만 깔끔하게 반환
            return uploadData.data.imageUrl; 
        } else {
            // 서버에서 내려준 에러 메시지 추출
            const errorData = await response.json();
            const errorMessage = Array.isArray(errorData.message)
                ? errorData.message.join('\n')
                : errorData.message;
            
            // UI 처리는 이 함수를 호출한 쪽에서 하도록 에러를 던짐
            throw new Error(errorMessage || '알 수 없는 오류가 발생했습니다.');
        }
    } catch (error) {
        console.error('이미지 업로드 네트워크 오류:', error);
        // 네트워크 끊김 등의 치명적 오류도 호출한 쪽으로 넘김
        throw new Error(error.message || '서버와 통신 중 오류가 발생했습니다.');
    }
}