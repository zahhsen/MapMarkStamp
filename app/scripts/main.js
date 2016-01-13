//------*顏色設定
//localStorage.clear();

var bgColor = '#fddea5', //地圖背景顏色   
    borderColor = '#FF7F50', //邊框顏色
    blurColor = '#FF7F50', //陰影部分顏色
    distColor = '#fddea5', //小區塊部分填色
    gradientColor = '#FF7F50'; //漸層顏色

/*

var bgColor = '#336774',
    borderColor = '#ff9966',
    blurColor = '#ff9966',
    distColor = '#FF7265',
    gradientColor = '#ff9966';
*/

var $newNotePanel = $('#newNotePanel'),
    $deletePanel = $('#deleteConfirm'),
    $mapClear = $('#mapClear'),
    $confirmBtn = $('#confirmBtn'),
    $toDelete = $('#toDelete'),
    $toClear = $('#toClear'),
    $titleLabel = $('#titleLabel'),
    $labelBox = $('#titleCard'),
    $dateLabel = $('#dateLabel'),
    $dateBox = $('#dateCard'),
    $reviewText = $('#reviewText'),
    $reviewSpan = $('#reviewSpan'),
    $titleSpan = $('#titleSpan'),
    $dateSpan = $('#dateSpan'),
    $reviewBox = $('#reviewCard'),
    $distTitle = $('#distTitle'),
    $distTitleText = $('#distTitleText'),
    $mapTitle = $('#mapTitle'),
    $mapTitleText = $('#mapTitleText'),
    $exit = $('#exit'),
    $searching = $('#searching'),
    targetId;

//------*輸入表單資料時判定各欄位是否正確

var addressOK = false,
    dateOK = false;

//------*google geocoder 取得經緯度

var geocoder = new google.maps.Geocoder();
var $submitAddress = $('#submitAddress'),
    $addressHelp = $('#addressHelp'),
    $dateHelp = $('#dateHelp'),
    $dateInput = $('#dateInput');

//------*D3地圖預設值設定

var scaleAdjust = 1, //調整印章顯示大小用（小區塊X2，全圖X1）
    defaultCenter = [121.562644, 25.078129], // 地圖的中心坐標
    geoJSON = { //小區塊地圖的資料丟進去這裡的feature
        "type": "FeatureCollection",
        "features": []
    };

var height = $(window).height() - 100, //地圖svg區域高度
    width = height * 600 / 450, //以高度照比例定寬度
    scaleSize = height / 450, //和原始尺寸比縮放的大小
    stampsize = 40 * scaleSize, //印章縮放
    nowMapScale = 1; //現在地圖的大小(指地圖内svg變形的scale值)

//------*D3地圖繪製設定

var projection = d3.geo.mercator() //地圖投影預設值
    .center(defaultCenter)
    //.center([121.555, 25.09])
    .scale(110000 * scaleSize)
    .translate([width / 2, height / 2]);


var path = d3.geo.path().projection(projection);

var x, y, s;
var zoom = d3.behavior.zoom()
    .translate([0, 0])
    .on("zoom", zoomed);

function zoomed() {
    console.log("zooming");
    x = d3.event.translate[0];
    y = d3.event.translate[1];
    s = d3.event.scale;
    container.attr("transform", "translate(" + d3.event.translate + "),scale(" + d3.event.scale + ")");
    nowMapScale = d3.event.scale;
    console.log(nowMapScale);
};

//------*D3地圖圖層

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(zoom);

var container = svg.append("g").attr("id", "allMap");

var mapLineGroup = container.append("g")
    .attr("id", "mapBg")
    .attr("transform", "translate(0,0)"),

    mapBgGroup = container.append("g")
    .attr("id", "mapLine")
    .attr("transform", "translate(0,0)"),

    mapDistGroup = container.append("g")
    .attr("id", "mapDist")
    .attr("transform", "translate(0,0)"),

    mapDistLineGroup = container.append("g")
    .attr("id", "mapDistLine")
    .attr("transform", "translate(0,0)"),

    pointGroup = container.append("g")
    .attr("transform", "translate(0,0)")
    .attr("id", "points"),

    infoGroup = container.append("g")
    .attr("transform", "translate(0,0)")
    .attr("id", "dots");

