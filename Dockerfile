# 使用 Nginx 作为基础镜像
FROM nginx:latest

# 设置作者信息（可选）
LABEL authors="Sean"

# 将本地的 Nginx 配置文件复制到容器中
COPY conf/* /etc/nginx/

# 将前端项目打包后的文件复制到 Nginx 的静态文件目录
COPY dist-prod /usr/share/nginx/html/easyadmin

# 声明容器运行时监听的端口
EXPOSE 9002

# 启动 Nginx 并保持前台运行
CMD ["nginx", "-g", "daemon off;"]