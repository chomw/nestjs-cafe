document.addEventListener('DOMContentLoaded', () => {
    // 1. '.local-time' 클래스를 가진 모든 날짜 요소를 찾습니다.
    const dateElements = document.querySelectorAll('.local-date');

    dateElements.forEach(el => {
        // 서버가 HBS를 통해 심어둔 UTC 문자열을 꺼내옵니다.
        const utcString = el.getAttribute('data-utc');

        if (utcString) {
            // 핵심: 브라우저가 알아서 사용자의 로컬 시간(한국이면 KST)으로 객체를 생성합니다!
            const date = new Date(utcString);

            // 변환된 객체에서 년, 월, 일을 뽑아냅니다. (이제 getUTC가 아니라 일반 메서드 사용!)
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            // 비어있던 <span> 태그 안에 예쁘게 조립된 날짜를 쏙 넣어줍니다.
            el.textContent = `${year}-${month}-${day}`;
        }
    });

    const timeElements = document.querySelectorAll('.local-time');

    timeElements.forEach(el => {
        // 서버가 HBS를 통해 심어둔 UTC 문자열을 꺼내옵니다.
        const utcString = el.getAttribute('data-utc');

        if (utcString) {
            console.log('utcString: ' + utcString);
            // 핵심: 브라우저가 알아서 사용자의 로컬 시간(한국이면 KST)으로 객체를 생성합니다!
            const date = new Date(utcString);
            
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');

            const hh = String(date.getHours()).padStart(2, '0');
            const min = String(date.getMinutes()).padStart(2, '0');

            const dateString = `${yyyy}-${mm}-${dd} ${hh}:${min}`;
            console.log('textContent: ' + dateString);
            // 비어있던 <span> 태그 안에 예쁘게 조립된 날짜를 쏙 넣어줍니다.
            el.textContent = dateString;
        }
    });
});