var $mapBg = $('#mapBg'),
    $mapLine = $('#mapLine'),
    $mapDist = $('#mapDist'),
    $mapDistLine = $('#mapDistLine'),
    $points = $('#points'),
    $dots = $('#dots');

//新增記事的表單jquery定位
var $restaurantInput = $('#restaurant'),
    $addressInput = $('#address'),
    $reviewInput = $('#review'),
    $cancelBtn = $('#cancelBtn'),
    $addressSearchOK = $('#addressSearchOK');

//------*SVG漸層及模糊設定

var blurDefs = svg.append("defs")
    .append("filter")
    .attr("id", "blurDefs")
    .append("feGaussianBlur")
    .attr("in", "SourceGraphic")
    .attr("stdDeviation", 5 * scaleSize);

var blurDefsLite = svg.append("defs")
    .append("filter")
    .attr("id", "blurDefsLite")
    .append("feGaussianBlur")
    .attr("in", "SourceGraphic")
    .attr("stdDeviation", 2 * scaleSize);

var blurDefsMin = svg.append("defs")
    .append("filter")
    .attr("id", "blurDefsLiteMin")
    .append("feGaussianBlur")
    .attr("in", "SourceGraphic")
    .attr("stdDeviation", 1.5 * scaleSize);

var gradientFill = svg.append("defs")
    .append("radialGradient")
    .attr("id", "gradiantFill")
    .attr("x1", "0%")
    .attr("x2", "0%")
    .attr("y1", "0%")
    .attr("y2", "100%");

gradientFill.append("svg:stop")
    .attr("offset", "0%")
    .attr("style", "stop-color:" + gradientColor + ";stop-opacity:0.5");

gradientFill.append("svg:stop")
    .attr("offset", "0%")
    .attr("style", "stop-color:" + distColor + ";stop-opacity:0.5");

gradientFill.append("svg:stop")
    .attr("offset", "50%")
    .attr("style", "stop-color:" + distColor + ";stop-opacity:0.5");

gradientFill.append("svg:stop")
    .attr("offset", "100%")
    .attr("style", "stop-color:" + gradientColor + ";stop-opacity:0.5");

//------*時間設定

var nowTime = moment(), //現在時間
    fullDate = nowTime.toArray;

var deltaDateLimit = 7;
//預設顯示為七天內
var todaysDate = new Date(),
    dateLimit = moment().toArray(),
    defaultStart = countDate(deltaDateLimit, dateLimit);
//dataFilter:搜尋條件儲存
var dataFilter = {
    deltaDateLimit: deltaDateLimit,
    dateLimit: dateLimit,
    dateStart: defaultStart,
    distSearch: "北市"
}
var $dtPicker1 = $('#datetimepicker1'), //時間選取
    $dtPicker2 = $('#datetimepicker2'),
    $dtPickerNew = $('#datetimepickernew');

var scaleDay = d3.scale.linear()
    .range([0.3, 1])
    .domain([dataFilter.deltaDateLimit, 1]);

var opacityDay = d3.scale.linear()
    .range([0.1, 1])
    .domain([dataFilter.deltaDateLimit, 1]);

var $nowPopHide, //暫存紅點轉印章
    $closePop = $('#closePop');
//var distanceLimit = 20;

//------*處理資料儲存

var nowLatlng = [], //處理中坐標儲存
    nowAddress, //處理中地址儲存
    reviewsArray = [], //localStorage的儲存項目索引
    nowStampData = [], //現在要顯示在地圖上的資料
    links = [];


//------*FN:localStorage的地圖資料清除

