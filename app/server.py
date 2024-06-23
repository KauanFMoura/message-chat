from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins='*')  # Permite acesso de todos os origins
CORS(app)

# Simula um banco de dados de usuários
users = {'a': 'a', 'b': 'b', 'c': 'c'}

# Dicionário para manter o controle das salas (rooms) de mensagens privadas
private_rooms = {}

# Lista de usuários conectados
connected_users = set()


@app.route('/')
def index():
    return render_template('login.html')


@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data['username']
        password = data['password']
        if username in users and users[username] == password:
            connected_users.add(username)
            return jsonify({'status': 'success', 'message': 'Login successful'})
        else:
            return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401
    except Exception as e:
        print(f"Erro no login: {e}")
        return jsonify({'status': 'error', 'message': 'An error occurred'}), 500


@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data['username']
        password = data['password']
        if username in users:
            return jsonify({'status': 'error', 'message': 'Username already exists'}), 409
        users[username] = password
        # Adiciona usuário à lista de conectados
        connected_users.add(username)
        return jsonify({'status': 'success', 'message': 'Registration successful'})
    except Exception as e:
        print(f"Erro no registro: {e}")
        return jsonify({'status': 'error', 'message': 'An error occurred'}), 500


@app.route('/chat')
def chat():
    print(f'Usuários conectados: {list(connected_users)}')
    return render_template('chat.html', users=list(connected_users))


@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('user_update', list(connected_users), broadcast=True)


@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')
    emit('user_update', list(connected_users), broadcast=True)


@socketio.on('join_room')
def on_join(data):
    username = data['username']
    room = data['room']

    # Cria a sala se ainda não existir
    if room not in private_rooms:
        private_rooms[room] = set()

    # Adiciona o usuário à sala
    join_room(room)
    private_rooms[room].add(username)

    print(f'{username} joined room {room}')
    emit('room_status', {'room': room, 'users': list(private_rooms[room])}, room=room, broadcast=True)


@socketio.on('leave_room')
def on_leave(data):
    username = data['username']
    room = data['room']

    # Remove o usuário da sala
    if room in private_rooms and username in private_rooms[room]:
        leave_room(room)
        private_rooms[room].remove(username)

    print(f'{username} left room {room}')
    emit('room_status', {'room': room, 'users': list(private_rooms[room])}, room=room, broadcast=True)


@socketio.on('message_private')
def handle_message(data):
    sender = data['sender']
    receiver = data['receiver']
    message = data['message']

    # Cria o nome da sala baseado no remetente e destinatário
    room = f"{sender}-{receiver}"  # Exemplo de nome único de sala para dois usuários

    # Garante que a sala seja criada e ambos os usuários estejam nela
    if room not in private_rooms:
        private_rooms[room] = set()

    private_rooms[room].add(sender)
    private_rooms[room].add(receiver)

    join_room(room)  # Junta ambos os usuários à sala

    # Envia a mensagem privada para a sala específica
    socketio.emit('private_message', {'sender': sender, 'message': message}, room=room)

    print(f'{sender} sent a private message to {receiver}')


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
