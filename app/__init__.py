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
group_rooms = {}


class ObservableDict(dict):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.updated_callback = lambda key: None  # Callback padrão vazio
        self.deleted_callback = lambda key: None

    def __setitem__(self, key, value):
        super().__setitem__(key, value)
        print('Setted Item')
        self.updated_callback(key)

    def __delitem__(self, key):
        super().__delitem__(key)
        self.deleted_callback(key)

    def call_update(self, key):
        self.updated_callback(key)

    def set_updated_callback(self, callback):
        self.updated_callback = callback

    def set_deleted_callback(self, callback):
        self.deleted_callback = callback


def updated_callback(key):
    for group in connected_users[key]['groups']:
        if group not in group_rooms.keys():
            group_rooms[group] = [key]
        else:
            if key not in group_rooms[group]:
                group_rooms[group].append(key)
    print(f"Update callback:\nGroup Rooms:{group_rooms}\nConnected Users:{connected_users}\n")


def deleted_callback(key):
    # Lista temporária para armazenar as chaves dos grupos a serem modificados
    groups_to_modify = []

    # Iterar sobre as chaves do dicionário group_rooms
    for group in list(group_rooms.keys()):
        if key in group_rooms[group]:
            groups_to_modify.append(group)

    # Aplicar as modificações após a iteração
    for group in groups_to_modify:
        group_rooms[group].remove(key)
        if len(group_rooms[group]) == 0:
            del group_rooms[group]

    print(f"Delete callback:\nGroup Rooms:{group_rooms}\nConnected Users:{connected_users}\n")

    socketio.emit('user_update', connected_users)


# Lista de usuários conectados
connected_users = ObservableDict({})
connected_users.set_updated_callback(updated_callback)

connected_users.set_deleted_callback(deleted_callback)


from app import routes
from app import sockets
