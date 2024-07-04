import os
from app import utils


class Config:
    # Obtém o diretório atual de execução do script
    current_dir = os.path.abspath(os.path.dirname(__file__))

    # Define o diretório de upload como diretório atual + /data
    UPLOAD_FOLDER = os.path.join(current_dir, 'data')

    SECRET_KEY = 'secret!'
    SQLALCHEMY_DATABASE_URI = 'mysql://admin-whatsut:sd-utfpr-2024@localhost/whatsut'

    '''ENV = 'production'
    DEBUG = False
    TESTING = False
    DEFAULT_GROUP_IMAGE = 'data/8dea7b4b-29f4-4bc2-bed1-a6496589b6e9.jpg'
    DEFAULT_PROFILE_IMAGE = 'data/0b203bc0-c286-4847-ba2d-7a0f9790fe03.jpg'
    SECRET_KEY = utils.get_secret_key()
    SQLALCHEMY_DATABASE_URI = utils.get_db_uri()'''