var map; 
var infor;
var myLocationBtn = document.getElementById('myLocationBtn'); // biến lấy vị trí hiện tại
var myBox = document.getElementById('pac-input');
var markerCluster;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 10.7628356, lng: 106.6824824},
    zoom: 16
  });

  // Tạo ô tìm kiếm và liên kết với bản đồ
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  var marker1 = new google.maps.Marker({
    map: null, // Đặt giá trị ban đầu của map là null
    animation: google.maps.Animation.DROP,
  });

  // Xử lý sự kiện khi người dùng thay đổi nội dung ô tìm kiếm
  searchBox.addListener('places_changed', function () {
    var places = searchBox.getPlaces();

    if (places.length === 0) {
      return;
    }

    // Xử lý thông tin địa chỉ của địa điểm được chọn
    var place = places[0];

    // Lấy tọa độ (latitude, longitude) của địa điểm được chọn
    var location = place.geometry.location;
    var lat = location.lat();
    var lng = location.lng();

    // Di chuyển bản đồ đến địa điểm được chọn
    map.setCenter(new google.maps.LatLng(lat, lng));
    map.setZoom(18); // Đặt mức zoom theo nhu cầu của bạn

    // Thiết lập vị trí mới cho marker
    marker1.setPosition(new google.maps.LatLng(lat, lng));

    // Hiển thị marker trên bản đồ
    marker1.setMap(map);

    
  });

  infor = new google.maps.InfoWindow();

  var marker; // giữ dấu ticker đỏ
  // Thêm sự kiện click vào bản đồ
  map.addListener('click', function(event) {
    if (marker) {
      marker.setMap(null);
    }
    // Gọi hàm reverse geocoding khi bản đồ được click
    reverseGeocode(event.latLng);

    
    var redIcon = {
      url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png', // Đường dẫn đến biểu tượng màu đỏ
      scaledSize: new google.maps.Size(32, 32), // Kích thước biểu tượng
      origin: new google.maps.Point(0, 0), // Điểm xuất phát của biểu tượng
      anchor: new google.maps.Point(16, 32) // Điểm neo của biểu tượng
    };
    // Đặt biểu tượng màu đỏ tại vị trí click
    marker = new google.maps.Marker({
      position: event.latLng,
      map: map,
      icon: redIcon
    });
  });

  // Thêm sự kiện click cho nút "My Location"
  document.getElementById('locationBtn').addEventListener('click', function() {
    showMyLocation();
  });

  

  // Thêm nút "My Location" vào bản đồ
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById('myLocationBtn'));
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('myBox'));

  // Khởi tạo MarkerClusterer
  markerCluster = new MarkerClusterer(map, [], {
    imagePath: '/Dan/images/',
    gridSize: 100,
    maxZoom: 13
  });

  showLocationText();
  hideLocationText();
  showQC();
  hideQC();

  // // Thêm sự kiện zoom_changed để theo dõi thay đổi zoom
  // google.maps.event.addListener(map, 'zoom_changed', function() {
  //   updateClusterIcons(map, markerCluster);
  // });

  // Thực hiện yêu cầu GET đến endpoint /billboards
  fetch('/locations')
    .then(response => response.json())
    .then(data => {
      // Xử lý dữ liệu 
      let idCounter = 0;
      let idCount = 0;
      let idReport = 0;

      // Kiểm tra nếu dữ liệu có tồn tại và là mảng
      if (Array.isArray(data)) {
        // Lặp qua mỗi mảng
        (async () => {
          for (const location of data) {
            // Truy cập các biến c
            const locationID = location.locationID;
            const name = location.name;
            const diachi = location.diachi;
            const phuongID = location.phuongID;
            const quanID = location.quanID;
            const loaivitri = location.loaivitri;
            const hinhanh1 = location.hinhanh;
            let quyhoach = location.quyhoach;
            const toadoX = location.toadoX;
            const toadoY = location.toadoY;
            console.log('locationID');
            console.log(locationID);



            if(quyhoach == "ĐÃ QUY HOẠCH" || quyhoach == "Đã quy hoạch"){
              quyhoach = "ĐÃ QUY HOẠCH";
            }else{
              quyhoach = "CHƯA QUY HOẠCH";
            }

            console.log(`locationID: ${locationID}, Name: ${name}, diachi: ${diachi}, phuongID: ${phuongID}, quanID: ${quanID}, loaivitri: ${loaivitri}, hinhanh: ${hinhanh1}, quyhoach: ${quyhoach}, toadoX: ${toadoX}, toadoY: ${toadoY}`);

            const billboardResponse = await fetch(`/billboards/${locationID}`);
            const billboardData = await billboardResponse.json();

            
            
            var boardID;
            let content = '<div style="text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 10px;">Danh sách các bảng quảng cáo</div>';
            
            if (Array.isArray(billboardData)) {
              
              
              for (const billboardDat of billboardData) {

                const billboardID = billboardDat.billboardID;
                const loai = billboardDat.loai;
                const kichthuoc = billboardDat.kichthuoc;
                const hinhthuc = billboardDat.hinhthuc;
                const hinhanh = billboardDat.hinhanh;
                const ngayhethan = billboardDat.ngayhethan;
                const queryID = billboardID;
                boardID = billboardID;

                

                // Truy cập giá trị của thuộc tính billboardID trong vòng lặp
                var id1 = 'expirationDate' + idCounter;
                var id2 = 'expirationImage' + idCounter;
                content += '<form action="/boardID" id="handleBoardIDPost" method="POST" style="display: flex; flex-direction: column; align-items: center; max-width: 900px; font-size: 20px; padding: 0px 50px 0px 0px;">';  
                content += '<div style="max-width: 800px; font-size: 20px; border: 2px solid #ccc; border-radius: 5px; padding: 20px; margin: 10px auto; width: 100%;">';
                content += `
                  <form style="display: flex; flex-direction: column; align-items: center;">
                    <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 10px;">
                      <span id="` + id1 + `" style="display: none;"><img src="` + hinhanh + `" alt="Logo" style="width: 300px; height: auto; margin-bottom: 10px; padding-left: 210px;"><br></span>
                      <b>` + loai + `</b><br>`
                      + diachi + `<br>
                      Kích thước: <b>` + kichthuoc + `</b><br>
                      Số lượng: <b>1 trụ/bảng</b><br>
                      Hình thức: <b>`+ hinhthuc+ `</b><br>
                      Phân loại: <b>`+loaivitri+`</b><br>
                      <span id="` + id2 + `" style="display: none;">Ngày hết hạn: <b>`+ngayhethan+ `</b><br></span>
                    </div>
                  </form>`;
                
                idCounter++;

                const reportResponse = await fetch(`/BC/${queryID}`);
                const reportData = await reportResponse.json();
                    
                if (Array.isArray(reportData)) {
          
            
                  var amount = 'reportContent' + idReport;

                  content += `<div onclick="toggleReportList('` + amount  + `')" style="align-items: center; margin: 7px; padding: 5px;">
                  <div style="margin: 0px; padding: 10px; border: 2px solid; cursor: pointer; text-align: center;">
                      <i class="fas fa-list-ul" style="margin-right: 0px; "></i><b> Danh sách báo cáo</b>
                  </div>
                  </div>
                  <span id="` + amount + `" style="display: none">
                  `;
                  let small_small = '';
                  reportData.forEach(reportData => {
                    const fullName = reportData.fullName;
                    const reportContent = reportData.reportContent;
                    const thoidiemgui = reportData.thoidiemgui;
                    const tinhtrang = reportData.tinhtrang;
                    const cachthucxuly = reportData.cachthucxuly;

                    const report = `
                      <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 10px;">
                        <b>Họ tên: </b>` + fullName + `<br>
                        <b>Nội dung báo cáo: </b>`+reportContent+`<br>
                        <b>Thời điểm gửi: </b>`+ thoidiemgui+ `<br>
                        <b>Tình trạng: </b>`+tinhtrang+`<br>
                        <b>Cách thức xử lí: </b>`+cachthucxuly+`<br>
                      </div>
                    `;

                    small_small += report;
                    
                  });

                  content += small_small;
                  content += `</span>`;
                  idReport++;
                }
                var data1 = 'expirationDate' + idCount;
                var data2 = 'expirationImage' + idCount;  
                content += '<input type="hidden" name="boardID" id="boardID" value="' + boardID + '">';
                content += '<div style="display: flex; justify-content: center; width: 100%;"><div onclick="toggleExpirationDate(\'' + data1 + '\', \'' + data2 + '\')" style="margin: 10px; padding: 10px; flex: 1; border: 2px solid #00f; cursor: pointer;"><i class="fas fa-info-circle" style="margin-right: 5px; color: #00f;"></i><b style="color: #00f;">CHI TIẾT</b></div><button type="submit" onclick="redirectToReportPage()" style="margin: 10px; padding: 10px; flex: 1; border: 2px solid #f00;"><i class="fas fa-exclamation-triangle" style="margin-right: 5px; color: #f00;"></i><b style="color: #f00;">BÁO CÁO VI PHẠM</b></button></div> </div> </form>';
                idCount++;

              };
            }
            else{
              console.log(`Không có locationID `, locationID);
              
            }
            var advertisingData = { type: name, text1: loaivitri, text2: diachi, infor: quyhoach };
            var icon;
            if(quyhoach == "ĐÃ QUY HOẠCH" || quyhoach == "Đã quy hoạch"){
              icon = '/Dan/images/icon1.png';
            }else{
              icon = '/Dan/images/icon2.png';
            }
            addAdvertisingLocation(toadoX, toadoY, advertisingData, hinhanh1, icon,  content, isVariableTrue, markerCluster);

            };
        })();
      
      } else {  
        console.error('Dữ liệu không phải là mảng hoặc không tồn tại.');
      }
      })
    .catch(error => {
        console.error('Lỗi khi lấy dữ liệu billboard:', error);
    });


  
}