function deleteMap(deleteKey) {
    if (localStorage['reviewsArray']) {
        var arr = JSON.parse(localStorage['reviewsArray']);
        console.log(arr);
        if (deleteKey != 'all') {
            console.log(deleteKey)
            var i = arr.indexOf(deleteKey);
            console.log(i);
            arr.splice(i, 1);
            console.log(arr);
            localStorage.removeItem(deleteKey);
            localStorage.setItem('reviewsArray', JSON.stringify(arr));
            pointGroup.select('#' + deleteKey).remove();
        } else {
            console.log(deleteKey);
            for (var item in arr) {
                localStorage.removeItem(arr[item]);
            }
            localStorage.removeItem('reviewsArray');
            nowStampData = [];
            refreshStamp();
        }
    }

};


//------*FN:地圖資料重整更新

function refreshStamp() {
    console.log(dataFilter);
    dataFilter.deltaDateLimit = countDeltaDate(dataFilter.dateStart, dataFilter.dateLimit);
    console.log(dataFilter.deltaDateLimit);
    $points.empty();
    $dots.empty();
    $dateBox.hide();
    $labelBox.hide();
    $reviewBox.hide();
    if ($nowPopHide != null) {
        $nowPopHide.fadeIn();
    };
    getData(dataFilter);
}

//------*FN:坐標轉成陣列[lat,lng]

function latlngToArray(result) {
    var arrayLatlng = [];
    arrayLatlng.push(result.geometry.location.lng());
    arrayLatlng.push(result.geometry.location.lat());
    console.log('changeok');
    return arrayLatlng;

};

//------*FN:現有地圖資料中以key尋找其中某筆

function searchData(attrId) {
    for (var i in nowStampData) {
        if (nowStampData[i].key == attrId) {
            var attrsData = nowStampData[i];
            return attrsData;
        }
    }
};


//------*FN:取得localStorage中資料

function getData(filter) {
    if (localStorage.getItem("reviewsArray") != null) {
        console.log("getit");
        nowStampData = [];
        reviewsArray = JSON.parse(localStorage.getItem("reviewsArray"));
        for (var key in reviewsArray) {
            var nowKey = reviewsArray[key],
                nowReview = JSON.parse(localStorage[nowKey]);
            console.log(nowReview);
            console.log(nowKey);
            console.log(nowReview.address);
            if (nowReview.address.match(dataFilter.distSearch) != null) {

                console.log("startdeltaDate");
                var deltaDate = countDeltaDate(nowReview.fullDate, filter.dateLimit);
                console.log(deltaDate);

                nowReview.deltaDate = deltaDate;

                if (deltaDate <= filter.deltaDateLimit && deltaDate >= 0) {

                    nowReview.opacity = opacityDay(deltaDate);
                    nowReview.scale = scaleDay(deltaDate);
                    nowStampData.push(nowReview);
                };
            };
        };
        if (nowStampData.length > 0) {
            addPoints(nowStampData);
            convertToSvg();
        } else {
            $searching.fadeOut();
        };
    } else {
        $searching.fadeOut();
    }
};

//------*FN:轉國數字....十還沒解決

function dateToString(year, month, day) {
    var numToChs = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];

    var splitNum = function(targetNum) {
        var numberArray = [];
        var y = targetNum;

        var tenCount;
        for (var j = 0; Math.pow(10, j) <= targetNum; j++) {
            tenCount = j;
        }
        for (var i = tenCount; i >= 0; i--) {
            var nowTimes = (Math.pow(10, i));
            console.log(Math.floor(y / nowTimes));
            numberArray.push(Math.floor(y / (nowTimes)));
            y = y % nowTimes;
        }
        return numberArray;
    };

    var changeChs = function(targetArray) {
        var splitChar;

        if (targetArray.length == 2) {
            splitChar = "十";
        }
        var changedString = "";

        for (var n in targetArray) {
            var i = targetArray[n];
            changedString += numToChs[i];
        }

        console.log(changedString);
        return changedString;
    };

    var yArray = splitNum(year);
    var mChs = numToChs[month];
    var dArray = splitNum(day);
    console.log(dArray);

    var okString = changeChs(yArray) + "年" + mChs + "月" + changeChs(dArray) + "日";
    return okString;

}

