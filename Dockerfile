FROM python:3.11

# Instalar dependências do sistema necessárias para compilar mysqlclient e mariadb
RUN apt-get update && apt-get install -y \
    pkg-config \
    python3-dev \
    build-essential \
    default-libmysqlclient-dev \
    libmariadb-dev


# Set the working directory
WORKDIR /build

# Copy the current directory contents into the container at /build
COPY . ./

# Install the required dependencies
RUN pip install -r requirements.txt

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Run app.py when the container launches
CMD ["python", "app.py"]
