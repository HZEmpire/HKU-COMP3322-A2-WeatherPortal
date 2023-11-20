// Date: Oct 14, 2023
// Author: Xu Haozhou

// Function for setting the basic html structure
function setHTML(){
    // Get the body
    const body = document.querySelector("body");

    // Set the body's content
    body.innerHTML = `<header> <h1>My Weather Portal</h1> </header> <div class="container"> <div id="home"> <div><h2>Hong Kong<h2></div> <div class="content"> <div id="h_icon"><img></div> <div class="combine"> <div id="h_temp"></div> <div> <sup>°C</sup> <div>&nbsp;</div> </div> </div> <div class="combine"> <div id="h_humi"></div> <div> <sup><img src="./images/drop-64.png"></sup> <div>%</div> </div> </div> <div class="combine"> <div id="h_rain"></div> <div> <sup><img src="./images/rain-48.png"></sup> <div>mm</div> </div> </div> <div class="combine" id="h_uv" style="display: none;"> <div id="h_uv_rate"></div> <div> <sup><img src="./images/UVindex-48.png"></sup> <div>&nbsp;</div> </div> </div> </div> <div id="h_lastupdate"></div> <div id="h_warning" style="display: none;" onclick="warningClick()"> <div id="warning_b">Warning</div> <div id="warmsg" style="display: none;"></div> </div> </div> <div id="myloc"> <div> <h2>My Location<h2> <h3 id="m_loc">Loading your location...</h3> </div> <div class="content" id="m_content" style="display: none;"> <div class="combine"> <div id="m_temp"></div> <div> <sup>°C</sup> <div>&nbsp;</div> </div> </div> <div class="combine"> <div id="m_rain"></div> <div> <sup><img src="./images/rain-48.png"></sup> <div>mm</div> </div> </div> <div class="combine"> <div id="m_AQHI_risk"><img src="./images/aqhi-low.png"></div> <div> <sup id="m_AQHI"></sup> <div id="m_risk"></div> </div> </div> </div> </div> <div id="temp"> <div> <h2>Temperatures<h2> </div> <div id="hide_temp"> <h3>Select the location</h3> <select id="t_loc"></select> <div class="combine" id="t_out" style="display: none;"> <div id="t_outval"></div> <div> <sup>°C</sup> <div>&nbsp;</div> </div> </div> </div> </div> <div id="rain"> <div> <h2>Rainfall<h2> </div> <div id="hide_rain"> <h3>Select the location</h3> <select id="r_loc"></select> <div class="combine" id="r_out" style="display: none;"> <div id="r_outval"></div> <div> <sup>&nbsp;</sup> <div>mm</div> </div> </div> </div> </div> <div id="air"> <div> <h2>Air Quality<h2> </div> <div id="hide_air"> <h3>Select the location</h3> <select id="a_loc"></select> <div id="a_out" style="display: none;"> <div id="a_outval"></div> </div> </div> </div> <div id="nine"> <div><h2>9-Day Forecast<h2><div> <div id="n_forcast"></div> </div> </div>`;

    // Set the click for case <= 500px
    temp_d = document.querySelector("#temp div:first-child");
    temp_d.addEventListener("click", tempClick);
    rain_d = document.querySelector("#rain div:first-child");
    rain_d.addEventListener("click", rainClick);
    air_d = document.querySelector("#air div:first-child");
    air_d.addEventListener("click", airClick);
}

// Function for warning msg click
function warningClick(){
    const warmsg_div = document.querySelector("#warmsg");
    if (warmsg_div.style.display === "none") {
        warmsg_div.style.display = "block";
    } else {
        warmsg_div.style.display = "none";
    }
}

// Function for getting the PSR image link
function getPSR(psr){
    let path;
    switch (psr) {
        case "High":
            path = "High";
            break;
        case "Medium High":
            path = "MediumHigh";
            break;
        case "Medium":
            path = "Medium";
            break;
        case "Medium Low":
            path = "MediumLow";
            break;
        case "Low":
            path = "Low";
            break;
    }
    return `https://www.hko.gov.hk/common/images/PSR${path}_50_light.png`;
}