//------*FN:點印章跳出詳細資訊

function popInfo(e) {
    if ($nowPopHide != null) {
        $nowPopHide.fadeIn();
    };
    /*infoGroup.transition()
    .attr("opacity", "0")
    .remove('circle');
    */
    infoGroup.selectAll('circle').remove();
    var popId = $(this).attr('id');
    console.log($(this).offset().left);
    console.log($(this).offset().top);
    var nowAttr = searchData(popId);
    var nowX = nowAttr.latlng[0];
    var nowY = nowAttr.latlng[1];

    $(this).fadeOut();
    $nowPopHide = $(this)
    infoGroup.append('circle')
        .attr("id", 'nowPointDot')
        .attr("cx", nowX)
        .attr("cy", nowY)
        .attr("r", 5 / scaleAdjust / nowMapScale)
        .attr("fill", "red")
        .attr("class", "animated fadeIn infinite");

    var heightString = nowAttr.restaurant;
    console.log(heightString.length);

    var widthString = nowAttr.review;
    var textCardHeight = 160 + 28;
    var textCardWidth = Math.ceil(widthString.length / 8) * 28 + 6;
    var labelHeight = function(nowString) {
        var cardHeight = nowString.length * 28 + 10;
        return cardHeight;
    };


    $titleLabel.css('height', labelHeight(heightString) + 20);

    $titleSpan.html(nowAttr.restaurant);
    console.log(nowAttr.restaurant.length);

    $labelBox.hide();
    var labelTop = $(this).offset().top - (labelHeight(heightString));
    if (labelTop < 0) {
        labelTop = 0;
    };
    console.log(labelTop);
    $labelBox.css('height', labelHeight(heightString) + 20).css('width', 30).css("left", $(this).offset().left).css("top", labelTop).slideDown();

    heightString = dateToString(nowAttr.fullDate[0], nowAttr.fullDate[1] + 1, nowAttr.fullDate[2]);
    console.log(heightString);

    $dateLabel.css('height', labelHeight(heightString) + 20);
    $dateSpan.html(heightString);
    $dateBox.hide();
    $dateBox.css('height', labelHeight(heightString) + 20).css('width', 30).css("left", $(this).offset().left + 40).css("top", labelTop).slideDown();

    $toDelete.on('click', function() {
        targetId = nowAttr.key
        console.log(targetId)
    })

    $reviewBox.hide();
    $reviewBox.css('height', textCardHeight).css('width', textCardWidth).css("top", labelTop).css("left", $(this).offset().left - 10 - textCardWidth);
    $reviewText.css('height', textCardHeight - 40)
    $reviewSpan.html(nowAttr.review);
    //_jf.flush();
    $reviewBox.slideDown();
    $closePop.fadeIn();



}

function popInfoClose() {
    infoGroup.selectAll('circle').remove();
    $nowPopHide.fadeIn();
    $labelBox.slideUp();
    $dateBox.slideUp();
    $reviewBox.slideUp();
    $nowPopHide = null;
    $closePop.fadeOut();
}


