// https://kipalog.com/posts/var--let-va-const-trong-ES6
/**
* Sử dụng var khi khai báo biến
* Sử dụng cont khi khai báo hằng
* Sử dụng let cho việc tính tổng
*/
// File basic_function.js đại diện cho lớp đối tượng

/***************KIỂM TRA DỮ LIỆU TRỐNG****************/
var checkEmpty = function(arr){
  var check = 0;
  arr.forEach(function(item){
    if(item == ""){
      check++;
    }
  });
  if(check == 0){
    return false;
  }else{
    return true;
  }
}


/***************EXPORTS MODULE****************/
module.exports.checkEmpty = checkEmpty;
