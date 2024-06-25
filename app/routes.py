from flask import render_template, request, jsonify, session, redirect, url_for
from flask_socketio import emit, join_room, leave_room
from app import app, socketio


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
            session['username'] = username
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
        session['username'] = username
        return jsonify({'status': 'success', 'message': 'Registration successful'})
    except Exception as e:
        print(f"Erro no registro: {e}")
        return jsonify({'status': 'error', 'message': 'An error occurred'}), 500

@app.route('/chat')
def chat():
    if 'username' not in session:
        return redirect(url_for('index'))
    username = session['username']
    print(f'Usuários conectados: {list(connected_users)}')
    return render_template('chat.html', users=list(connected_users), username=username)


@socketio.on('connect')
def handle_connect():
    username = session.get('username')
    if username:
        print(f'{username} connected')
        emit('user_update', list(connected_users), broadcast=True)


@socketio.on('disconnect')
def handle_disconnect():
    username = session.get('username')
    if username and username in connected_users:
        connected_users.remove(username)
        print(f'{username} disconnected')
        emit('user_update', list(connected_users), broadcast=True)
        emit('disconnect', username, broadcast=False)  # Emitir evento para o cliente que se desconectou


@socketio.on('user_back_online')
def handle_user_back_online():
    username = session.get('username')
    if username:
        connected_users.add(username)
        print(f'Usuários conectados: {list(connected_users)}')
        print(f'{username} is back online')
        emit('user_update', list(connected_users), broadcast=True)
    else:

        print('Unauthorized access')  # Lida com o caso em que o usuário não está autenticado corretamente


@socketio.on('join_room')
def on_join(data):
    username = data['username']
    room = data['room']

    if room not in private_rooms:
        private_rooms[room] = set()

    join_room(room)
    private_rooms[room].add(username)

    print(f'{username} joined room {room}')
    emit('room_status', {'room': room, 'users': list(private_rooms[room])}, room=room, broadcast=True)


@socketio.on('leave_room')
def on_leave(data):
    username = data['username']
    room = data['room']

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

    room = f"{sender}-{receiver}"

    if room not in private_rooms:
        private_rooms[room] = set()

    private_rooms[room].add(sender)
    private_rooms[room].add(receiver)

    join_room(room)

    socketio.emit('private_message', {'sender': sender, 'message': message}, room=room)

    print(f'{sender} sent a private message to {receiver}')

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