/*
//算要退開的距離嗚嗚嗚
//c , a ,b , 斜率b/a , c/{sqrt(1+b/a^2)} = a orz

function adjustDistance() {
    for (var i = 0; i < links.length; i++) {
        console.log("startadjust");
        console.log(links[i]);
        var sourceId = links[i].source;
        console.log(sourceId);
        var nowXs = links[i].sourceXy[0];
        var nowYs = links[i].sourceXy[1];
        var sourceOp = opacityDay(links[i].deltaDate[0]);
        var targetOp = opacityDay(links[i].deltaDate[1]);
        console.log(nowXs + "," + nowYs);
        pointGroup.select("#" + links[i].source)
            .transition()
            .attr("x", nowXs - -links[i].xMove)
            .attr("y", nowYs - -links[i].yMove)
            .attr("opacity", sourceOp);

        console.log(links[i].target);
        var nowXt = links[i].targetXy[0];
        var nowYt = links[i].targetXy[1];
        pointGroup.select("#" + links[i].target)
            .transition()
            .attr("x", nowXt - links[i].xMove)
            .attr("y", nowYt - links[i].yMove)
            .attr("opacity", targetOp);
    }
    //function(d){return d.y+ links[i].yMove}
}

function pointsDistance(nodesArray) {
    for (var i = 0; i < nodesArray.length; i++) {
        for (var j = i + 1; j < nodesArray.length; j++) {
            //      計算每點距離

            var xDelta = (nodesArray[j].latlng[0] - nodesArray[i].latlng[0]),
                yDelta = (nodesArray[j].latlng[1] - nodesArray[i].latlng[1]);

            var slope = xDelta / yDelta;

            var distance = Math.sqrt(Math.pow(xDelta, 2) + Math.pow(yDelta, 2));
            if (distance <= distanceLimit) {
                console.log(distance);
                var xMove, yMove;
                var moveDis = (distanceLimit - distance) / 2
                yMove = moveDis / Math.sqrt(1 + Math.pow(slope, 2));
                xMove = yMove * slope;
                if (slope <= 0) {
                    yMove = -yMove;
                    xMove = -xMove;
                }

                var distanceData = {
                    "source": nodesArray[i].key,
                    "target": nodesArray[j].key,
                    "yMove": yMove,
                    "xMove": xMove,
                    "sourceXy": nodesArray[i].latlng,
                    "targetXy": nodesArray[j].latlng,
                    "deltaDate": [nodesArray[i].deltaDate, nodesArray[j].deltaDate]
                };

                links.push(distanceData);
                console.log(i + "," + j);
            };
        }
    }
};

*/

//------*FN:計算兩個日期的相差天數

function countDeltaDate(dateTarget, dateLimit) {
    var nowDate = moment(dateTarget).toArray();
    nowDate.length = 3;
    var countTarget = moment(dateLimit).toArray();
    countTarget.length = 3
    var tm = moment(nowDate);
    var dm = moment(countTarget);
    var deltaDate = dm.diff(tm, 'days');
    console.log(deltaDate);
    return deltaDate;
};

//------*FN:計算幾天前的日期

function countDate(deltaDate, dateLimit) {
    console.log(dateLimit);
    var nowDate = moment(dateLimit).toArray();
    nowDate.length = 3;
    var dm = moment(nowDate);
    var countOKDate = dm.subtract(deltaDate, 'days');
    console.log(countOKDate);
    var OKArray = countOKDate.toArray();
    console.log(OKArray);
    return OKArray;
};

//------*FN:以選取的資料在地圖上繪製印章

function addPoints(nowPointData) {

    console.log('startAddPoint');
    console.log(nowPointData);

    var nowPoints = pointGroup.selectAll("image")
        .data(nowPointData);

    nowPoints.enter()
        .append("svg:image")
        .attr("id", function(d, i) {
            var nowStampId = d.key;
            return nowStampId;
        })
        .attr("class", "stamp")
        .attr("xlink:href", function(d, i) {
            var nowStamp = "stamp" + d.stamp + ".svg";
            return nowStamp;
        });

};

//------*FN:將addpoint產生的img轉為svg並保留屬性