// Function for setting the background image
function setBackground(time, rain){
    var div = document.querySelector("#home");
    var url = "./images/";
    var text_color = "black";
    if (time >= 6 && time < 18) {
        if (rain > 0)
            url += "water-drops-glass-day.jpg";
        else
            url += "blue-sky.jpg";
        text_color = "black";
    } else {
        if (rain > 0)
            url += "water-drops-glass-night.jpg";
        else
            url += "night-sky.jpg";
        text_color = "white";
    }
    div.style.backgroundImage = `url(${url})`;
    div.style.backgroundRepeat = 'no-repeat';
    div.style.backgroundSize = 'cover';
    div.style.color = text_color;
}

// Function for sorting a dictionary by key in alphabetical order
// e.g. {c:a, b:b, a:c} => {a:c, b:b, c:a}
function sortDict(dict){
    var keys = Object.keys(dict).sort();
    var sorted = {};
    for (let i = 0; i < keys.length; i++) {
        sorted[keys[i]] = dict[keys[i]];
    }
    return sorted;
}

// Function for storting a dictionary acsendingly by .place in alphabetical order
function sortPlace(dict){
    var keys = Object.keys(dict);
    var values = [];
    for (let i = 0; i < keys.length; i++) {
        values.push(dict[keys[i]]);
    }
    values.sort(function(a,b){
        return a.place.localeCompare(b.place);
    });
    var sorted = {};
    for (let i = 0; i < values.length; i++) {
        sorted[values[i].place] = values[i];
    }
    return sorted;
}

// Function for calculating the distance between two places
function calDistance(lat1, lon1, lat2, lon2){
    const R = 6371; // km
    const f1 = lat1 * Math.PI / 180;
    const f2 = lat2 * Math.PI / 180;
    const l1 = lon1 * Math.PI / 180;
    const l2 = lon2 * Math.PI / 180;

    const x = (l2 - l1) * Math.cos((f1 + f2) / 2);
    const y = f2 - f1;
    const d = Math.sqrt(x * x + y * y) * R;
}

// Function for getting data and setting the home, temp, rain blocks
async function setHome(){
    // Get the weather data
    const WRurl = "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=en";
    const WR = await fetch(WRurl)
        .then(response => response.json());
    var districtTemp, districtRain;
    var TempofDistrict = {};  
    var RainofDistrict = {};
    var h_icon = WR.icon[0];
    var h_temp = WR.temperature.data[1].value;
    var h_humi = WR.humidity.data[0].value;
    var h_rain = WR.rainfall.data[13].max;
    
    var h_lastupdate = WR.updateTime;
    districtTemp = WR.temperature.data;
    for (let i = 0; i < districtTemp.length; i++) {
        TempofDistrict[districtTemp[i].place] = districtTemp[i].value;
    }
    districtRain = WR.rainfall.data;
    for (let i = 0; i < districtRain.length; i++) {
        RainofDistrict[districtRain[i].place] = districtRain[i].max;
    }

    // Set the home
    const h_icon_img = document.querySelector("#h_icon img");
    h_icon_img.src = `https://www.hko.gov.hk/images/HKOWxIconOutline/pic${h_icon}.png`;
    const h_temp_div = document.querySelector("#h_temp");
    h_temp_div.textContent = h_temp;
    const h_humi_div = document.querySelector("#h_humi");
    h_humi_div.textContent = h_humi;
    const h_rain_div = document.querySelector("#h_rain");
    h_rain_div.textContent = h_rain;
    const h_lastupdate_div = document.querySelector("#h_lastupdate");
    h_lastupdate_div.textContent = `Last update: ${h_lastupdate.substr(11,5)}`;

    // Handle potential null values
    // UV index may be null
    if (WR.uvindex.data != null) {
        const h_uv = document.querySelector("#h_uv");
        h_uv.style.display = "flex";
        const h_uv_rate = WR.uvindex.data[0].value;
        const h_uv_div = document.querySelector("#h_uv_rate");
        h_uv_div.textContent = h_uv_rate;
    }

    // Warning info may be null
    if (WR.warningMessage != null && WR.warningMessage != "") {
        const h_warning = document.querySelector("#h_warning");
        h_warning.style.display = "block";
        const warmsg = document.querySelector("#warmsg");
        let msg = `<ul>`;
        for(let i = 0; i < WR.warningMessage.length; i++){
            msg += `<li>${WR.warningMessage[i]}</li>`;
        }
        msg += `</ul>`;
        console.log(msg);
        warmsg.innerHTML = msg;
    }

    // Set background image
    var time = parseInt(h_lastupdate.substr(11,2));
    setBackground(time, h_rain);

    // Use TempofDistrict to set Temp block
    const t_loc = document.querySelector("#t_loc");
    var i = 0;
    // Add an empty option
    var option = document.createElement("option");
    option.value = "N/A"
    option.text = "";
    t_loc.appendChild(option);
    for (let each in sortDict(TempofDistrict)) {
        var option = document.createElement("option");
        option.value = `${i}`;
        option.text = each;
        t_loc.appendChild(option);
        i++;
    }
    // Add a listener to the selection bar, when selected, set outdiv visible, and set the value of outval
    t_loc.addEventListener("change", function(){
        const outdiv = document.querySelector("#t_out");
        const outval = document.querySelector("#t_outval");
        if (t_loc.value == "N/A") {
            outdiv.style.display = "none";
            return;
        }
        outdiv.style.display = "flex";
        outval.innerHTML = TempofDistrict[t_loc.options[t_loc.selectedIndex].text];
    });

    // Use RainofDistrict to set Rain block
    const r_loc = document.querySelector("#r_loc");
    i = 0;
    // Add an empty option
    option = document.createElement("option");
    option.value = "N/A"
    option.text = "";
    r_loc.appendChild(option);
    for (let each in sortDict(RainofDistrict)) {
        var option = document.createElement("option");
        option.value = `${i}`;
        option.text = each;
        r_loc.appendChild(option);
        i++;
    }
    // Add a listener to the selection bar, when selected, set outdiv visible, and set the value of outval
    r_loc.addEventListener("change", function(){
        const outdiv = document.querySelector("#r_out");
        const outval = document.querySelector("#r_outval");
        if (r_loc.value == "N/A") {
            outdiv.style.display = "none";
            return;
        }
        outdiv.style.display = "flex";
        outval.innerHTML = RainofDistrict[r_loc.options[r_loc.selectedIndex].text];
    });

    // Return TempofDistrict and RainofDistrict
    return [TempofDistrict, RainofDistrict];
}

