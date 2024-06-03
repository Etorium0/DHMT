# [CS105] ScenePainter
ScenePainter là một Webapp dựng cảnh và mô phỏng hình học 3D.
## Giảng viên hướng dẫn
ThS. Cáp Phạm Đình Thăng
## Nhóm thực hiện
- Trần Nhật Khánh_2252
- Lê Anh Khôi_2252
- Huỳnh Lê Đan Linh_22520759
- Phạm Công Minh_2252

## Features
### Mesh & Light
| ***Geometry*** | ***Material*** | ***Light*** |
| ------------- | ------------- | ------------- |
| Cube | Basic | Ambient Light |
| Sphere | Phong | Spot Light |
| Cone | Lambert | Point Light |
| Cylinder | Toon | Directional Light |
| Torus |  | |
| Torus Knot |  | |

Có thể thêm nhiều object và sắp xếp nhiều nguồn sáng trong scene một cách tự do:
- Thay đổi vị trí, màu sắc
- Thay đổi cường độ, các thông số đặc trưng (với Light)
- Thay đổi góc quay, kích thước, loại material (với Mesh)

### Camera
- Điều chỉnh vị trí Camera
- Điều chỉnh điểm nhìn (LookAt) của Camera
- Điều chỉnh để Camera nhìn vào vị trí của Geometry được chọn.
- Điều chỉnh Field of View của Camera

### Texture
- Đổi material thành dạng Wire frame.
- Áp texture sẵn có vào mesh được chọn.
- Import thêm file ảnh làm texture mới.

### Animation
- Gắn animation cho mesh được chọn.
- Animation có thể stack.

## Các bước để chạy source code
### Cách 1: Sử dụng Visual Studio Code

1. Cài đặt Visual Studio Code
Link: https://code.visualstudio.com/download

2. Cài đặt NodeJs

3. Clone repository, mở bằng Visual Studio Code

4. Tại Console, chạy dòng lệnh ```npx vite``` để mở Server

### Cách 2: Truy cập trực tiếp tại https://huynhhuy1401.github.io/cs105-uit-final/

### Demo: 
- Drive: 
- Youtube: 

## Thư viện sử dụng
- ThreeJS
- Dat.GUI
- Tween.JS
