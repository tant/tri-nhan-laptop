# Hiện trạng:
Trí nhân laptop là một tiệm sửa laptop nhỏ với số lượng nhân viên chưa đến 10 người
Trí nhân có các dịch vụ sau 
1. Dịch vụ sửa chữa laptop
2. Mua bán trao đổi laptop cũ và linh kiện laptop
3. Đào tạo sửa laptop
4. Hợp tác sửa chữa laptop 

1. Dịch vụ sửa chữa laptop là business chính đang vận hành theo quy trình sau 
https://trinhanlaptop.vn/quytrinhsuachua/
Sau khi gửi máy tại trí nhân, khách hàng có thể truy cập link này để tra cứu phiếu hoặc tra cứu thời gian bảo hành sản phẩm của mình 
https://trinhanlaptop.vn/tra-cuu/ 
Đồng thời ở trang  này cũng mô tả chính sách bảo hành luôn 

2. Mua bán trao đổi laptop cũ và linh kiện laptop
Khách hàng có thể tham khảo danh mục hàng đang có, mỗi món là một trang web để tìm hiểu ví dụ như https://trinhanlaptop.vn/san-pham/asus-k46-i7/
Khách hàng nếu muốn mua thì gọi liên hệ thôi, không bán trực tiếp trên web nha

3. Đào tạo sửa chữa laptop
Mô tả các lớp thời gian khai giản và học phí. Đăng kí bằng cách gọi điện liên hệ. Nên cứ coi đây là một loạt các trang web, mỗi trang là một lớp vậy thôi

4. Hợp tác sửa chữa laptop 
Các cửa hàng không có thợ sửa chữa có thể hợp tác để nhận máy từ khách sau đó chuyển về Trí Nhân để sửa thôi. Các phiếu sửa chữa vẫn tạo như bình thường trừ việc khách gửi chính là các cửa hàng đối tác vậy thôi. Nên cái này chỉ coi như một trang web thông thường. Đối tác không có tài khoản gì trên hệ thống

Trên website của trinhanhlaptop.vn còn có các bài viết về kĩ thuật. Toàn bộ website dùng wordpress.

# Mong muốn:

Tôi muốn viết một hệ thống all in one để thay thế toàn bộ hệ thống hiện có. Phần backend tôi muốn dùng supabase còn frontend tôi muốn dùng vite+react+tanstack router+typescript.
Chắc chắn là tôi sẽ phải dùng Row Level Security (RLS) của supabase
Thư viện giao diện tôi muốn dùng shadcn
Tôi muốn ứng dụng mobile friendly và phần app phải đăng nhập sẵn sàng cho pwa.
Đối tượng sự dủng hệ thống 
1. Chủ shop (Tài khoản đầu tiên phải đăng nhập)
2. Nhân viên (phải đăng nhập)
3. Khách hàng (không cần đăng nhập)
Dĩ nhiên tôi sẽ viết bằngn typ


