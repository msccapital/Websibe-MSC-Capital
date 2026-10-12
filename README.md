# MSC Capital — website

Website tĩnh (HTML/CSS/JS thuần, không cần build tool) cho MSC Capital — tư vấn đầu tư chứng khoán. Chạy trực tiếp trên **GitHub Pages**, không cần server riêng.

## Cấu trúc site

```
index.html         Trang chủ
dich-vu.html        Dịch vụ tư vấn đầu tư chứng khoán
uu-dai.html          Chương trình ưu đãi margin (4 gói, link ra Vietcap)
tin-tuc.html         Tin tức thị trường — tự động lấy từ nguồn khác (kiểu AI News)
blog.html            Danh sách bài viết blog
bai-viet.html        Trang chi tiết 1 bài viết (đọc ?slug=... )
tuyen-dung.html       Tuyển dụng, gồm chương trình Cộng tác viên giới thiệu (gắn link Vietcap)
lien-he.html          Liên hệ + form gửi yêu cầu tư vấn
css/style.css         Toàn bộ giao diện (đen / xanh lá / cam đậm)
js/include.js          Chèn header & footer dùng chung vào mỗi trang
js/news.js              Lấy tin tức từ nguồn ngoài (RSS)
js/blog.js               Hiển thị bài viết từ data/posts.json
data/posts.json          Nội dung các bài blog — sửa file này để đăng bài mới
components/header.html    Header + thanh giá chứng khoán (ticker) dùng chung
components/footer.html    Footer dùng chung
```

## 1. Đưa lên GitHub Pages

1. Tạo một repository mới trên GitHub, ví dụ `msc-capital`.
2. Copy toàn bộ nội dung thư mục này vào repo đó (giữ nguyên cấu trúc thư mục).
3. Commit & push lên nhánh `main`.
4. Vào **Settings → Pages** của repo → mục "Build and deployment" chọn **Deploy from a branch** → chọn nhánh `main`, thư mục `/ (root)` → Save.
5. Sau 1–2 phút, site sẽ chạy tại `https://<ten-tai-khoan>.github.io/msc-capital/`.

Muốn dùng tên miền riêng (ví dụ `msccapital.vn`): thêm file `CNAME` chứa tên miền vào thư mục gốc, và trỏ DNS của tên miền về GitHub Pages theo hướng dẫn của GitHub.

## 2. Xem thử trên máy trước khi đăng

Vì các trang dùng `fetch()` để nạp header/footer/dữ liệu, mở trực tiếp file HTML (`file://`) trên trình duyệt **sẽ không hiển thị đúng**. Cần chạy một server tĩnh đơn giản, ví dụ:

```bash
cd msc-capital
python3 -m http.server 8000
```

rồi mở `http://localhost:8000`.

## 3. Cách viết bài Blog (có gắn video, kiểu 24hmoney / Bò và Gấu)

Mở file `data/posts.json`, thêm một object mới **ở đầu mảng**:

```json
{
  "slug": "duong-dan-khong-dau-khong-dau-cach",
  "title": "Tiêu đề bài viết",
  "excerpt": "Mô tả ngắn 1-2 câu hiển thị ở trang danh sách.",
  "date": "2026-09-11",
  "author": "Tên tác giả",
  "tag": "Kiến thức đầu tư",
  "cover": "",
  "video": "",
  "content": [
    "Đoạn văn thứ nhất.",
    "Đoạn văn thứ hai."
  ]
}
```

- **Gắn video**: dán link nhúng YouTube vào `video`, dạng `https://www.youtube.com/embed/VIDEO_ID` (lấy `VIDEO_ID` từ URL video gốc, hoặc bấm Share → Embed trên YouTube). Để trống `""` nếu bài không có video.
- **Ảnh đại diện**: dán URL ảnh vào `cover` nếu bài không có video (bài có video sẽ tự lấy ảnh thumbnail từ YouTube).
- `slug` dùng làm đường dẫn bài viết (`bai-viet.html?slug=...`) — chỉ dùng chữ thường, số và dấu gạch ngang, không dấu, không khoảng trắng.
- Bài mới nhất nên để **ở đầu mảng** vì trang chủ chỉ hiển thị 3 bài đầu tiên.

Không cần công cụ soạn thảo — chỉnh trực tiếp file này ngay trên GitHub (nút bút chì ✏️) rồi Commit, site sẽ tự cập nhật.

## 4. Tin tức tự động (mục "Tin tức")

`js/news.js` lấy tin trực tiếp trong trình duyệt người xem, qua RSS của CafeF, VnExpress Kinh doanh và Vietstock (dùng proxy miễn phí rss2json.com để chuyển RSS → JSON, tránh lỗi CORS). Không cần chạy server hay API key cho lượng truy cập vừa phải.

- Muốn đổi nguồn tin: sửa mảng `FEEDS` ở đầu file `js/news.js`.
- Nếu site có lượng truy cập lớn và bị giới hạn tốc độ (rate limit) của rss2json.com: đăng ký một API key miễn phí tại rss2json.com rồi thêm `&api_key=...` vào hàm `buildProxyUrl()`.
- Nếu tất cả nguồn RSS đều lỗi (mất mạng, nguồn đổi cấu trúc…), trang sẽ tự hiển thị vài tin mẫu để trang không bị trống — đây là tin minh hoạ, không phải tin thật.

## 5. Ưu đãi margin (`uu-dai.html`)

Nội dung 4 gói vay được viết lại từ trang chính thức của Vietcap, có link "Xem tại Vietcap →" dẫn thẳng đến trang gốc để khách hàng đăng ký. **Lãi suất và điều kiện có thể thay đổi theo thời gian** — nên định kỳ đối chiếu lại với trang Vietcap và cập nhật số liệu trong `uu-dai.html` (và phần "Ưu đãi đang triển khai" ở `index.html`) nếu có thay đổi.

## 6. Những phần cần bạn tự điền / thay thế

- **Logo**: hiện dùng chữ "MSC" dạng khối trong `components/header.html` — có thể thay bằng file ảnh logo thật (`assets/img/logo.svg`) khi có.
- **Ticker giá chứng khoán** ở đầu trang (`VN-Index`, `VCB`, `FPT`…) hiện là **số liệu minh hoạ**, đã ghi chú rõ trong ticker — nếu muốn số liệu thật theo thời gian thực cần tích hợp thêm một API bảng giá (ngoài phạm vi một site tĩnh miễn phí).
- **Số liệu ở trang chủ** (lãi suất, mức hoa hồng…) lấy theo các gói ưu đãi hiện tại — cập nhật lại nếu Vietcap thay đổi chính sách.
- **Form liên hệ** dùng FormSubmit (miễn phí, không cần backend) gửi thẳng về `msccapitall@gmail.com`. Lần gửi thử đầu tiên, FormSubmit sẽ gửi một email xác nhận đến hộp thư này — cần bấm xác nhận thì các lượt gửi sau mới vào thẳng hộp thư.
- **Địa chỉ văn phòng** hiện để "TP. Hồ Chí Minh, Việt Nam" — điền địa chỉ cụ thể khi có.

## 7. Font & màu sắc

- Màu: đen (`--black`), xanh lá (`--green` các sắc độ), cam đậm (`--orange` các sắc độ) — khai báo ở đầu `css/style.css`, đổi ở đây sẽ áp dụng cho toàn site.
- Font: **Be Vietnam Pro** (tiêu đề), **Inter** (nội dung), **IBM Plex Mono** (số liệu, lãi suất, ticker) — tải qua Google Fonts, hỗ trợ đầy đủ dấu tiếng Việt.
