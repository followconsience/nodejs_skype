$(document).ready(function(){
    /*XỬ LÝ POPUP*/
    $(document).on('click','.popup .total .top .close',function(){
        $('#wrapPopup').hide(); // wrapPopup: sử dụng cho Mobile Menu
        $('#wrapPopup2').hide(); // wrapPopup2: sử dụng cho các action Ajax
    });

    /*DATE PICKER*/
    // $('.datepicker').datepicker({
    //         autoclose: true,
    //         format: "dd-mm-yyyy",
    //         immediateUpdates: true,
    //         todayBtn: true,
    //         todayHighlight: true
    // }).datepicker("setDate", "0");

    /*MOBILE_POPUP_MENU*/
    $(document).on('click','.mobile_title',function(){
        $(this).parent().find(".mobile_submenu").toggle();
    });

    $(document).on('click','.m_icon',function(){
        $(this).parent().find(".m_submenu").toggle(); // Hiện/ẩn m_submenu đang thao tác
        $(this).toggleClass('show hide'); // Đổi icon hiển thị
        // $(this).parent().css({'border-bottom':'none'}); // Bỏ gạch chân của m_menu

        // thissubmenu = $(this).parent().find(".m_submenu");
        // $('.m_submenu').not(thissubmenu).hide(); // Ẩn các m_submenu còn lại
        // $('.m_submenu').not(thissubmenu).parent().find('.m_icon').removeClass('hide'); // Xóa icon ẩn nếu có
        // $('.m_submenu').not(thissubmenu).parent().find('.m_icon').addClass('show'); // Thêm icon show
    });

    $(document).on('click','.m_title',function(){
        $(this).parent().find(".m_submenu").toggle(); // Hiện/ẩn m_submenu đang thao tác
        $(this).parent().find('.m_icon').toggleClass('show hide'); // Đổi icon hiển thị 
    });

    /*PC_POPUP_MENU*/
    $(document).on('click','.pc_menu',function(){
        $(this).find(".pc_submenu").toggle(); // Hiển thị submenu của Menu đang thao tác
        thissubmenu = $(this).find(".pc_submenu");
        $('.pc_submenu').not(thissubmenu).hide(); // Ẩn toàn bộ submenu của các Menu còn lại
    });

    /*SHOW/HIDE LEFT MENU*/
    $(document).on('click','.menuapp',function(){
        $(this).parent().find('ul').toggle();
    });    
    $(document).on('click','.action_menu .action_title',function(){
        $(this).parent().find('.action_submenu').toggle();
        $(this).find('span').toggleClass('show hide');    
    }); 

    /*CLICK RA NGOÀI POPUP_MENU*/
    $(document).on('click',function(e){
        // Đối với popup
        if (!$(e.target).is('.mobile_title, .mobile_submenu, .m_title, .m_icon, .pc_title, .pc_submenu, .dropdown-toggle')){ // Nếu không click vào title hoặc submenu thì sẽ ẩn .submenu
            $(".mobile_submenu").hide();
            $(".pc_submenu").hide();
            $(".dropdown-menu").hide();
            e.stopPropagation();
        }      
    });

    /*MENU TÍNH NĂNG*/
    $(document).on('click','.act_menu',function(){
        $(this).find(".act_submenu").toggle();
        thissubmenu = $(this).find(".act_submenu");
        $('.act_submenu').not(thissubmenu).hide();
    });

    // Click ra ngoài phạm vi menu (áp dụng cho toàn bộ html)
    $(document).on('click',function(e){
        // Đối với popup
        if (!$(e.target).is('.act_title, .act_title_icon, .act_title_icon svg, .act_submenu')){ 
        // Tức là nếu phạm vi click không phải là div (title hoặc act_submenu) thì sẽ ẩn .act_submenu
            $(".act_submenu").hide();
            e.stopPropagation();
        }  
    }); 

    /****************SHORTINFO***************/
    $( ".shortinfo" ).mouseenter(function() {
      $(this).find('div').fadeIn(500);
    });    
    $( ".shortinfo" ).mouseleave(function() {
      $(this).find('div').hide();
    });

    /****************LỰA CHỌN THẺ OPTION***************/
    /*CHỌN DOANH NGHIỆP*/
    $(document).on('change','.cid',function(){
        window.location.href = $(this).val();
    });

    /*CHỌN NHÓM TÀI KHOẢN*/
    $(document).on('change','.rid',function(){
        window.location.href = $(this).val();
    });

    /*CHỌN CHUYÊN MỤC THẺ LỌC*/
    $(document).on('change','.cate_id',function(){
        window.location.href = $(this).val();
    });

    /*GỢI Ý KẾT QUẢ TÌM KIẾM*/
    /*Tìm kiếm thẻ lọc*/
    $(document).on('click','.search input',function(){
        $(this).parent().find('.preview').show();

        // Ẩn các preview khác
        preview = $(this).parent().find(".preview");
        $('.preview').not(preview).hide(); // Ẩn các preview còn lại    

        // Ẩn tất cả các preview2 (phục vụ hiển thị kết quả khi tìm kiếm)
        $('.preview2').hide();
    });

    /****************THẺ LỌC***************/
    /*CHỌN THẺ LỌC TỪ DANH SÁCH HIỂN THỊ*/
    $(document).on('click','.fdata',function(){
        var id = $(this).attr('class').split(" ")[1];
        $(this).parent().parent().find('input[type="hidden"]').val(id);
        $(this).parent().parent().find('input[type="text"]').val($(this).text()); // .search
        $(this).parent().hide(); // .preview/.preview2
    });        

    // Click ra ngoài phạm vi tìm kiếm
    $(document).on('click',function(e){
        // Đối với popup
        if (!$(e.target).is('.search input, .usearch input')){ // Nếu không click vào title hoặc submenu thì sẽ ẩn .submenu
            $(".preview").hide();
            $(".preview2").hide();
            $(".upreview").hide();
            e.stopPropagation();
        }      
    });

});