Trí Nhân Laptop Sitemap public
│
└─ Trang chủ (/) (public)
   │
   ├─ Dịch vụ Sửa chữa Laptop (/sua-laptop) (public): Tổng quan Dịch vụ Sửa chữa
   │  ├─ Quy trình Sửa chữa (/sua-laptop/quy-trinh) (public)
   │  ├─ Bảng giá Dịch vụ (/sua-laptop/bang-gia) (public)
   │  └─ Tra cứu & Bảo hành (/sua-laptop/tra-cuu) (public) Nhập số điện thoại vào sẽ thấy phiếu và thông tin tình trạng đang ở bước nào của quy trình thôi chứ không xem được toàn bộ phiếu vì còn những thông tin nội bộ khác
   │
   ├─ Sản phẩm (/san-pham) (public) truy cập vào tự động redirect qua /san-pham/laptop) 
   │  ├─ Laptop Cũ (/san-pham/laptop) (public)
   │  │  └─ Chi tiết Sản phẩm (/san-pham/laptop/ten-san-pham) (public)
   │  └─ Linh kiện Laptop (/san-pham/linh-kien) (public)
   │     └─ Chi tiết Sản phẩm (/san-pham/linh-kien/ten-linh-kien) (public)
   │ 
   ├─ Đào tạo Sửa Laptop (/dao-tao) (public): Tổng quan, danh sách các Khóa học
   │  └─ Chi tiết Khóa học (/dao-tao/ten-khoa-hoc) (public)
   │
   ├─ Hợp tác Sửa chữa (/hop-tac) (public) (lấy nội dung trang cũ qua thôi)
   │
   ├─ Giới thiệu (/gioi-thieu) (public) (lấy nội dung trang cũ qua)
   │
   ├─ Liên hệ (/lien-he) (public) (lấy nội dung cũ, làm theo layout mới là được)
   │
   ├─ Blog / Tin tức (/blog) (public)
   │  └─ Chi tiết Bài viết (/blog/tieu-de-bai-viet) (public)
   │
   │
   ├─ Login (/login) (public)
   │
   ├─ Dashboard (/dashboard) (auth) 
   │
   ├─ Phiếu sửa chữa (/phieu-sua-chua) (auth)  xem danh sách các phiếu sửa chữa trên hệ thống, có filter và ô tìm kiếm để nhanh chóng tìm ra phiếu. Trong mỗi item có quick action như sau: 1. Cuyển trạng thái 2. assign cho nhân viên khác 3. Comment vào 
   |  └ Chi tiết một phiếu sửa chữa (/phieu-sua-chua/ticketid) (auth) truy cập chi tiết một phiếu và làm đủ mọi việc
   │
   ├─ Khách hàng (/khach-hang) (auth) hiện danh sách khách hàng thôi (có thể suy nghĩ các quick action gì đó, nhưng giờ chưa có idea nào)
   │  └─ Chi tiết khách hàng (/blog/khach-hang/customerid) (auth): coi được thông tin khách hàng và lịch sử giao dịch, có thể là các phiếu của khách hàng này thôi
   │
   ├─ Cửa hàng (auth) đăng hàng trong đây sẽ tạo ra webpage của hàng /cua-hang (chỉ có 2 category là laptop và linh-kien)
   │  └─ Chi tiết thông tin một món hàng muốn bán, có hình ảnh thông tin đầy đủ (/cua-hang/[id-san-pham]) (auth)   
   │
   ├─ Kho (auth) /ton-kho để quản lý tồn kho các linh kiện trong kho, tồn kho này đồng bộ với cửa hàng nếu quyết định bán (cần nghiên cứu kĩ thêm). Nhưng hiện tại kho chỉ quản lý danh mục các linh kiện thôi, cứ để tồn kho một số lượng mặc định 10000, chúng tôi chưa thực hiện thao tác nhập kho xuất kho rõ ràng vào lúc này nhưng tương lai chắc chắn sẽ làm. 
   │
   ├─ Quản lý (auth) /admin
   │  ├─ Quản lý các tài khoản nhân viên (/admin/nhan-vien) chỉ có thể sửa hay thêm chứ không được xóa, nhân viên nghỉ thì deactivate thôi, các phiếu nhân viên đó đang được assign sẽ chuyển hết cho chủ shop. Có filter sẵn là không show các nhân viên đã deactivate
   │  └─ Thiết lập các thông tin hệ thống /admin/thiet-lap. Trong này có thiết lập tới một blog phổ biến nào đó để lấy bài về đăng (cái này tôi mô tả sau, không quan trọng lúc này)



Các idea của tôi đang có hiện tại:
Tôi không quan tâm các tài khoản của các component trong supabase. Bạn hãy tự thiết lập đầy đủ trong biến môi trường để supabase vận hành trơn tru và app có thể truy cập

Về tài khoản và phân quyền của app:
- Tài khoản của chủ shop (admin) có thể đăng nhập vào hệ thống và tạo và quản lý các tài khoản nhân viên. Tài khoản này setup sẵn trong biến môi trường. Dĩ nhiên tài khoản này sẽ làm được mọi thứ có thể.
- Mọi tài khoản đều dùng format là email+password, không cần phức tạp. Cũng chỉ có 2 loại account là chủ shop và nhân viên thôi, không chia cụ thể hơn vai trò hay gì lúc này
- Tải khoản nhân viên sẽ được thêm xóa sửa bởi tài khoản chủ shop. Tài khoản này dành cho nhân viên lo việc sửa chữa và bảo hành cho khách nên có các quyền sau
  Tạo và cập nhật các phiếu sửa chữa
  Cập nhật linh kiện cho 1 phiếu sửa chữa để thực hiện việc sửa chữa
  Xem thông tin khách hàng và lịch sử để tiếp khách cho chu đáo, không sửa được mà có thể yêu cầu cập nhật thông tin khách hàng nếu cần bằng cách thêm vào một comment, chủ shop sẽ review và xử lý manualy sau.

Về dữ liệu khách hàng
- Số điện thoại của khách được coi như là primary key, nếu khách có nhiều số thì được ứng xử như nhiều khách hàng khác nhau.
- Khi tạo phiếu với số điện thoại mới thì cũng tạo mới một khách hàng
- Các giao tiếp với khách hàng thực hiện qua điện thoại, không quản lý trên hệ thống 

