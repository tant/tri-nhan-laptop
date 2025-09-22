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


## Triển khai & Hạ tầng (đã chốt)

- Mô hình: Self-host, all-in-one bằng một docker-compose (app + Supabase: db, auth, rest, realtime, storage, imgproxy, meta, studio, functions, kong).
- Môi trường: Chỉ 1 môi trường duy nhất (không tách dev/prod). Dùng một file `.env` để cấu hình.
- Reverse proxy/TLS: Sử dụng reverse proxy bên ngoài, stack này chỉ cần lắng nghe trên localhost với các cổng cố định.
- Dữ liệu: Lưu trữ bền vững qua volumes dưới thư mục `supabase/volumes/*` (db, storage, functions, api config).
- Bảo mật: Dùng JWT secret, service role key, anon key, mật khẩu Postgres từ biến môi trường; SMTP là tùy chọn.
- Scheduler: Chưa kích hoạt job/scheduler tự động (pg_cron/Edge Functions) cho chuyển trạng thái; mọi chuyển trạng thái thực hiện thủ công bởi nhân viên.

Các thông số cần xác nhận tiếp theo (sẽ cập nhật vào tài liệu sau khi trả lời):
- Cổng public nội bộ cho các dịch vụ: App (mặc định đề xuất: 3001), API Gateway/Kong (đề xuất: 8000 HTTP, 8443 HTTPS), Studio (đề xuất: 3010). DB chỉ nội bộ, không expose.
- Giá trị URL công khai: `SITE_URL`, `SUPABASE_PUBLIC_URL`, `VITE_SUPABASE_URL` (thường trỏ tới Kong HTTP) và các biến `.env` liên quan.

## Biến môi trường (.env)

Danh sách biến đã được tách sang file riêng: xem `docs/env.md`.


Trí Nhân Laptop Sitemap public
│
└─ Trang chủ (/) (public)
   │
   ├─ Dịch vụ Sửa chữa Laptop (/sua-laptop) (public): Tổng quan Dịch vụ Sửa chữa
   │  ├─ Quy trình Sửa chữa (/sua-laptop/quy-trinh) (public)
   │  ├─ Bảng giá Dịch vụ (/sua-laptop/bang-gia) (public)
   │  └─ Tra cứu & Bảo hành (/sua-laptop/tra-cuu) (public) Nhập số điện thoại để tra cứu. Mặc định hiển thị danh sách các phiếu đang trong quá trình sửa chữa. Có một mục riêng để tra cứu thông tin bảo hành cho các phiếu đã hoàn thành.
   │
   ├─ Sản phẩm (/san-pham) (public) truy cập vào tự động redirect qua /san-pham/laptop) 
   │  ├─ Laptop Cũ (/san-pham/laptop) (public)
   │  │  └─ Chi tiết Sản phẩm (/san-pham/laptop/ten-san-pham) (public)
   │  └─ Linh kiện Laptop (/san-pham/linh-kien) (public)
   │     └─ Chi tiết Sản phẩm (/san-pham/linh-kien/ten-linh-kien) (public)
   │ 
   ├─ Đào tạo Sửa Laptop (/dao-tao) (public): Trang tĩnh, chỉ dựng sườn giao diện, chưa có chức năng quản lý.
   │  └─ Chi tiết Khóa học (/dao-tao/ten-khoa-hoc) (public)
   │
   ├─ Hợp tác Sửa chữa (/hop-tac) (public) (lấy nội dung trang cũ qua thôi)
   │
   ├─ Giới thiệu (/gioi-thieu) (public) (lấy nội dung trang cũ qua)
   │
   ├─ Liên hệ (/lien-he) (public) (lấy nội dung cũ, làm theo layout mới là được)
   │
   ├─ Blog / Tin tức (/blog) (public): Trang tĩnh, chỉ dựng sườn giao diện, chưa có chức năng quản lý.
   │  └─ Chi tiết Bài viết (/blog/tieu-de-bai-viet) (public)
   │
   │
   ├─ Login (/login) (public)
   │
   ├─ Dashboard (/dashboard) (auth) Trang tổng quan, hiển thị các thông tin quan trọng để nắm bắt tình hình hoạt động:
   │  ├─ Các thẻ thống kê số lượng phiếu theo từng trạng thái quan trọng (ví dụ: Chờ kiểm tra, Chờ xác nhận, Đang sửa, Sẵn sàng giao).
   │  ├─ Danh sách các phiếu mới nhất được giao cho nhân viên đăng nhập (hoặc các phiếu chưa được giao đối với admin).
   │  └─ Lối tắt để nhanh chóng tạo phiếu sửa chữa mới.
   │
   ├─ Phiếu sửa chữa (/phieu-sua-chua) (auth)  xem danh sách các phiếu sửa chữa trên hệ thống, có filter và ô tìm kiếm để nhanh chóng tìm ra phiếu. Trong mỗi item có quick action như sau: 1. Cuyển trạng thái 2. assign cho nhân viên khác 3. Comment vào 
   |  └ Chi tiết một phiếu sửa chữa (/phieu-sua-chua/ticketid) (auth) truy cập chi tiết một phiếu và làm đủ mọi việc
   │
   ├─ Khách hàng (/khach-hang) (auth) hiện danh sách khách hàng thôi (có thể suy nghĩ các quick action gì đó, nhưng giờ chưa có idea nào)
   │  └─ Chi tiết khách hàng (/blog/khach-hang/customerid) (auth): coi được thông tin khách hàng và lịch sử giao dịch, có thể là các phiếu của khách hàng này thôi
   │
   ├─ Cửa hàng (auth) đăng hàng trong đây sẽ tạo ra webpage của hàng /cua-hang (chỉ có 2 category là laptop và linh-kien). Quy trình bán hàng: thực hiện bên ngoài hệ thống, sau khi bán xong chủ shop vào đây để tắt (deactivate) món hàng.
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

