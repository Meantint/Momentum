// 배경을 변경해주는 함수
async function setRenderBackground() {
    // Binary large object
    const result = await axios.get("https://picsum.photos/1280/720", {
        responseType: "blob",
    });
    // console.log(result);
    // console.log(result.data);
    // img에 url로 src="url"
    const data = URL.createObjectURL(result.data);
    // console.log(data);
    document.querySelector("body").style.backgroundImage = `url(${data})`;
}

// 시계 설정 함수
function setTime() {
    const timer = document.querySelector(".timer");
    const date = new Date();
    // console.log(date.getFullYear());
    // console.log(Date.now() / 100);
    // console.log(new Date());
    // console.log(date.getHours());
    // console.log(date.getMinutes());
    // console.log(date.getSeconds());

    // timer.textContent = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

    setInterval(() => {
        const date = new Date();
        const morning_evening = document.querySelector(".morning-evening");
        // 자릿수 두 자리로 고정
        timer.textContent = `${date
            .getHours()
            .toString()
            .padStart(2, "0")}:${date
            .getMinutes()
            .toString()
            .padStart(2, "0")}:${date
            .getSeconds()
            .toString()
            .padStart(2, "0")}`;
        
        if (date.getHours() >= 12) {
            morning_evening.textContent = "evening";
        } else {
            morning_evening.textContent = "morning";
        }
    }, 1000);
}

// memo 불러오기
function getMemo() {
    const memo = document.querySelector(".memo");
    const memoValue = localStorage.getItem("todo");
    memo.textContent = memoValue;
}

// memo 저장
function setMemo() {
    const memoInput = document.querySelector(".memo-input");
    memoInput.addEventListener("keyup", function (e) {
        // console.log(e.code);
        // console.log(e.target.value);
        if (e.code === "Enter" && e.target.value) {
            localStorage.setItem("todo", e.target.value);
            getMemo();
            memoInput.value = "";
        }
    });
}

// memo 삭제
function deleteMemo() {
    document.addEventListener("click", function (e) {
        console.log(e.target);
        if (e.target.classList.contains("memo")) {
            // localStorage item 삭제
            localStorage.removeItem("todo");
            // memo html 비워주기
            e.target.textContent = "";
        }
    });
}

function memos() {
    setMemo();
    getMemo();
    deleteMemo();
}

// callback
// callback hell..
// function navigator.geolocation.getCurrentPosition(function(data){
//     data.coords.latitude;
//     data.coords.longitude;
//     // 날씨 데이터 받아오기
//     ajax("날씨 주소 (위도, 경도)", function(data){
//         console.log(data);
//         data function(){
//             //....
//         }
//     }
// })

// 위도 경도 가져오기 -> Promise
function getPosition(options) {
    return new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
}

// 날씨 가져오기
async function getWeather(latitude, longitude) {
    // 위도와 경도가 있는 경우
    if (latitude && longitude) {
        const data = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=ecdfde5937ac4259526ef7bb5175df3c`
        );
        return data;
    }
    // 위도와 경도가 없는 경우
    const data = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=Seoul&appid=ecdfde5937ac4259526ef7bb5175df3c`
    );
    return data;
}
// 날씨 data 제대로 가져오는지 test
// getWeather("", "").then((li) => console.log(li));

// ecdfde5937ac4259526ef7bb5175df3c

function matchIcon(weatherData) {
    if (weatherData === "Clear") return "./images/039-sun.png";
    if (weatherData === "Clouds") return "./images/001-cloud.png";
    if (weatherData === "Rain") return "./images/003-rainy.png";
    if (weatherData === "Snow") return "./images/006-snowy.png";
    if (weatherData === "Thunderstorm") return "./images/008-storm.png";
    if (weatherData === "Drizzle") return "./images/031-snowflake.png";
    if (weatherData === "Atmosphere") return "./images/033-hurricane.png";
}

function weatherWrapperComponent(li) {
    // console.log(li);
    // console.log(li.main.temp);
    const changeToCelsius = (temp) => (li.main.temp - 273.15).toFixed(1);

    // console.log(changeToCelsius);

    return `
    <div class="card shadow-sm bg-transparent mb-3 m-2 flex-grow-1">
    <div class="card-header text-white text-center">
    ${li.dt_txt.split(" ")[0]}
    <span></span>
    </div>

    <div class="card-body d-flex">

    <div class="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
        <h5 class="card-title">
            ${li.weather[0].main}
        </h5>
        <img src="${matchIcon(li.weather[0].main)}" width="60px" height="60px"/>
        <p class="card-text">${changeToCelsius(li.main.temp)}</p>
    </div>
    </div>
    </div>
    `;
}

// 위도와 경도를 받아서 데이터를 받아오기
async function renderWeather() {
    let latitude = "";
    let longitude = "";
    try {
        const position = await getPosition();
        // console.log(position.coords.latitude);
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
    } catch (err) {
        console.log(err);
    }
    // finally {
    //     console.log("test");
    //     const weatherResponse = await getWeather(latitude, longitude);
    //     console.log(weatherResponse);
    // }
    const weatherResponse = await getWeather(latitude, longitude);
    const weatherData = weatherResponse.data;
    // console.log(weatherData);
    weatherList = weatherData.list.reduce((acc, cur) => {
        if (cur.dt_txt.indexOf("18:00:00") > 0) {
            acc.push(cur);
        }
        return acc;
    }, []);
    // console.log(weatherList);
    const modalBody = document.querySelector(".modal-body");
    modalBody.innerHTML = weatherList
        .map((li) => {
            return weatherWrapperComponent(li);
        })
        .join("");

    setInterval(() => {
        const cur = Date.now() / 1000 + 36000; // UTC +9 라서(한국) 9 * 60 * 60 더해줌
        // console.log(cur);
        let sav = -1;
        // 하루 8개 (5일 => 40개)
        for (let i = 0; i < 40; ++i) {
            // console.log(weatherData.list[i].dt);
            // 현재 시간이 탐색 날짜보다 앞인 첫 번째 구간을 찾는다(현재 시간과 가장 가까운 지난 시간을 찾는다)
            if (cur < weatherData.list[i].dt) {
                break;
            } else {
                sav = i;
            }
        }
        // console.log(
        //     `weatherData 리스트 ${sav}번 기준 출력 (${(9 + 3 * sav) % 24}시, ${
        //         weatherData.list[sav].weather[0].main
        //     })`
        // );
        // sav : 각각 09시 기준 + 03시
        // console.log(sav);
        const modalButton = document.querySelector(".modal-button");

        modalButton.style.backgroundImage =
            "url(" + matchIcon(weatherData.list[sav].weather[0].main) + ")";
        // console.log(modalButton.style.backgroundImage);
    }, 1000);
}

(function () {
    setRenderBackground();
    setInterval(() => {
        setRenderBackground();
    }, 5000);
    setTime();
    memos();
    renderWeather();
})();