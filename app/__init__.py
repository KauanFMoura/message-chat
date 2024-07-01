from flask import Flask, jsonify
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from flask_cors import CORS
from datetime import timedelta
from config import Config
import os


app = Flask(__name__)
app.config.from_object(Config())
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

# Dicionário para manter o controle das salas (rooms) de mensagens privadas
private_rooms = {}


class ObservableDict(dict):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.update_callback = lambda: None  # Callback padrão vazio

    def __setitem__(self, key, value):
        super().__setitem__(key, value)
        self.update_callback()

    def __delitem__(self, key):
        super().__delitem__(key)
        self.update_callback()

    def set_update_callback(self, callback):
        self.update_callback = callback


# Lista de usuários conectados
connected_users = ObservableDict({})
connected_users.set_update_callback(lambda: socketio.emit('user_update', connected_users))

# Dicionário para manter o controle das salas (rooms) de mensagens privadas
private_rooms = {}
group_rooms = {}
groups = [
    {'name': 'Grupo A', 'admin': 'a', 'users': ['a', 'b'], 'requests': ['b', 'c']},
    {'name': 'Grupo B', 'admin': 'b', 'users': ['b', 'c'], 'requests': []}
]
message_database = {}

from app import routes
from app import sockets