Chính sách quyền xem phiếu (đã chốt):
- Nhân viên: XEM ĐƯỢC TẤT CẢ phiếu trong hệ thống (không giới hạn theo người được assign).
- Admin: Xem/Quản trị tất cả.
- UI: Mặc định filter "phiếu của tôi" để thao tác nhanh; có thể chuyển sang "tất cả" khi cần.

## Quản trị nhân viên (đã chốt)

- Deactivate: Khi deactivate một nhân viên, hệ thống TỰ ĐỘNG chuyển toàn bộ phiếu đang được assign của nhân viên đó về chủ shop (admin).
- Danh sách: Mặc định không hiển thị nhân viên đã deactivate; có filter để bao gồm nếu cần xem lại.
- Quyền: Nhân viên đã deactivate không thể đăng nhập hay thao tác dữ liệu.

Chính sách đăng ký & khởi tạo tài khoản (đã chốt):
- Khóa self-signup: Người dùng không thể tự đăng ký. Chỉ chủ shop tạo tài khoản nhân viên (DISABLE_SIGNUP=true).
- Đăng nhập: Email + mật khẩu.
- Kích hoạt tài khoản: Nếu không cấu hình SMTP, dùng auto-confirm (ENABLE_EMAIL_AUTOCONFIRM=true) để bỏ qua email xác minh. Nếu có SMTP, có thể dùng email invite/confirm/recover.
- Khôi phục mật khẩu: Nếu không dùng SMTP, chủ shop có thể đặt/mặc định lại mật khẩu cho nhân viên theo quy trình nội bộ.

Về dữ liệu khách hàng
- Số điện thoại của khách được coi như là primary key, nếu khách có nhiều số thì được ứng xử như nhiều khách hàng khác nhau.
- Khi tạo phiếu với số điện thoại mới thì cũng tạo mới một khách hàng
- Các giao tiếp với khách hàng thực hiện qua điện thoại, không quản lý trên hệ thống 

Chính sách hợp nhất khách hàng (đã chốt):
- Không hợp nhất. Mỗi số điện thoại tương ứng một khách hàng riêng biệt, kể cả khi là cùng một người đổi số.
- Nếu cần thay đổi sau này, sẽ bổ sung công cụ merge do admin thao tác thủ công và cập nhật lại chính sách.

RLS khách hàng (đã chốt):
- Quyền xem:
  - Nhân viên & Admin: XEM ĐẦY ĐỦ thông tin khách hàng (tên, điện thoại, địa chỉ, ghi chú) và lịch sử giao dịch/phiếu.
  - Công khai: Chỉ qua trang tra cứu bằng số điện thoại, XEM GIỚI HẠN (trạng thái phiếu, cập nhật gần nhất, không thấy ảnh/ghi chú/chi phí).
