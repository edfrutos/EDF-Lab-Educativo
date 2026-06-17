FROM nginx:alpine

ARG DASHBOARD_API_BASE_URL=http://localhost:3100

COPY nginx.conf /etc/nginx/nginx.conf
COPY index.html styles.css /usr/share/nginx/html/
COPY app.js /tmp/app.js.source
RUN sed "s|const API_BASE_URL = 'http://localhost:3100';|const API_BASE_URL = '${DASHBOARD_API_BASE_URL}';|" \
    /tmp/app.js.source > /usr/share/nginx/html/app.js && \
    rm /tmp/app.js.source

EXPOSE 5173