// Function for setting the air block
async function setAir(){
    // Get the AQHI&Risk data
    const Airurl = "https://dashboard.data.gov.hk/api/aqhi-individual?format=json";
    const Air = await fetch(Airurl)
        .then(response => response.json());

    var AQ_RofDistrict = {};
    for (let re in Air) {
        if (Air[re].station == null)
            continue;
        AQ_RofDistrict[Air[re].station] = {"aqhi": Air[re].aqhi, "risk": Air[re].health_risk};
    }
    AQ_RofDistrict = sortDict(AQ_RofDistrict);

    // Set the air block
    const a_loc = document.querySelector("#a_loc");
    var i = 0;
    // Add an empty option
    var option = document.createElement("option");
    option.value = "N/A"
    option.text = "";
    a_loc.appendChild(option);
    for (let each in AQ_RofDistrict) {
        var option = document.createElement("option");
        option.value = `${i}`;
        option.text = each;
        a_loc.appendChild(option);
        i++;
    }

    // Add a listener to the selection bar, when selected, set outdiv visible, and set the value of outval
    a_loc.addEventListener("change", function(){
        const outdiv = document.querySelector("#a_out");
        const outval = document.querySelector("#a_outval");
        if (a_loc.value == "N/A") {
            outdiv.style.display = "none";
            return;
        }
        outdiv.style.display = "flex";
        outval.innerHTML = `Level: ${AQ_RofDistrict[a_loc.options[a_loc.selectedIndex].text].aqhi}<br>Risk: ${AQ_RofDistrict[a_loc.options[a_loc.selectedIndex].text].risk}`;
    });

    // Return AQ_RofDistrict
    return AQ_RofDistrict;
}