function addAdvertisingLocation(latitude, longitude, advertisingData, imageQC, icon, content, isVariableTrue, markerCluster ) {
  // Tạo marker kiểu hình ảnh
  var marker = new google.maps.Marker({
    position: { lat: latitude, lng: longitude },
    map: isVariableTrue ? map : null,
    icon: {
      url: icon,// Đường dẫn đến hình ảnh điểm đặt quảng cáo
      scaledSize: new google.maps.Size(30, 30) // Kích thước hình ảnh
    },
    title: 'Điểm Đặt Quảng Cáo'
  });

  markerCluster.addMarker(marker);

  // Tạo thông tin chi tiết cho điểm đặt quảng cáo
  var infoWindow = new google.maps.InfoWindow();

  // Thêm sự kiện khi di chuột vào marker
  marker.addListener('mouseover', function() {
    var content = generateInfoContent(advertisingData); // Tạo nội dung thông tin
    var imageTag = '<img src="' + imageQC + '" alt="Ảnh mô tả" style="width: 500px; height: 300px; padding-left: 30px">'; // Thẻ img với đường dẫn hình ảnh

    // Bổ sung thẻ img vào nội dung thông tin
    content += imageTag;

    // Thiết lập nội dung của cửa sổ thông tin
    infoWindow.setContent(content);
    infoWindow.maxWidth = 800;
    infoWindow.open(map, marker);
  });

   // Thêm sự kiện khi click vào marker
  marker.addListener('click', function() {
    // Thực hiện hành động khi click vào marker, ví dụ: hiển thị bảng thông tin khác
    showAdditionalInfo(marker, content);
  });

   // Thêm sự kiện khi di chuột ra khỏi marker
  marker.addListener('mouseout', function() {
    infoWindow.close();
  });

  if (!isVariableTrue) {
    // Đóng bảng thông tin nếu nó đang mở
    console.log('Giá trị của biến sau khi nhấn nút:', isVariableTrue);
    infoWindow.close();

    // Xóa marker khỏi bản đồ
    marker.setMap(null);
  }

}

