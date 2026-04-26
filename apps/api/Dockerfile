# Football Intel API - Alpine
FROM python:3.13-alpine

WORKDIR /app

RUN apk add --no-cache libgcc libffi musl

RUN pip install --no-cache-dir --break-system-packages \
    fastapi \
    uvicorn \
    psycopg2-binary \
    python-jose[cryptography] \
    bcrypt \
    pandas \
    python-multipart

COPY apps/api/main.py ./

EXPOSE 3001

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3001"]