// Function for setting the Current location block
async function setCurrent(){
    var TempofDistrict, RainofDistrict, AQ_RofDistrict;
    // Get above data from setHome() and setAir()
    await Promise.all([setHome(), setAir()]).then(function(results){
        TempofDistrict = results[0][0];
        RainofDistrict = results[0][1];
        AQ_RofDistrict = results[1];
    });

    // Get the weather station data
    const WSurl = "https://ogciopsi.blob.core.windows.net/dataset/weather-station/weather-station-info.json";
    const WS = await fetch(WSurl)
        .then(response => response.json());
    
    // Get the Air station data
    const ASurl = "data/aqhi-station-info.json";
    var AS;
    /* Explaination: The method below will always success when use the docker container
     * of this Assignment. However, I manually set the data in the catch block, this is
     * to let the website can be run without the docker container. As the browser will
     * always block the request to the local file system.
     * You can remove the content in catch block to test on the docker container.
     */
    try {AS = await fetch(ASurl)
        .then(response => response.json());
    } catch(error) {
        let station_v = `[{"station":"Central/Western","lat":22.28489089,"lng":114.14442071}, {"station":"Southern","lat":22.24746092,"lng":114.1601401}, {"station":"Eastern","lat":22.28288555,"lng":114.2193716}, {"station":"Kwun Tong","lat":22.3096251,"lng":114.23117417}, {"station":"Sham Shui Po","lat":22.3302259,"lng":114.15910913}, {"station":"Kwai Chung","lat":22.35710398,"lng":114.12960136}, {"station":"Tsuen Wan","lat":22.37174191,"lng":114.11453491}, {"station":"Tseung Kwan O","lat":22.31764241,"lng": 114.25956137}, {"station":"Yuen Long","lat":22.44515508,"lng":114.02264888}, {"station":"Tuen Mun","lat":22.39114326,"lng":113.97672832}, {"station":"Tung Chung","lat":22.28888887,"lng":113.94365902}, {"station":"Tai Po","lat":22.45095988,"lng":114.16457022}, {"station":"Sha Tin","lat":22.37628072,"lng":114.18453161}, {"station":"North","lat":22.49669723,"lng": 114.12824408}, {"station":"Tap Mun","lat":22.47131669,"lng":114.3607185}, {"station":"Causeway Bay","lat":22.28013296,"lng":114.18509009}, {"station":"Central","lat":22.2818145,"lng":114.15812743}, {"station":"Mong Kok","lat":22.32261115,"lng":114.16827176}]`;
        AS = JSON.parse(station_v);
    }

    // Process the weather station data
    var WeatherStation = {};
    for (let i = 0; i < WS.length; i++) {
        var name = WS[i].station_name_en;
        // For special case if name is "Tsuen Wan", change to "Tsuen Wan Ho Koon"
        if (name == "Tsuen Wan") {
            name = "Tsuen Wan Ho Koon";
        }

        // Check if the name is in Keys of TempofDistrict
        if (name in TempofDistrict) {
            WeatherStation[name] = {
                "lat": WS[i].latitude,
                "lon": WS[i].longitude
            };
        }
    }

    // Process the air station data
    var AirStation = {};
    for (let i = 0; i < AS.length; i++) {
        var name = AS[i].station;
        // Check if the name is in Keys of AQ_RofDistrict
        if (name in AQ_RofDistrict) {
            AirStation[name] = {
                "lat": AS[i].latitude,
                "lon": AS[i].longitude
            };
        }
    }

    // Get the user's location
    var user_lat, user_lon;
    await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            position => {
                user_lat = position.coords.latitude;
                user_lon = position.coords.longitude;
                resolve();
            },
            error => {
                console.error(error); 
                reject();
            }
        );
    }).catch(() => {
        const m_loc = document.querySelector("#m_loc");
        m_loc.innerHTML = "Unable to get your location";  
        return;
    });

    // Get the District and Suburb of the user's location
    var user_suburb, user_district;
    const Geourl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${user_lat}&lon=${user_lon}&zoom=18&addressdetails=1&accept-language=en-US`;
    const Geo = await fetch(Geourl)
        .then(response => response.json());

    // Get the district and suburb
    const local = Geo.address;
    if (local.suburb) {
        user_suburb = local.suburb;
    } else if (local.borough) {
        user_suburb = local.borough;
    } else if (local.town) {
        user_suburb = local.town;
    } else {
        user_suburb = "Unknown";
    }
    if (local.city_district) {
        user_district = local.city_district;
    } else {
        for (let key in local) {
            if (local[key].includes("District")) {
                user_district = local[key];
                break;
            }
        }
        if (!user_district) {
            user_district = "Unknown";
        }
    }

    // Set the current location block
    const m_loc = document.querySelector("#m_loc");
    m_loc.innerHTML = `${user_suburb}, ${user_district}`;

    // Iterate WeatherStation, find the nearest station
    var min_dist = calDistance(user_lat, user_lon, WeatherStation[Object.keys(WeatherStation)[0]].lat, WeatherStation[Object.keys(WeatherStation)[0]].lon);
    var min_name = Object.keys(WeatherStation)[0];
    for (let each in WeatherStation) {
        var dist = calDistance(user_lat, user_lon, WeatherStation[each].lat, WeatherStation[each].lon);
        if (dist < min_dist) {
            min_dist = dist;
            min_name = each;
        }
    }
    // Set the Temerature 
    const m_temp = document.querySelector("#m_temp");
    m_temp.innerHTML = TempofDistrict[min_name];

    // Iterate AirQuality, find the nearest station
    min_dist = calDistance(user_lat, user_lon, AirStation[Object.keys(AirStation)[0]].lat, AirStation[Object.keys(AirStation)[0]].lon);
    min_name = Object.keys(AirStation)[0];
    for (let each in AirStation) {
        var dist = calDistance(user_lat, user_lon, AirStation[each].lat, AirStation[each].lon);
        if (dist < min_dist) {
            min_dist = dist;
            min_name = each;
        }
    }
    // Set the AQHI and Risk
    const m_AQHI = document.querySelector("#m_AQHI");
    const m_risk = document.querySelector("#m_risk");
    m_AQHI.innerHTML = AQ_RofDistrict[min_name].aqhi;
    m_risk.innerHTML = AQ_RofDistrict[min_name].risk;

    // Set the Risk image
    const m_AQHI_risk = document.querySelector("#m_AQHI_risk img");
    switch (AQ_RofDistrict[min_name].risk) {
        case "Low":
            m_AQHI_risk.src = "./images/aqhi-low.png";
            break;
        case "Moderate":
            m_AQHI_risk.src = "./images/aqhi-moderate.png";
            break;
        case "High":
            m_AQHI_risk.src = "./images/aqhi-high.png";
            break;
        case "Very High":
            m_AQHI_risk.src = "./images/aqhi-very_high.png";
            break;
        case "Serious":
            m_AQHI_risk.src = "./images/aqhi-serious.png";
            break;
        default:
            m_AQHI_risk.src = "./images/aqhi-low.png";
            break;
    }

    // Set the rain
    const m_rain = document.querySelector("#m_rain");
    let disname = user_district;
    // Replace the " and " in the name with " & "
    if (disname.includes(" and ")) {
        disname = disname.replace(" and ", " & ");
    }

    // If the name is in Keys of RainofDistrict, set the rain
    let flag = false;
    for (let key in RainofDistrict) {
        if (key.includes(disname)) {
            m_rain.innerHTML = RainofDistrict[key];
            flag = true;
            break;
        }
    }
    // Else, set to the same as the home
    if (!flag) {
        m_rain.innerHTML = document.querySelector("#h_rain").textContent;
    }

    // Set the container visible
    const m_content = document.querySelector("#m_content");
    m_content.style.display = "flex";
}

// Function for setting the 9-days forecast block
async function setNine(){
    // Read the 9-days forecast data
    const WFurl = "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=fnd&lang=en";
    const WF = await fetch(WFurl)
        .then(response => response.json());
    
    // Get 0-8 of WF.weatherForecast[]
    const Nine = WF.weatherForecast.slice(0,9);

    // Get container
    const con = document.querySelector("#n_forcast");

    /* Structure template
        <div id="n_forcast">
            <div class="one_day">
                <div>Sun 3/9</div>
                <div><img src="path to weather icon"></div>
                <div><img src="path to PSR icon"></div>
                <div>27-32 °C</div>
                <div>20-30 %</div>
            </div>
            <div class="one_day">
                ....
            </div>
        </div>       
    */ 
    // Iterate through Nine, set the content of each one_day div
    for (let i = 0; i < Nine.length; i++) {
        // Create one_day div
        var one_day = document.createElement("div");
        one_day.className = "one_day";

        // Create date div
        var date = document.createElement("div");
        let month = parseInt(Nine[i].forecastDate.substr(4,2));
        let day = parseInt(Nine[i].forecastDate.substr(6,2));
        date.textContent = Nine[i].week.substr(0,3) + " " + day + "/" + month;
        one_day.appendChild(date);

        // Create weather icon div
        var w_icon = document.createElement("div");
        var w_icon_img = document.createElement("img");
        w_icon_img.src = `https://www.hko.gov.hk/images/HKOWxIconOutline/pic${Nine[i].ForecastIcon}.png`;
        w_icon.appendChild(w_icon_img);
        one_day.appendChild(w_icon);

        // Create PSR icon div
        var psr_icon = document.createElement("div");
        var psr_icon_img = document.createElement("img");
        psr_icon_img.src = getPSR(Nine[i].PSR);
        psr_icon.appendChild(psr_icon_img);
        one_day.appendChild(psr_icon);

        // Create temperature div
        var temp = document.createElement("div");
        temp.textContent = `${Nine[i].forecastMintemp.value}-${Nine[i].forecastMaxtemp.value} °C`;
        one_day.appendChild(temp);

        // Create humidity div
        var humi = document.createElement("div");
        humi.textContent = `${Nine[i].forecastMinrh.value}-${Nine[i].forecastMaxrh.value} %`;
        one_day.appendChild(humi);

        // Append one_day div to con
        con.appendChild(one_day);
    }    
}

