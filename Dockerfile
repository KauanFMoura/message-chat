FROM python:3.10

# Instalar dependências do sistema necessárias para compilar mysqlclient e mariadb
RUN apt-get update && apt-get install -y \
    libssl-dev \
    pkg-config \
    python3-dev \
    build-essential \
    default-libmysqlclient-dev \
    libmariadb-dev

# Definir variáveis de ambiente
ENV PORT 8080
ENV HOST 0.0.0.0

ENV DB_USER=admin-whatsut
ENV DB_PASS=sd-utfpr-2024
ENV DB_NAME=whatsut
ENV INSTANCE_UNIX_SOCKET=/cloudsql/ancient-spark-422614-h6:southamerica-east1:pi1
ENV SECRET_KEY=x29s0WiWZQOT0bBXoA8aJpISmXPBYAeW
ENV CLOUD_STORAGE_BUCKET=whats-ut
ENV FLASK_APP=app.py
ENV FLASK_ENV=development

# Definir a variável de ambiente para dizer ao Flask para rodar no modo produção
ENV FLASK_ENV=production
# Definir o diretório de trabalho
WORKDIR /app

# Copiar o conteúdo atual para o contêiner em /app
COPY . .



# Instalar as dependências
RUN pip install --no-cache-dir -r requirements.txt

# Expor a porta 8080 para acesso externo
EXPOSE 8080

# Executar o app.py quando o contêiner for iniciado
CMD ["python", "app.py"]