function generateInfoContent(advertisingData) {
  // Kiểm tra xem advertisingData có tồn tại không
  if (advertisingData) {
    // Tạo HTML cho nội dung thông tin
    var content = '<div style="font-size: 17px">';
    content += '<p><b>' + advertisingData.type + '</b></p>';
    content += '<p>' + advertisingData.text1 + '</p>';
    content += '<p>' + advertisingData.text2 + '</p>';
    content += '<p><b><em>' + advertisingData.infor + '</b></em></p>';
    content += '</div>';
    return content;
  } else {
    return 'Dữ liệu quảng cáo không hợp lệ';
  }
}

function showAdditionalInfo(marker, content) {
  var additionalInfoWindow = new google.maps.InfoWindow({
    content: content,
    maxWidth: 1000,
  });

  // Đặt vị trí của bảng thông tin bên trái của marker
  additionalInfoWindow.setPosition(marker.getPosition());

  // Di chuyển info window về bên trái
  additionalInfoWindow.setOptions({ pixelOffset: new google.maps.Size(-600, 100) });

  // Mở bảng thông tin
  additionalInfoWindow.open(map, marker);


}


function showAdvertisementDetails(marker, Data) {
  var addDetails = new google.maps.InfoWindow({
    content: Data,
    maxWidth: 1000,
  });

  // Đặt vị trí của bảng thông tin bên phải
  addDetails.setPosition(marker.getPosition());

  var addDetailsSize = addDetails.getContent();

  addDetails.setOptions({ pixelOffset: new google.maps.Size(600, 100) });

  // Mở bảng thông tin
  addDetails.open(map, marker);
}


