from flask import Flask
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy import text
from datetime import timedelta
from config import Config
import os

app = Flask(__name__)
app.config.from_object(Config)
db = SQLAlchemy(app)
socketio = SocketIO(app, cors_allowed_origins='*')
CORS(app)


def test_db_connection():
    try:
        # Tentando fazer uma consulta simples ao banco de dados
        db.session.execute(text("SELECT 1"))
        print("Conexão com o banco de dados bem-sucedida.")
    except Exception as e:
        print(f"Ocorreu um erro ao conectar com o banco de dados: {e}")
        quit(1)


with app.app_context():
    test_db_connection()


from app import routes