// Function for setting #hide_temp, #hide_rain, #hide_air to visible when window width > 500px
function setAllVisible(){
    const hide_temp = document.querySelector("#hide_temp");
    const hide_rain = document.querySelector("#hide_rain");
    const hide_air = document.querySelector("#hide_air");
    hide_temp.style.display = "block";
    hide_rain.style.display = "block";
    hide_air.style.display = "block";
}

// Function for setting the #hide_temp, #hide_rain, #hide_air to hidden when window width <= 500px
function setAllHidden(){
    const hide_temp = document.querySelector("#hide_temp");
    const hide_rain = document.querySelector("#hide_rain");
    const hide_air = document.querySelector("#hide_air");
    hide_temp.style.display = "none";
    hide_rain.style.display = "none";
    hide_air.style.display = "none";
}

// Function for click of #temp div
function tempClick(){
    if (window.innerWidth > 500) {
        return;
    }
    const hide_temp = document.querySelector("#hide_temp");
    if (hide_temp.style.display === "none") {
        hide_temp.style.display = "block";
        const hide_rain = document.querySelector("#hide_rain");
        hide_rain.style.display = "none";
        const hide_air = document.querySelector("#hide_air");
        hide_air.style.display = "none";
    } else {
        hide_temp.style.display = "none";
    }
}