- Quyền sửa:
  - Admin: tạo/cập nhật hồ sơ khách hàng.
  - Nhân viên: KHÔNG sửa trực tiếp; nếu cần chỉnh, để lại comment nội bộ để admin xử lý.

Về môi trường phát triển và production:
- Tôi không cần phân biệt hai môi trường vì đây là một ứng dụng đơn giản. Chỉ cần tạo một cái thôi
- Tôi muốn có một docker compose chỉ cần chạy cái là hệ thống sẽ up lên đầy đủ cả supabase selfhost và app để sau này triển khai thuận tiện
- Tôi sẽ tự lo về reverse proxy bên ngoài nên bạn chỉ cần đảm bảo app chạy trên localhost với port cụ thể là xong. Dĩ nhiên trong biến môi trường vẫn có thiết lập public url


Về system notification
- Chưa hỗ trợ tuy nhiên sẵn sàng để triển khai, tích hợp sau này. Tôi dự kiến dùng chatwoot để quản lý

Về các dữ liệu
Phiếu sửa chữa:
- Mã phiếu sửa chữa: dùng mã thân thiện thay vì UUID.
  - Định dạng (đã chốt): TRN-YYYY-###### (ví dụ: TRN-2025-000123)
  - Quy tắc: tiền tố "TRN" cố định, YYYY là năm hiện tại, số thứ tự tăng dần 6 chữ số và reset theo năm
  - Tính duy nhất: unique toàn hệ thống; sử dụng sequence trong DB để đảm bảo không trùng khi concurrent
  - Lưu trữ: cột `ticket_code` (unique). Vẫn có thể lưu thêm `id` dạng UUID nội bộ để tham chiếu kỹ thuật, nhưng mã hiển thị chính là `ticket_code`
- Ảnh chụp: không giới hạn số lượng/kích thước (phụ thuộc dung lượng ổ đĩa)
  - Lưu trữ: Storage bucket riêng (ví dụ: `tickets`) theo cấu trúc `tickets/{ticket_code}/YYYY-MM-DD/`
  - Quyền truy cập: private by default; chỉ nhân viên/admin xem được qua signed URL; khách không xem ảnh, chỉ thấy trạng thái và cập nhật gần nhất
  - Tối ưu ảnh: hỗ trợ thumbnail/resize qua imgproxy (bật cấu hình khi cần)
  - Tương lai: có thể bổ sung giới hạn FILE_SIZE_LIMIT hoặc quota theo phiếu nếu cần
- Khách chỉ cần coi trạng thái hiện tại và lần cập nhật cuối cùng của phiếu là ok 
- Comment trên phiếu là thông tin nội bộ giúp nhân viên trao đổi thuận tiện về phiếu, không cho khách hàng xem 

Về quy trình sửa chữa
Trong quá trình giải quyết một phiếu sửa chữa, nhân viên sẽ có thể cần dùng linh kiện để xử lý. Nhân viên chỉ việc thêm linh kiện vào phiếu là xong. Phần quản lý tồn kho sẽ xử lý sau này

## Linh kiện & Kho (đã chốt)

- Khi thêm linh kiện vào phiếu: CHỈ ghi log sử dụng, KHÔNG trừ tồn kho ngay lúc này.
  - Bản ghi sử dụng bao gồm: `part_id`, `quantity`, `unit_cost_at_use` (giá vốn tại thời điểm dùng), `unit_price_at_use` (nếu có), `notes`, `warranty_months` (tùy chọn), `used_at`.
  - Mục tiêu: phục vụ kỹ thuật và tính chi phí phiếu; tồn kho thực thụ sẽ làm sau.
- Kho hiện tại: chỉ quản lý danh mục linh kiện, để tồn kho mặc định 10000 (ảo) nhằm không chặn thao tác.
- Đồng bộ với cửa hàng (bán lẻ): CHƯA triển khai trừ kho/đồng bộ. Sau này sẽ nghiên cứu đồng bộ hai luồng “sửa chữa” và “bán”.

## Thanh toán (đã chốt)

- Mức lưu: Đơn giản, KHÔNG quản lý VAT/hóa đơn ở giai đoạn này.
- Trường đề xuất trên phiếu:
  - `total_cost` (tổng chi phí, gồm công + linh kiện)
  - `deposit_amount` (tiền cọc, nếu có)
  - `is_paid` (boolean)
  - `paid_at` (timestamp khi đánh dấu đã thanh toán)
  - `payment_method` (tùy chọn: tiền mặt/chuyển khoản/khác)
  - `receipt_note` (tùy chọn ghi chú hóa đơn/biên nhận nội bộ)