function convertToSvg() {
    $('.stamp').each(function() {
        var $img = $(this);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('href');
        var imgAttrs = searchData(imgID);
        imgAttrs.latlng = projection(imgAttrs.latlng);
        console.log(imgAttrs.latlng);

        $.get(imgURL, function(data) {
            // Get the SVG tag, ignore the rest
            var $svg = jQuery(data).find('svg');

            // Add replaced image's ID to the new SVG
            if (typeof imgID !== 'undefined') {
                $svg = $svg.attr('id', imgID);
            }
            // Add replaced image's classes to the new SVG
            if (typeof imgClass !== 'undefined') {
                $svg = $svg.attr('class', 'stampSvg');
            }

            // Remove any invalid XML tags as per http://validator.w3.org
            console.log(imgAttrs);
            $svg = $svg.removeAttr('xmlns:a');
            $svg.attr('x', imgAttrs.latlng[0] - stampsize * imgAttrs.scale * scaleAdjust / nowMapScale)
                .attr('y', imgAttrs.latlng[1] - stampsize * imgAttrs.scale * scaleAdjust * 0.5 / nowMapScale)
                .attr('height', stampsize * imgAttrs.scale * scaleAdjust / nowMapScale)
                .attr('width', stampsize * imgAttrs.scale * scaleAdjust / nowMapScale)
                .attr('opacity', imgAttrs.opacity)
                .delay((deltaDateLimit - imgAttrs.deltaDate) * 100)
                .fadeIn(200, function() {
                    $searching.fadeOut();
                })
                .on('click', popInfo);

            // Check if the viewport is set, if the viewport is not set the SVG wont't scale.
            if (!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
                $svg.attr('viewBox', '0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width'))
            }

            // Replace image with new SVG
            $img.replaceWith($svg);

        }, 'xml');

    });
};

//------*FN:繪製地圖

function drawMap(filter) {
    d3.json("taipeidist3.json", function(error, root) {

        if (error)
            return

        var mapunder = mapBgGroup.selectAll("path")
            .data(root.features)
            .enter()
            .append("path")
            .attr("stroke", borderColor)
            .attr("stroke-width", 0.5)
            .attr("fill", distColor)
            .attr("d", path)
            .attr("opacity", "0.8")
            .on("mouseover", function(d, i) {
                $distTitleText.html(d.properties.TNAME);
                //_jf.flush();
                d3.select(this)
                    .attr("fill", "url(#gradiantFill)")
                    .attr("filter", "url(#blurDefsLite)");

            })
            .on("mouseout", function(d, i) {
                d3.select(this)
                    .attr("fill", distColor)
                    .attr("filter", "none");
            })
            .on("click", function(d, i) {
                console.log(d.properties.TNAME);
                $mapTitleText.html(d.properties.TNAME);
                //_jf.flush();
                $distTitle.slideUp();
                $closePop.fadeOut();
                dataFilter.distSearch = d.properties.TNAME;
                scaleAdjust = 2;
                $mapBg.fadeOut();
                $mapDist.fadeIn();
                $mapDistLine.fadeIn();
                $mapLine.fadeOut(function() {
                    var countCenterTrans = function(defaultCen, targetCen) {
                        var projectedD = projection(defaultCen);
                        var projectedT = projection(targetCen);
                        console.log(projectedD);
                        console.log(projectedT);
                        var centerTrans = [projectedT[0] - projectedD[0], projectedT[1] - projectedD[1]];
                        console.log(centerTrans);
                        return centerTrans;
                    }


                    var nowTrans = countCenterTrans(defaultCenter, d.properties.center);
                    $searching.fadeIn();
                    console.log * (d.properties.center);
                    console.log * (nowTrans);
                    $exit.fadeIn();
                    container
                        .attr("transform", "translate(" + d.properties.trans[0] + "," + d.properties.trans[1] + ")scale(" + d.properties.scale + ")");
                    nowMapScale = d.properties.scale;

                    geoJSON.features = [];
                    geoJSON.features.push(d);
                    mapDistGroup.selectAll('path')
                        .data(geoJSON.features)
                        .enter()
                        .append("path")
                        .attr("id", "theDist")
                        .attr("stroke", borderColor)
                        .attr("stroke-width", 0.5)
                        .attr("fill", "url(#gradiantFill)")
                        .attr("d", path)
                        .attr("opacity", "0")
                        .transition()
                        .attr("opacity", "0.5");

                    mapDistLineGroup.selectAll('path')
                        .data(geoJSON.features)
                        .enter()
                        .append("path")
                        .attr("id", "theDistLine")
                        .attr("fill", "none")
                        .attr("stroke", blurColor)
                        .attr("stroke-width", 1)
                        .attr("filter", "url(#blurDefsLite)")
                        .attr("d", path)
                        .attr("opacity", "0")
                        .transition()
                        .attr("opacity", "0.5");

                    console.log(scaleAdjust);
                    refreshStamp();
                });


            });


    });

    d3.json("taipei.json", function(error, root) {

        var mapBg = mapLineGroup.selectAll("path")
            .data(root.features);

        mapBg.enter()
            .append("path")
            .attr("stroke", blurColor)
            .attr("stroke-width", 5)
            .attr("filter", "url(#blurDefs)")
            .attr("opacity", "0.6")
            .attr("fill", "none")
            .attr("d", path);

    });

}