Về môi trường phát triển và production:
- Tôi không cần phân biệt hai môi trường vì đây là một ứng dụng đơn giản. Chỉ cần tạo một cái thôi
- Tôi muốn có một docker compose chỉ cần chạy cái là hệ thống sẽ up lên đầy đủ cả supabase selfhost và app để sau này triển khai thuận tiện
- Tôi sẽ tự lo về reverse proxy bên ngoài nên bạn chỉ cần đảm bảo app chạy trên localhost với port cụ thể là xong. Dĩ nhiên trong biến môi trường vẫn có thiết lập public url


Về system notification
- Chưa hỗ trợ tuy nhiên sẵn sàng để triển khai, tích hợp sau này. Tôi dự kiến dùng chatwoot để quản lý

Về các dữ liệu
Phiếu sửa chữa:
- Mã phiếu sửa chữa cần dùng nên tạo các id thân thiện dễ nhớ hơn là UUID nha
- Có các tấm hình chụp ở các bước trong quy trình, upload thoải mái không giới hạn
- Khách chỉ cần coi trạng thái hiện tại và lần cập nhật cuối cùng của phiếu là ok 
- Comment trên phiếu là thông tin nội bộ giúp nhân viên trao đổi thuận tiện về phiếu, không cho khách hàng xem 

Về quy trình sửa chữa
Trong quá trình giải quyết một phiếu sửa chữa, nhân viên sẽ có thể cần dùng linh kiện để xử lý. Nhân viên chỉ việc thêm linh kiện vào phiếu là xong. Phần quản lý tồn kho sẽ xử lý sau này