- Ràng buộc quy trình: Chỉ chuyển từ `ready_for_pickup` → `completed` khi `is_paid=true` (nhân viên thao tác thủ công).
- Biên nhận/Ký nhận: Có thể lưu ảnh/biên bản dưới dạng đính kèm (private) nếu cần; chưa bắt buộc.

## Bảo hành (đã chốt)

- Mô hình: Bảo hành THEO PHIẾU.
- Trường trên phiếu: `warranty_until` (date/timestamp) — ngày hết hạn bảo hành của toàn bộ dịch vụ trên phiếu.
- Thiết lập: Điền khi hoàn tất phiếu (completed). Có thể nhập thủ công số tháng bảo hành để hệ thống tính `warranty_until` (hoặc nhập trực tiếp ngày); giá trị mặc định/thời lượng sẽ xác định trong thiết lập sau này nếu cần.
- Hiển thị công khai: Trong trang tra cứu, nếu phiếu đã completed và có `warranty_until`, hiển thị ngày hết hạn cho khách.
- Không áp dụng bảo hành theo từng linh kiện ở giai đoạn này (đơn giản hóa vận hành).

## Audit log (đã chốt)

- Chưa cần audit log ở giai đoạn đầu. Không ghi lịch sử chi tiết ai đổi trạng thái/ai thêm linh kiện.
- Vẫn duy trì các trường thời gian cơ bản trên bản ghi (created_at/updated_at) để tham chiếu.
- Có thể bổ sung audit log cơ bản sau: tạo/cập nhật phiếu, đổi trạng thái, thêm/xóa linh kiện.

## Đa chi nhánh (đã chốt)

- Chưa triển khai đa chi nhánh. KHÔNG thêm `branch_id` vào các bảng ở giai đoạn này.
- Khi có nhu cầu mở rộng sau này, sẽ bổ sung trường `branch_id` và cập nhật RLS/UX tương ứng.

## Nội dung từ WordPress (đã chốt)

- Không migrate dữ liệu từ WordPress ở giai đoạn đầu. Sẽ nhập/thêm thủ công các bài viết/sản phẩm cần thiết theo layout mới.
- Chưa yêu cầu giữ nguyên slug hay thiết lập redirect 301. Có thể bổ sung sau nếu triển khai SEO/migration.
- `sitemap.xml` và OpenGraph: có thể bổ sung sau khi hoàn thiện nội dung cơ bản.
- Nếu cần lấy lại nội dung cũ sau này: sẽ mô tả WP REST API endpoints và mapping fields riêng.

## PWA & UX (đã chốt)

- Scope offline: CHỈ áp dụng cho các trang public (app shell + nội dung tĩnh). Dashboard KHÔNG hỗ trợ offline, yêu cầu online do phụ thuộc auth/RLS.
- Caching strategy (gợi ý ban đầu):
  - App shell: precache (stale-while-revalidate)
  - Assets tĩnh (CSS/JS/fonts/images công khai): cache-first với versioning
  - API public (nếu có): network-first
  - API có auth (dashboard): network-only
- Manifest: tên ứng dụng, biểu tượng, màu chủ đạo; ngôn ngữ ưu tiên: vi-VN.
- Push Notification: chưa bật; có thể tích hợp Web Push sau.

## Đào tạo (đã chốt)

- Phạm vi: Chỉ hiển thị thông tin khóa học ở trang public.
- Trường thông tin: tên khóa, mô tả, lịch khai giảng, học phí, thời lượng, hotline.
- CTA: gọi điện liên hệ; KHÔNG có form đăng ký ở giai đoạn này, không lưu DB ghi danh.
- Mở rộng tương lai: có thể bổ sung form đăng ký cơ bản và RLS/qui trình xử lý lead.

## Sản phẩm bán (public) — đã chốt

