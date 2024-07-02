import os
import sqlalchemy
from sqlalchemy import URL
import uuid
import bcrypt


def get_db_uri() -> URL:
    """Constructs a SQLAlchemy URI for a Unix socket connection pool for a Cloud SQL instance of MySQL."""
    db_user = os.environ["DB_USER"]  # e.g. 'my-database-user'
    db_pass = os.environ["DB_PASS"]  # e.g. 'my-database-password'
    db_name = os.environ["DB_NAME"]  # e.g. 'my-database'
    unix_socket_path = os.environ["INSTANCE_UNIX_SOCKET"]  # e.g. '/cloudsql/project:region:instance'

    return sqlalchemy.engine.url.URL.create(
        drivername="mysql+pymysql",
        username=db_user,
        password=db_pass,
        database=db_name,
        query={"unix_socket": unix_socket_path},
    )


def get_secret_key() -> str:
    """Returns the secret key for the Flask app."""
    return os.environ["SECRET_KEY"]


def generate_filename(filename):
    """Gera um nome de arquivo único baseado no UUID com a extensão original."""
    ext = filename.split('.')[-1]  # Obtém a extensão do arquivo
    return str(uuid.uuid4()) + '.' + ext  # Retorna UUID + extensão


# Função para criar um hash de senha
def gen_hash_pasw(senha):
    return bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt())


# Função para verificar se a senha fornecida corresponde ao hash armazenado
def check_passwd(senha_digitada, senha_hash):
    return bcrypt.checkpw(senha_digitada.encode('utf-8'), senha_hash.encode('utf-8'))