function reverseGeocode(location) {
  var geocoder = new google.maps.Geocoder();

  geocoder.geocode({ 'location': location }, function(results, status) {
    if (status === 'OK') {
      if (results[0]) {
        
        // Lấy địa chỉ sơ bộ từ kết quả reverse geocoding
        var formattedAddress = results[0].formatted_address;

        // Lấy thông tin chi tiết của địa điểm sử dụng Places API
        getPlaceDetails(results[0].place_id, formattedAddress);
      } else {
        console.log('Không có kết quả reverse geocoding.');
      }
    } else {
      console.error('Lỗi khi thực hiện reverse geocoding: ' + status);
    }
  });
}

function getPlaceDetails(placeId, formattedAddress) {
  var service = new google.maps.places.PlacesService(map);

  service.getDetails({ placeId: placeId }, function(place, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      // Lấy thông tin chi tiết của địa điểm và hiển thị trong InfoWindow
      show(place, formattedAddress);
    } else {
      console.error('Lỗi khi lấy chi tiết địa điểm: ' + status);
    }
  });
}

function show(place, formattedAddress) {
  // Đặt vị trí của InfoWindow tại vị trí được click
  infor.setPosition(place.geometry.location);

  // Tính toán pixelOffset để đặt InfoWindow bên phải và lên phía trên vị trí được click
  var pixelOffsetX = 0; // Điều chỉnh giá trị này để thay đổi khoảng cách về bên phải
  var pixelOffsetY = -50; // Điều chỉnh giá trị này để thay đổi khoảng cách lên phía trên

  // Đặt pixelOffset cho InfoWindow
  infor.setOptions({ pixelOffset: new google.maps.Size(pixelOffsetX, pixelOffsetY) });

  var content = '<form style="display: flex; flex-direction: column; align-items: left;">';

// Thêm icon và thông tin bảng quảng cáo
content += '<div class="advertisement-info" style="margin-bottom: auto; background-color: #c8e6c9; padding: 10px;">';
content += '<i class="fas fa-info-circle" style="color: blue; font-size: 24px; margin-right: 10px;"></i>';
content += '<b>Thông tin bảng quảng cáo:</b><br>';
content += '<div class="preserve-whitespace"> <b>          Chưa có dữ liệu!</b> </div>';
content += '<div class="preserve-whitespace">           Vui lòng chọn dữ liệu trên bản đồ để xem <br><br></div>';
content += '</div>'; // Kết thúc div advertisement-info

// Thêm icon và thông tin địa chỉ
content += '<div class="address-info" style="margin-bottom: auto; background-color: #bbdefb; padding: 10px;">';
content += '<i class="fas fa-check-circle" style="color: green; font-size: 24px; margin-right: 10px;"></i>';
content += '<b>Thông tin địa chỉ:</b><br><br>';
content += '<div class="preserve-whitespace">           ' + formattedAddress + '</div>';
content += '<div class="preserve-whitespace"> <b>          Tên quán: </b>' + place.name + '</div>';
content += '<div class="preserve-whitespace"> <b>          Đánh giá: </b>' + (place.rating || 'Chưa có đánh giá') + '</div>';
content += '<div class="preserve-whitespace"> <b>          Loại hình kinh doanh: </b>' + (place.types ? place.types.join(', ') : 'Không rõ') + '</div>';
content += '</div>';
content += '</form>';

  
// Kết thúc div address-info
// Thêm nút "BÁO CÁO VI PHẠM" và căn chỉnh nó sang phía dưới bên phải
content += '<form action="/locationAny" id="handlelocationAnyPost" method="POST"><div background-color: #bbdefb>' + 
'<input type="hidden" name="nameAny" id="nameAny" value="' + formattedAddress + '">' +
'<input type="hidden" name="diachiAny" id="diachiAny" value="' + place.name + '">' +
'<button type="submit" style="margin: 10px 10px 0px 400px; padding: 10px; align-self: flex-end; border: 2px solid #f00; left: -100px;"><i class="fas fa-exclamation-triangle" style="margin-right: 5px; color: #f00;"></i><b style="color: #f00;">BÁO CÁO VI PHẠM</b></button></div></form>';



  // Đặt nội dung cho InfoWindow
  infor.setContent(content);
  infor.open(map);
}