// Function for click of #rain div
function rainClick(){
    if (window.innerWidth > 500) {
        return;
    }
    const hide_rain = document.querySelector("#hide_rain");
    if (hide_rain.style.display === "none") {
        hide_rain.style.display = "block";
        const hide_temp = document.querySelector("#hide_temp");
        hide_temp.style.display = "none";
        const hide_air = document.querySelector("#hide_air");
        hide_air.style.display = "none";
    } else {
        hide_rain.style.display = "none";
    }
}

// Function for click of #air div
function airClick(){
    if (window.innerWidth > 500) {
        return;
    }
    const hide_air = document.querySelector("#hide_air");
    if (hide_air.style.display === "none") {
        hide_air.style.display = "block";
        const hide_temp = document.querySelector("#hide_temp");
        hide_temp.style.display = "none";
        const hide_rain = document.querySelector("#hide_rain");
        hide_rain.style.display = "none";
    } else {
        hide_air.style.display = "none";
    }
}

// Act as main function
window.onload = function(){
    setHTML();
    setCurrent();
    setNine();
    
    var pre_width = window.innerWidth;
    // Add a listener to resize
    window.addEventListener("resize", function(){
        if (pre_width <= 500 && window.innerWidth > 500) {
            setAllVisible();
            pre_width = window.innerWidth;
        } else if (pre_width > 500 && window.innerWidth <= 500) {
            setAllHidden();
            pre_width = window.innerWidth;
        }
    });
}