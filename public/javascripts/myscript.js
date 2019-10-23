// Gọi điện lên server (tổng đài)
var socket = io.connect('http://localhost:3000/'); // URL của website
// var socket = io.connect('https://wegive4.herokuapp.com/'); // URL của website

/*CÁC HÀM HAY DÙNG*/
var dongho = function () {
	var t = new Date();
	var ngay = t.getDate();
	var thang = t.getMonth()+1;
	var nam = t.getFullYear();
	var gio = t.getHours();
	var phut = t.getMinutes();
	var giay = t.getSeconds();
	var thoigian = ngay +'/' + thang +'/' + nam +' '+ gio + ':' + phut;
	return thoigian;
}

/*************SOCKET.IO**************/
// Testing emit to 1 room cụ thể
socket.on('send_data_room_demo_ssc', message => {
	console.log({ send_data_room_demo_ssc: 'send_data_room_demo_ssc', message });
});


socket.on("Server-send-data", function(data){
	alert(data);
});

/*EVENT 03*/
socket.on("Server-send-data-3", function(data){
	// alert('ok');
	var str='';
	str += '<div class="message" title="9:05 14/10/2018">';
	str += '<img class="ava" src="/avatar/'+data.user.avatar+'">';
	str += '<div class="userchat">';
	str += '<span>'+data.user.username+'</span>';
	str += '</div>';
	str += '<div class="mss">';
	str += '<span>'+data.message+'</span>';
	str += '</div>';
	str += '<div class="clx"></div>';
	str += '</div>';
	$('.allmss').append(str);
	$('.typing').hide(); // Ẩn typing
});

/*EVENT 04*/
socket.on("Server-send-data-4", function(data){
	// alert('ok');
	$('.typing').html('<i>'+data.username+' is typing...</i>');
	$('.typing').show();
});

socket.on("Server-send-data-5", function(data){
	// alert('ok');
	// console.log(data.img);
	var str='';
	str += '<div class="message" title="9:05 14/10/2018">';
	str += '<img class="ava" src="/avatar/'+data.user.avatar+'">';
	str += '<div class="userchat">';
	str += '<span>'+data.user.username+'</span>';
	str += '</div>';
	str += '<div class="mss">';
	// str += '<span>'+data.message+'</span>';
	data.files.forEach(function(item){
		str += '<img class="imgchat" src="/uploads/'+item.filename+'">';
	});
	str += '</div>';
	str += '<div class="clx"></div>';
	str += '</div>';
	$('.allmss').append(str);
});