// Hiển thị/Ẩn thông tin "Ngày hết hạn"
function toggleExpirationDate(Date1, Date2) {
  var expirationDate = document.getElementById(Date1);
  if (expirationDate) {
    expirationDate.style.display = (expirationDate.style.display === 'none' || expirationDate.style.display === '') ? 'block' : 'none';
  } else {
    console.error('Element with id not found.');
  }

  var expirationDate1 = document.getElementById(Date2);
  if (expirationDate1) {
    expirationDate1.style.display = (expirationDate1.style.display === 'none' || expirationDate1.style.display === '') ? 'block' : 'none';
  } else {
    console.error('Element with id  not found.');
  }
}

function toggleReportList(date) {
  var expirationDate = document.getElementById(date);
  if (expirationDate) {
    expirationDate.style.display = (expirationDate.style.display === 'none') ? 'block' : 'none';
  } else {
    console.error('Element with id not found.');
  }
}

// Mở trang Report.html trong một tab/chế độ xem mới và truyền tọa độ
function redirectToReportPage() {
  //window.location.href = '/report';
}


function showMyLocation() {
  // Kiểm tra xem trình duyệt có hỗ trợ Geolocation không
  if (navigator.geolocation) {
    // Lấy vị trí hiện tại của người dùng
    navigator.geolocation.getCurrentPosition(function(position) {
      var userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude  
      };

      // Di chuyển bản đồ đến vị trí hiện tại của người dùng
      map.setCenter(userLocation);

      // Hiển thị dấu mốc ở vị trí hiện tại
      var marker = new google.maps.Marker({
        position: userLocation,
        map: map,
        title: 'My Location'
      });
    }, function() {
      console.log('Không thể xác định vị trí.');
    });
  } else {
    console.log('Trình duyệt không hỗ trợ Geolocation.');
  }
}

function showLocationText() {
  // Hiển thị "Vị trí của tôi" khi rê chuột qua
  document.getElementById('locationText').style.display = 'inline-block';
}

function hideLocationText() {
  // Ẩn "Vị trí của tôi" khi rê chuột ra khỏi nút
  document.getElementById('locationText').style.display = 'none';
}

function showQC() {
  // Hiển thị "Vị trí của tôi" khi rê chuột qua
  document.getElementById('QCText').style.display = 'inline-block';
}

function hideQC() {
  // Ẩn "Vị trí của tôi" khi rê chuột ra khỏi nút
  document.getElementById('QCText').style.display = 'none';
}

function updateClusterIcons(map, markerCluster) {
  var currentZoom = map.getZoom();

  markerCluster.getClusters().forEach(function(cluster) {
    var clusterSize = cluster.getSize();

    // Kiểm tra xem số lượng marker trong cluster có vượt qua ngưỡng không
    if (clusterSize > 1) {
      // Đường dẫn đến thư mục chứa biểu tượng
      var imagePath = '/Dan/images/';
      
      // Tên tệp tin biểu tượng sẽ là 'm' + clusterSize + '.png'
      var clusterImage = imagePath + 'm' + clusterSize + '.png';
      
      // Cập nhật biểu tượng của cluster để hiển thị ảnh chứa số lượng marker
      cluster.setIcon(clusterImage);
    }
  });
}

