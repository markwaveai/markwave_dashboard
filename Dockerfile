# Use an official Nginx image
FROM nginx:alpine

# Replace default nginx config to support React Router (SPA)
RUN printf "server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
\n\
    location / {\n\
        try_files \$uri /index.html;\n\
    }\n\
}\n" > /etc/nginx/conf.d/default.conf

# Copy React build files
COPY ./build /usr/share/nginx/html

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]