//------*FN:新增記事表單：確認是否有填入日期

function dateTF() {
    var ok1 = true;
    console.log($dateInput.val());
    if ($dateInput.val() != '') {
        $dateHelp.empty();
    } else {
        ok1 = false;
        $dateHelp.html("請選擇日期");
    }
    return ok1;
}

//------*FN:地圖旋轉及變形
function mapRotate90(rotateItem) {
    rotateItem.attr("transform", "rotate(90 " + width / 2 + "," + height / 2 + ")");
}

function mapTranslate(transItem) {
    transItem.attr("transform", "rotate(90 " + width / 2 + "," + height / 2 + ")translate(" + 15 * height / 450 + "," + 5 * height / 450 + ")");
}

function reviewData(key, restaurant, address, review, stamp, latlng, theDate, deltaDate, scale, opacity) {
    this.key = key;
    this.restaurant = restaurant;
    this.address = address;
    this.review = review;
    this.stamp = stamp;
    this.latlng = nowLatlng; //[lat,lng]
    this.fullDate = theDate; //[year, month , day]
    this.deltaDate = deltaDate;
    this.scale = scale;
    this.opacity = opacity;
};

//------*FN:存入現在的資料到localStorage
function saveReviewData() {

    console.log("sRD exe");
    var restaurant = $restaurantInput.val(),
        review = $reviewInput.val(),
        currentDate = new Date(),

        stamp = $('input:radio[name=stamp]:checked').val(),
        key = "review_" + currentDate.getTime();

    var newAddReview = new reviewData(key, restaurant, nowAddress, review, stamp, nowLatlng, fullDate, deltaDateLimit, 1);
    localStorage.setItem(key, JSON.stringify(newAddReview));
    reviewsArray.push(key);
    localStorage.setItem("reviewsArray", JSON.stringify(reviewsArray));
    nowStampData.push(newAddReview);
    addPoints(nowStampData);
    convertToSvg();
};


