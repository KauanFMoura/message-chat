import os
from datetime import timedelta


class Config:
    # Obtém o diretório atual de execução do script
    current_dir = os.path.abspath(os.path.dirname(__file__))

    # Define o diretório de upload como diretório atual + /data
    UPLOAD_FOLDER = os.path.join(current_dir, 'data')

    SECRET_KEY = 'secret!'
    SQLALCHEMY_DATABASE_URI = 'mysql://admin-whatsut:sd-utfpr-2024@localhost/whatsut'


    '''
    SQLALCHEMY_DATABASE_URI = 'mysql://admin-whatsut:sd-utfpr-2024@34.151.228.104/whatsut'
    SECRET_KEY = utils.get_secret_key()
    SQLALCHEMY_DATABASE_URI = utils.get_db_uri()'''
