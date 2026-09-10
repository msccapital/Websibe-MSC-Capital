# Hướng dẫn sử dụng website MSC Capital

## Cấu trúc
- `index.html` — Trang chủ
- `blog.html` — Danh sách bài viết, lọc theo chủ đề
- `bai-viet.html` — Trang chi tiết 1 bài viết (dùng chung 1 file, nội dung đổi theo `?slug=...` trên URL)
- `uu-dai.html` — Trang ưu đãi
- `js/data.js` — **File duy nhất bạn cần sửa để đăng bài mới hoặc thêm ưu đãi mới**
- `css/style.css` — Giao diện (chỉ sửa nếu muốn đổi màu/font)

## Cách đăng bài viết mới
1. Mở file `js/data.js` bằng bất kỳ trình soạn thảo văn bản nào (Notepad, VS Code...).
2. Copy một khối bài viết có sẵn trong mảng `MSC_POSTS` (từ dấu `{` đến dấu `}`), dán thêm một bản ngay bên dưới.
3. Sửa lại: `slug` (đường dẫn, viết liền không dấu), `category`, `title`, `excerpt`, `author`, `date` (định dạng NĂM-THÁNG-NGÀY), và các đoạn văn trong `content`.
4. Nếu bài có video YouTube: lấy ID video trong đường link (phần sau `v=`) và điền vào `youtubeId`. Nếu không có video, để `youtubeId: ""`.
5. Lưu file — bài viết sẽ tự động xuất hiện trên trang chủ, trang Blog và có trang riêng tại `bai-viet.html?slug=...`.

## Cách thêm ưu đãi mới
Tương tự — copy một khối trong mảng `MSC_PROMOTIONS`, sửa `title`, `description`, `ctaText`, `ctaLink` (đường link đăng ký thật), `tag`.

## Cách đưa website lên mạng (hosting)
Đây là website tĩnh (HTML/CSS/JS thuần), không cần server hay cơ sở dữ liệu, nên có thể host miễn phí bằng:
- **Netlify** hoặc **Vercel**: kéo-thả cả thư mục này vào là chạy.
- **GitHub Pages**: đẩy thư mục lên một repository rồi bật Pages.
- Hoặc upload lên hosting/cPanel hiện có của công ty (qua FTP) nếu MSC đã có tên miền riêng.

## Thanh chỉ số thị trường (VN-Index, VN30, HNX, HNX30, UPCOM)
Thanh chạy ngang dưới menu, hiển thị biến động các chỉ số, được nhúng từ **TradingView** — một nhà cung cấp dữ liệu tài chính uy tín, dùng miễn phí, không cần backend hay API key riêng.

**Lưu ý quan trọng:**
- Đây KHÔNG phải dữ liệu do MSC tự thu thập — trang là website tĩnh (không có server) nên không thể tự kết nối trực tiếp tới sàn giao dịch. Nhúng widget của một nguồn dữ liệu đã được cấp phép là cách khả thi, hợp pháp và không tốn phí duy nhất cho một website dạng này.
- Dữ liệu có độ trễ nhỏ (thường vài giây đến vài phút tuỳ thị trường), không phải tick-by-tick tuyệt đối theo mili-giây — đây là giới hạn chung của mọi nguồn miễn phí, kể cả các nguồn các công ty chứng khoán lớn cũng áp dụng độ trễ tương tự cho phiên bản miễn phí.
- Cả 5 mã đã được xác nhận trực tiếp trên TradingView: `HOSE:VNINDEX`, `HOSE:VN30`, `HNX:HNXINDEX`, `HNX:300` (HNX30 — bản Total Return, TradingView chỉ niêm yết dạng này), `HNX:301` (UPCOM Index). Ba mã đầu độ tin cậy rất cao; hai mã cuối là mã số ít phổ biến hơn nên khi web chạy thật, nên liếc qua một lần xem số hiển thị có hợp lý không (HNX30 thường dao động vùng vài trăm điểm).
- Nếu muốn dữ liệu thật sự tức thời (real-time từng tick) để giao dịch, cần mua gói dữ liệu có bản quyền từ công ty chứng khoán (SSI FastConnect, VNDIRECT, TCBS...) và dựng thêm một backend riêng để giữ khoá API — vượt ngoài phạm vi một website giới thiệu/blog như thế này.

## Việc cần làm trước khi vận hành chính thức
- Thay các đường link `#lien-he`, `ctaLink`, fanpage/YouTube ở footer bằng link thật.
- Thay email `lienhe@msccapital.vn` bằng email thật của công ty.
- Bổ sung thông tin pháp lý chính xác ở footer (giấy phép hoạt động tư vấn đầu tư, nếu áp dụng).
- Form đăng ký nhận bản tin hiện chưa nối với hệ thống gửi email thật — cần nối với một dịch vụ email marketing (Mailchimp, GetResponse...) hoặc form của bên thứ ba (Google Form) nếu muốn thu thập email thật.