$(function() {

//------*地圖旋轉 
    mapTranslate(mapBgGroup);
    mapTranslate(mapDistGroup);
    mapTranslate(mapDistLineGroup);
    mapRotate90(mapLineGroup);
    mapRotate90(infoGroup);
    mapRotate90(pointGroup);

    $exit.on('click', function() {
        scaleAdjust = 1;
        dataFilter.distSearch = "北市";
        nowMapScale = 1;
        $mapTitleText.html("臺北市全圖");
        $distTitle.slideDown();
        $searching.fadeIn();
        $mapDist.fadeOut();
        $mapDistLine.fadeOut(function() {
            container.attr("transform", "translate(0,0) scale(1)");
            $mapBg.fadeIn(function() {
                refreshStamp();
            });
            $mapLine.fadeIn();
            console.log(scaleAdjust);
            $exit.fadeOut();
            $mapDistLine.empty();
            $mapDist.empty();

        });

    })

    $toClear.on('click', function() {
        targetId = 'all';
    })
    $confirmBtn.on('click', function() {
        deleteMap(targetId);
        popInfoClose();
    });

    $newNotePanel.on('shown.bs.modal', function() {})
    $deletePanel.on('shown.bs.modal', function() {})



    $dtPicker1.datetimepicker({
        locale: 'zh-tw',
        viewMode: 'months',
        format: 'YYYY-M-D',
        defaultDate: defaultStart,
        maxDate: new Date()
    });
    $dtPicker2.datetimepicker({
        locale: 'zh-tw',
        viewMode: 'months',
        format: 'YYYY-M-D',
        //        maxDate: new Date(),
        defaultDate: new Date()
    });
    $dtPickerNew.datetimepicker({
        locale: 'zh-tw',
        format: 'YYYY-M-D',
        defaultDate: new Date()
    });
    $dtPicker1.on("dp.change", function(e) {
        $dtPicker2.data("DateTimePicker").minDate(e.date);
        console.log(e.date);
        console.log($(this).find('input').val());
    }).on("dp.hide", function(e) {
        var yyyymdd = $(this).find('input').val();
        dataFilter.dateStart = moment(yyyymdd, 'YYYY-M-D').toArray();
        $searching.fadeIn();
        refreshStamp();
    });
    $dtPicker2.on("dp.change", function(e) {
        $dtPicker1.data("DateTimePicker").maxDate(e.date);
    }).on("dp.hide", function(e) {
        var yyyymdd = $(this).find('input').val();
        dataFilter.dateLimit = moment(yyyymdd, 'YYYY-M-D').toArray();
        $searching.fadeIn();
        refreshStamp();

    });
    $dtPickerNew.on("dp.hide", function(e) {
        var yyyymdd = $(this).find('input').val();
        fullDate = moment(yyyymdd, 'YYYY-M-D').toArray();

    });

    $closePop.on('click', popInfoClose);
    //輸入地址時：google geocoder判定是否有找到地址
    $addressInput.on('blur', function() {
        var address = $addressInput.val();
        console.log(address);
        geocoder.geocode({
            'address': address,
            'componentRestrictions': {
                'country': 'TW'
            }
        }, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                $addressSearchOK.fadeIn();
                console.log(results[0]);

                var tempAddress = results[0].formatted_address;
                if (tempAddress.match('台北市') != null) {
                    console.log(tempAddress);
                    $addressHelp.removeClass('label-danger').addClass('label-success').html("成功！");
                    nowLatlng = latlngToArray(results[0]);
                    addressOK = true;
                    nowAddress = tempAddress;
                    console.log(nowAddress);
                    console.log("address" + addressOK);
                } else {
                    $addressHelp.removeClass('label-success').addClass('label-danger').html("無法找到該地址，或不是臺北市的地址！請在餐廳名稱前加入“臺北”，或打入詳細地址試試");
                    addressOK = false;
                    console.log(addressOK);
                }
            } else {
                $addressHelp.removeClass('label-success').addClass('label-danger').html('Geocode was not successful for the following reason: ' + status);
                addressOK = false;
                console.log(addressOK);
            }
        });
    });

    $cancelBtn.on('click', function() {
        $addressHelp.removeClass('label-success').removeClass('label-danger');
        $addressHelp.html('');
        $dateHelp.html('');
        $('#newNoteBody').find('.needReset').val('');
    });


    $submitAddress.on('click', function() {
        dateOK = dateTF();
        var dateString = $dateInput.val();
        fullDate = moment(dateString).toArray();
        console.log(addressOK + "," + dateOK);
        if (addressOK == true && dateOK == true) {
            saveReviewData();
            $addressHelp.removeClass('label-success').removeClass('label-danger').html('');
            $dateHelp.html('');
            $newNotePanel.modal('hide');
        }
    });


    drawMap();
    getData(dataFilter);
    $mapBg.fadeIn(800);


});