- Hành vi: Chỉ CTA gọi điện, KHÔNG có giỏ hàng/thanh toán online.
- Bộ lọc cơ bản (trên danh sách): Hãng (brand), CPU, RAM, khoảng giá.
- Trường hiển thị trên chi tiết sản phẩm: tên, mô tả, hình ảnh (nhiều ảnh), tình trạng, bảo hành, giá niêm yết, cấu hình (CPU/RAM/SSD/Màn/PIN/cân nặng nếu có).
- Slug/SEO: Chưa yêu cầu giữ slug từ WordPress hoặc redirect 301 ở giai đoạn này (xem phần WordPress).
- Ảnh: Không quy định giới hạn riêng (tuân theo storage chung); có thể bổ sung resize/thumbnail khi cần.

## Tra cứu công khai (không OTP) — đã chốt

- Xác thực: Không yêu cầu OTP SMS. Người dùng chỉ cần nhập số điện thoại để tra cứu.
- Kết quả tra cứu: Liệt kê các phiếu gắn với số điện thoại đó.
- Trường hiển thị cho khách:
  - Mã phiếu (`ticket_code`)
  - Thiết bị (hãng/model, nếu có)
  - Trạng thái hiện tại (nhãn dành cho khách hàng)
  - Thời điểm cập nhật gần nhất
  - Ngày hết bảo hành (nếu phiếu đã hoàn thành và có bảo hành)
- Không hiển thị: ảnh, comment nội bộ, chi tiết kỹ thuật, chi phí, nhân viên phụ trách.
- Riêng tư: Chỉ đọc; không cho phép thay đổi dữ liệu. Có thể bổ sung rate-limit/CAPTCHA nếu cần chống spam sau này.


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

  Timeout Rules (tham khảo vận hành, KHÔNG tự động):

  - awaiting_repair_plan: 7 ngày → đề nghị chuyển cancelled_by_customer (nhân viên thao tác thủ công)
  - ready_for_pickup: 30 ngày → đề nghị chuyển customer_no_show (nhân viên thao tác thủ công)
  - customer_no_show: 90 ngày → đề nghị chuyển abandoned (nhân viên thao tác thủ công)

  Ghi chú: Không có cơ chế auto-transition tại thời điểm này. Có thể bổ sung sau bằng cron hoặc Edge Function nếu cần.

  Hệ thống này giúp nhân viên quản lý kỹ thuật chi tiết trong khi khách hàng nhận được thông tin dễ hiểu và phù hợp!


## Trường xác nhận tối giản cho chuyển trạng thái (đã chốt)

Các trường dữ liệu tối thiểu để ràng buộc 4 điều kiện bắt buộc khi chuyển trạng thái:

- has_issue_report (boolean)
- customer_approved_at (timestamp)
- customer_approved_by (uuid tham chiếu user) — tùy chọn nhưng khuyến nghị
- repair_completed_at (timestamp)
- repair_completed_by (uuid tham chiếu user) — tùy chọn nhưng khuyến nghị
- paid_at (timestamp) — sử dụng cùng với `is_paid` trong mục Thanh toán
- paid_by (uuid tham chiếu user) — tùy chọn

Ánh xạ vào điều kiện chuyển trạng thái:
- preliminary_inspection → awaiting_repair_plan: yêu cầu has_issue_report = true
- awaiting_repair_plan → approved_for_repair: yêu cầu customer_approved_at NOT NULL (customer_approved_by nếu dùng)
- in_repair → quality_testing: yêu cầu repair_completed_at NOT NULL (repair_completed_by nếu dùng)
- ready_for_pickup → completed: yêu cầu is_paid = true và paid_at NOT NULL

Ghi chú:
- Trường “by” (người xác nhận) là tùy chọn để đơn giản hóa ban đầu; có thể bật bắt buộc sau này nếu cần audit chi tiết.

## Tech Stack (đã chốt)

Dựa trên tài liệu `docs/architecture/tech-stack.md`, các công nghệ chính được sử dụng trong dự án bao gồm:

- **Frontend:**
  - **Framework:** React 19, TypeScript, Vite
  - **Routing:** TanStack Router (file-based)
  - **UI:** Tailwind CSS, shadcn/ui, Radix UI, Lucide React
  - **Form:** React Hook Form với Zod để xác thực
- **Backend:**
  - **Nền tảng:** Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Development & Tooling:**
  - **Linting/Formatting:** Biome
  - **Testing:** Vitest, Testing Library
  - **Package Manager:** pnpm
- **Deployment:**
  - **Containerization:** Docker và Docker Compose

Toàn bộ hệ thống được thiết kế để chạy trong một môi trường container hóa, đảm bảo tính nhất quán và dễ dàng triển khai.