$(document).ready(function(){
	/*************TEST SOCKET**************/
	$('p.status').click(function(){
		var notice = 'Welcome to the realworld';
	  // alert(notice);
	  $.ajax({
	    url: '/testsocket',
	    type: 'post',
	    dataType: 'html',
	    data: {notice:notice},
	    success: function(data){ // Kết quả bên ajax trả về
	      socket.emit("Client-send-data", data);
	    }
	  });

	});

	/*************TẠO GROUP**************/
	$('.left .setting a .ct2').click(function(){
		// alert('data');
		var str = "";
		str += '<div class="top">';
		str += '<h1>Create an group chat</h1><button class="close" title="Close">X</button>';
		str += '</div>';
		str += '<form class="fs" method="post">';
		str += '<input type="text" name="groupname" class="groupname" placeholder="Name"><br>';
		str += '<button type="button" class="btnTaoRoom">Create</button>';
		str += '</form>';
		$('#wrapPopup2 .popup .total').html(str);
		$('#wrapPopup2').show();

		$('#wrapPopup2 .popup .total .btnTaoRoom').click(function(){
			$('#wrapPopup2').hide();
			var name = $('.groupname').val();
			// alert('name');
			if (name != "") {
				$.ajax({
			    url: '/addgroup',
			    type: 'post',
			    dataType: 'html',
			    data: {name:name},
			    success: function(data){ // Kết quả bên ajax trả về
						window.location.href = '/';
			    }
			  });
			}
		});
	});

	/****************JOIN GROUP***************/
	$('.gava').click(function(){

		// Active thẻ chọn left menu và ẩn các menu còn lại
		$(this).parent().attr({'class':'active'});
		thismenu = $(this).parent();
		$('.left').find('li').not(thismenu).attr({'class':''});

		// Lấy tên phòng cũ
		var oldRoom = $('textarea').attr('currentroom');

		// Lấy tên phòng mới
		var idRoom = $(this).attr('room');
		var nameRoom = $(this).find('span.name').text();
		var imgRoom = $(this).find('img').attr('src');

		var data = {"newRoom":idRoom,"oldRoom":oldRoom};

		/*EVENT 02: JOIN ROM MỚI*/
		socket.emit("Client-send-data-2", data);

		var str='';
		// Header
		str += '<div class="header">';
		str += '<div class="avatar">';
		str += '<img class="img1" src="'+imgRoom+'">';
		str += '<span>'+nameRoom+'</span>';
		str += '<img title="Thêm thành viên" groupid="'+idRoom+'" class="img2 cla1" src="/images/add_person.png">';
		str += '<div class="clx"></div>';
		str += '</div>';
		str += '</div>';

		// Chatbox
		str += '<div class="wechat">';
		str += '<div class="chatbox">';
		str += '<div class="allmss"></div>'; // All message
		str += '</div>';

		// Typing
		str += '<div class="typing" style="display:none;"></div>';

		// Form textbox
		str += '<div class="textbox">';
		str += '<form class="fs" method="post">';
		str += '<textarea currentroom="'+idRoom+'" name="name" placeholder="Type a message here"></textarea>';
		str += '<label for="files">  <img class="icon1" title="Gửi ảnh/file đính kèm" src="/images/attach.png"></label>';
		str += '<input style="display:none;" type="file" name="file[]" id="files" multiple>';
		// str += '<input style="display:none;" type="text" name="groupid" class="groupid" value="'+idRoom+'">';
		str += '<img class="icon2" title="Send" src="/images/send.png">';
		str += '</form>';
		str += '</div>';

		$('.right').html(str);

		// Hiển thị màn hình chờ
		$('.allmss').html('<img src="/images/loading.gif" style="width:30px;">');

		// AJ6: Lấy dữ liệu tin nhắn
		$.ajax({
			url: '/listmss',
			type: 'post',
			dataType: 'json',
			data:{groupid:idRoom},
			// contentType: 'application/json',
			success: function(data){ // Kết quả bên ajax trả về
				if (data.mss.comment.length) {
					var str='';
					data.mss.comment.forEach(function(item){
						str += '<div class="message" title="9:05 14/10/2018">';
						str += '<img class="ava" src="/avatar/'+item.user.avatar+'">';
						str += '<div class="userchat">';
						str += '<span>'+item.user.username+'</span>';
						str += '</div>';
						str += '<div class="mss">';
						if (item.content != "") {
								str += '<span>'+item.content+'</span>';
						}
						if (item.file !="") {
							str += '<img class="imgchat" src="/uploads/'+item.file+'">';
						}
						str += '</div>';
						str += '<div class="clx"></div>';
						str += '</div>';
					});
					$('.allmss').html(str);
				}
			}
		});

		/****************ADD PEOPLE TO GROUP***************/
		$('.cla1').click(function(){
			var groupid = $(this).attr('groupid');
			// alert(groupid);
			var arr = []; // Mảng chứa thông tin thành viên sẽ được add

			/*Hiển thị form*/
			var str='';
			str += '<div class="top"><h1>Add friends to this group</h1><button class="close" title="Close">X</button></div>';
			str += '<div class="search-input cla2" contenteditable="true" placeholder="Tìm kiếm bạn bè"></div>';

			// Kết quả lựa chọn
			str += '<div class="result cla5"></div>';

			// Danh sách bạn bè
			str += '<div class="friends cla3">';
			str += '<h2>Danh sách bạn bè</h2>';
			str += '<div class="listfriends">';
			str += '</div>';
			str += '</div>';

			// Form submit
			str += '<form class="fs" method="post">';
			// str += '<button type="button" class="btnCancel">Cancel</button>';
			str += ' <button type="button" class="'+groupid+' btnAdd cla6">Finish</button>';
			str += '</form>';

			// Hiển thị kết quả
			$('#wrapPopup2 .popup .total').html(str);
			$('#wrapPopup2').show();

			/*AJ3: Lấy dữ liệu danh sách bạn bè đổ ra form*/
			$.ajax({
				url: '/listaccount',
				type: 'post',
				dataType: 'json',
				data:{groupid:groupid},
				success: function(data){ // Kết quả bên ajax trả về
					var str1 = '';
					// alert(data.mems);
					data.mems.member.forEach(function(item){
						str1 += '<div class="'+item._id+' member"><img src="/avatar/'+item.user.avatar+'"><span class="name">'+item.user.username+'</span>  <span class="remove" title="Loại bỏ">X</span><div class="clx"></div></div>';
					});
					$('.cla5').html(str1);

					var str2 = '';
					data.accs.forEach(function(item){
						str2 += '<div class="'+item._id+' member cla4" title="Thêm thành viên"><img src="/avatar/'+item.avatar+'"><span class="name">'+item.username+'</span><div class="clx"></div></div>';
					});
					$('.cla3 .listfriends').html(str2);

					// Xác nhận hành động và ghi dữ liệu vào DB
					$('.cla4').click(function() {
						var id = $(this).attr('class').split(' ')[0];
						arr.push(id);

						var src = $(this).find('img').attr('src');
						var name = $(this).find('span').text();
						var str = '<div class="'+id+' member"><img src="'+src+'"><span class="name">'+name+'</span>  <span class="remove" title="Loại bỏ">X</span><div class="clx"></div></div>';

						$('.cla5').append(str); // Thêm vào danh sách lựa chọn
						$(this).remove(); // Xóa trong danh sách bạn bè
					});
				}
			});

			$('.cla6').click(function() {
				var data = {};
				data.gid = groupid;
				data.people = arr;
				/*AJ4: Thêm vào mảng để thêm vào cơ sở dữ liệu*/
				$.ajax({
					url: '/addpeople',
					type: 'post',
					data: JSON.stringify(data),
					contentType: 'application/json',
					success: function(){ // Kết quả bên ajax trả về
						window.location.href = '/';
					}
				});

			});

			// $(document).on( 'keyup', '.cla2', function() {
			// 	var text = $(this).text();
			//   alert(text);
			// });

		});

		/*EVENT 03: CHAT*/
		// Step 1: Event 3 vào trong Event 2 do cây html event 3 được event 2 tạo ra
		$('textarea').keyup(function(e){
			var room = $(this).attr('currentroom');

			$.ajax({
				url: '/typing',
				type: 'post',
				data: 'html',
				success: function(data){ // Kết quả bên ajax trả về
					// alert(data+room);
					socket.emit("Client-send-data-4", {"room":room,"username":data});
				}
			});

			if(e.keyCode == 13){
				var message = $(this).val();
				if (message != "") {
					var room = $(this).attr('currentroom');
					$(this).val("");

					var data = {};
					data.mss = message;
					data.ro = room;

					/*AJ5*/
					$.ajax({
						url: '/addmessage',
						type: 'post',
						data: JSON.stringify(data),
						contentType: 'application/json',
						success: function(data){ // Kết quả bên ajax trả về
							socket.emit("Client-send-data-3", {"room":room,"user":data.user,"message":message});
							// alert(data.user.username);
						}
					});
				}

			}
		});

		/*UPLOAD IMAGES*/
		// Khai báo phần tử html chứa các file cần preview
		var selDiv = "";

		// Khai báo mảng chứa các file preview trước khi upload
		var storedFiles = [];

		/*XỬ LÝ CÁC SỰ KIỆN*/
		// Lựa chọn file: thực thi hàm preview ảnh trước khi upload
		$("#files").on("change", handleFileSelect);

		// Gán là phần tử bao bọc các ảnh cần preview
		selDiv = $(".allmss");

		// Xóa file khi không muốn chọn để upload
		$("body").on("click", ".selFile", removeFile);

		// Thực thi submit form
		$('#files').change(handleForm);

		/*For testing*/
		// Hàm trả về 1 mảng từ biểu thức
		function list() {
		  return Array.prototype.slice.call(arguments);
		}

		/*Preview images/double check before upload to server*/
		function handleFileSelect(e) {
			var files = e.target.files; // Là một đối tượng
			var filesArr = Array.prototype.slice.call(files); // Mảng chứa các phần tử file

			// Duyệt mảng để lưu giá trị và fileReader
			filesArr.forEach(function(f) {

				// Kiểm tra nếu không phải là file ảnh thì trả về
				if(!f.type.match("image.*")) {
					return;
				}

				// Lưu các phần tử hợp lệ vào một mảng mới (chỉ gồm các file ảnh)
				storedFiles.push(f);

				// Khởi tạo đối tượng đọc file
				var reader = new FileReader();
				// reader.onload = function (e) {
				// 	// Khai báo phần html chứa ảnh preview
				// 	var html = "<div><img src=\"" + e.target.result + "\" class='selFile' title='Click to remove'>" + f.name + "<br clear=\"left\"/></div>";
				// 	// var html = "<div><img src=\"" + e.target.result + "\" class='selFile' title='Click to remove'>" + f.name + "<br clear=\"left\"/></div>";
				//
				// 	// Hiển thị kết quả ra màn hình
				// 	selDiv.append(html);
				// }

				// Tiến hành đọc nội dung file
				reader.readAsDataURL(f);
			});
		}

		/*Remove file before upload to server*/
		function removeFile(e) {
			// Xóa phần tử file (chọn bỏ đi) khỏi mảng storedFiles[] cần đưa sang php để upload
			var file = $(this).data("file");

			// Kiểm tra xem file cần bỏ đi là phần tử nào
			for(var i=0; i<storedFiles.length; i++) {
				if(storedFiles[i].name === file) {

					// Khi phát hiện ra thì sẽ xóa phần tử (i) đó đi (1 - xóa 1 phần tử), không thêm vào mảng phần tử nào khác
					storedFiles.splice(i,1);

					// Dừng lệnh kiểm tra tới các phần tử còn lại của mảng khi đã phát hiện và xử lý xong với phần tử cần xử lý
					break;
				}
			}

			// Xóa bỏ hiển thị phần tử trong preview
			$(this).parent().remove();
		}

		/*Upload file to server via FormData()*/
		function handleForm(e) {
			// Ngăn chặn tải lại trang khi submit form
			e.preventDefault();

			 // Kiểm tra xem đã chọn file để upload hay chưa
		    var file = $(this)[0].files[0];
		    if (file) { // Nếu chọn file để upload

				// Khởi tạo đối tượng formData
				var dataF = new FormData();

				var gid = $('.fs textarea').attr('currentroom');
				dataF.append("groupid", gid);

				// Thêm các phần tử file vào formData để truyền qua AJAX
				var len = storedFiles.length;
				for (var i = 0; i < len; i++) {
					dataF.append("files[]", storedFiles[i]);
				}

				// Nếu sử dụng cấu trúc này thì dataF sẽ chứa dữ liệu của form hiện tại=>bao gồm cả các ảnh đã bị chọn xóa
				// var dataF = new FormData(this);

			    $.ajax({
			        url:'/addfile',
			        type:'post',
			        data: dataF, // Là cách truyền giá trị của form sang trang xử lý
			        contentType: false,
							// contentType: 'application/json',
			        processData: false,
			        success: function(data) {
			            // console.log(data);
			            // alert(data.avatar);
									socket.emit("Client-send-data-5", {"room":gid,"user":data.user,"files":data.files});
			        },
			    });
			}else{
				alert('Chưa chọn file');
			}
		}



	});



});