📋 HỆ THỐNG TRẠNG THÁI PHIẾU SỬA CHỮA

  1. TIẾP NHẬN THIẾT BỊ

  - Nhân viên: device_received
  - Khách hàng: "Đã tiếp nhận thiết bị"
  - Mô tả: Thiết bị đã được giao và ghi nhận vào hệ thống
  - Chuyển đổi từ: Không có (trạng thái đầu)
  - Chuyển đổi đến: preliminary_inspection

  2. KIỂM TRA SƠ BỘ

  - Nhân viên: preliminary_inspection
  - Khách hàng: "Đang kiểm tra ban đầu"
  - Mô tả: Phân loại lỗi và đánh giá mức độ phức tạp
  - Chuyển đổi từ: device_received
  - Chuyển đổi đến: awaiting_repair_plan, cannot_repair

  3. CHỜ XÁC NHẬN PHƯƠNG ÁN

  - Nhân viên: awaiting_repair_plan
  - Khách hàng: "Chờ xác nhận phương án sửa chữa"
  - Mô tả: Đã có báo giá và phương án, chờ khách hàng quyết định
  - Chuyển đổi từ: preliminary_inspection, detailed_diagnosis
  - Chuyển đổi đến: approved_for_repair, cancelled_by_customer

  4. ĐÃ PHÊ DUYỆT SỬA CHỮA

  - Nhân viên: approved_for_repair
  - Khách hàng: "Đã xác nhận sửa chữa"
  - Mô tả: Khách hàng đồng ý phương án và chi phí
  - Chuyển đổi từ: awaiting_repair_plan
  - Chuyển đổi đến: in_diagnosis, waiting_parts, in_repair (tùy loại sửa)

  5. ĐANG CHẨN ĐOÁN CHI TIẾT

  - Nhân viên: in_diagnosis
  - Khách hàng: "Đang chẩn đoán chi tiết"
  - Mô tả: Thực hiện chẩn đoán kỹ thuật sâu (chỉ áp dụng với lỗi phức tạp)
  - Chuyển đổi từ: approved_for_repair
  - Chuyển đổi đến: awaiting_repair_plan, waiting_parts, in_repair

  6. CHỜ LINH KIỆN

  - Nhân viên: waiting_parts
  - Khách hàng: "Đang đặt hàng linh kiện"
  - Mô tả: Cần đặt mua linh kiện thay thế
  - Chuyển đổi từ: approved_for_repair, in_diagnosis
  - Chuyển đổi đến: in_repair

  7. ĐANG SỬA CHỮA

  - Nhân viên: in_repair
  - Khách hàng: "Đang thực hiện sửa chữa"
  - Mô tả: Thực hiện sửa chữa/thay thế linh kiện
  - Chuyển đổi từ: approved_for_repair, in_diagnosis, waiting_parts
  - Chuyển đổi đến: quality_testing, repair_failed

  8. KIỂM TRA CHẤT LƯỢNG

  - Nhân viên: quality_testing
  - Khách hàng: "Đang kiểm tra chất lượng"
  - Mô tả: Test toàn diện chức năng và ổn định
  - Chuyển đổi từ: in_repair
  - Chuyển đổi đến: ready_for_pickup, in_repair (nếu cần sửa lại)

  9. SẴN SÀNG GIAO

  - Nhân viên: ready_for_pickup
  - Khách hàng: "Sẵn sàng nhận máy"
  - Mô tả: Hoàn thành sửa chữa, thông báo khách hàng
  - Chuyển đổi từ: quality_testing
  - Chuyển đổi đến: completed, customer_no_show

  10. HOÀN THÀNH

  - Nhân viên: completed
  - Khách hàng: "Đã hoàn thành"
  - Mô tả: Khách hàng đã nhận máy và thanh toán
  - Chuyển đổi từ: ready_for_pickup
  - Chuyển đổi đến: Không có (trạng thái cuối)

  🔴 TRẠNG THÁI ĐẶC BIỆT

  11. KHÔNG THỂ SỬA

  - Nhân viên: cannot_repair
  - Khách hàng: "Không thể sửa chữa"
  - Mô tả: Thiết bị hỏng quá nặng hoặc không kinh tế
  - Chuyển đổi từ: preliminary_inspection, in_diagnosis
  - Chuyển đổi đến: ready_for_return

  12. HỦY BỞI KHÁCH HÀNG

  - Nhân viên: cancelled_by_customer
  - Khách hàng: "Đã hủy sửa chữa"
  - Mô tả: Khách hàng không đồng ý phương án
  - Chuyển đổi từ: awaiting_repair_plan
  - Chuyển đổi đến: ready_for_return

  13. SỬA KHÔNG THÀNH CÔNG

  - Nhân viên: repair_failed
  - Khách hàng: "Sửa chữa gặp khó khăn"
  - Mô tả: Quá trình sửa gặp vấn đề kỹ thuật
  - Chuyển đổi từ: in_repair
  - Chuyển đổi đến: awaiting_repair_plan, cannot_repair

  14. KHÁCH KHÔNG ĐẾN NHẬN

  - Nhân viên: customer_no_show
  - Khách hàng: "Chờ khách hàng liên hệ"
  - Mô tả: Đã thông báo nhưng khách không đến nhận
  - Chuyển đổi từ: ready_for_pickup
  - Chuyển đổi đến: completed, abandoned

  15. SẴN SÀNG TRẢ LẠI

  - Nhân viên: ready_for_return
  - Khách hàng: "Sẵn sàng trả máy"
  - Mô tả: Thiết bị sẵn sàng trả lại (không sửa/hủy)
  - Chuyển đổi từ: cannot_repair, cancelled_by_customer
  - Chuyển đổi đến: completed

  16. BỎ QUÊN

  - Nhân viên: abandoned
  - Khách hàng: "Liên hệ để nhận máy"
  - Mô tả: Khách hàng không liên lạc được sau thời gian dài
  - Chuyển đổi từ: customer_no_show
  - Chuyển đổi đến: completed

  🔄 LUỒNG CHUYỂN ĐỔI CHÍNH

  Luồng Thành Công:

  device_received → preliminary_inspection → awaiting_repair_plan
  → approved_for_repair → [in_diagnosis] → [waiting_parts]
  → in_repair → quality_testing → ready_for_pickup → completed

  Luồng Hủy/Không Sửa:

  preliminary_inspection → cannot_repair → ready_for_return → completed
  awaiting_repair_plan → cancelled_by_customer → ready_for_return → completed

  Luồng Sửa Thất Bại:

  in_repair → repair_failed → awaiting_repair_plan hoặc cannot_repair

  📊 QUY TẮC CHUYỂN ĐỔI

  Điều Kiện Bắt Buộc:

  1. preliminary_inspection → awaiting_repair_plan: Phải có báo cáo lỗi
  2. awaiting_repair_plan → approved_for_repair: Cần xác nhận khách hàng
  3. in_repair → quality_testing: Hoàn thành sửa chữa
  4. ready_for_pickup → completed: Thanh toán và ký nhận

  Timeout Rules:

  - awaiting_repair_plan: 7 ngày → cancelled_by_customer
  - ready_for_pickup: 30 ngày → customer_no_show
  - customer_no_show: 90 ngày → abandoned

  Hệ thống này giúp nhân viên quản lý kỹ thuật chi tiết trong khi khách hàng nhận được thông tin dễ hiểu và phù hợp!


